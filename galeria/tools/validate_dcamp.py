#!/usr/bin/env python3
"""Valida un archivo .dcamp (campaña) contra el catálogo extraído del juego.

    python3 tools/validate_dcamp.py campana.dcamp [otra.dcamp ...]

Comprueba también los .dmap a los que apunta, buscándolos junto al .dcamp.
Sale con código 1 si algo tiene errores. Los avisos no hacen fallar.

La comprobación que de verdad importa es la última: que se pueda llegar a todos
los nodos. Una campaña donde el tercer escenario exige haber terminado el cuarto
no falla al cargar — falla cuando alguien lleva dos horas jugando.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / "tools"

sys.path.insert(0, str(TOOLS))
import validate_dmap                                    # noqa: E402


def load(name):
    return json.loads((TOOLS / name).read_text(encoding="utf-8"))


DATA = load("editor_data.json")
WORLD = load("world.json")

QUESTS = {q["id"] for q in WORLD.get("quests", [])}
CHARACTERS = {c["id"] for c in WORLD.get("characters", [])}
ITEMS = {i["id"] for i in DATA.get("loot", [])} | {i["id"] for i in DATA.get("consumables", [])}
# recetas y materiales de fabricación: los pide una consecuencia concreta y son
# los únicos identificadores que el autor escribe sin ponerlos en ningún sitio
RECETAS = validate_dmap.RECETAS
ACTO_RECETA = validate_dmap.ACTO_RECETA
MATERIALES = validate_dmap.MATERIALES
CANVAS = (WORLD.get("map") or {}).get("canvas", [1600, 900])
# lo que el mod sabe dar al empezar (`Campana.InventarioInicial` → `GetItem`):
# equipo, recetas, consumibles, piezas de arma, materiales y cartas de botín
# (estas, en materiales). Las armas enteras no: `GetItem` no las busca.
INICIO = (ITEMS | {g["id"] for g in DATA.get("gear", [])} | set(RECETAS) | set(MATERIALES)
          | {w["id"] for w in DATA.get("weaponParts", [])})
# (los consumibles se aceptan en el catálogo pero el mod se los salta: el juego
# los borra al cargar el mapa del mundo; se avisa abajo)
HABILIDADES = {h["id"] for h in DATA.get("skills", [])}

MARKERS = {"main", "side", "narrative", "city"}   # «city»: visita a la ciudad (de Bigorna)
KINDS = {"scenario", "dialogue"}
DLG_TYPES = {"normal", "choice", "virtue", "challenge", "heroSelect", "enemySelect", "interact",
             "cutscene"}   # «cutscene»: una cinemática del juego en lugar del cuadro
# se aceptan para no romper campañas viejas, pero el mod los pinta como texto
TIPOS_VIEJOS = {"challenge", "heroSelect", "enemySelect", "interact"}

# acción -> campos que tiene que traer rellenos
ACTIONS = {
    "unlockNode": ("node",),
    "completeNode": ("node",),
    "startScenario": ("map",),
    "showDialogue": ("dialogue",),
    "giveItem": ("item",),
    "giveMaterials": ("n",),
    "giveRecipe": ("recipe",),
    "removeMaterials": ("material", "qty"),
    "setVar": ("var", "value"),
    "addVar": ("var", "value"),
    "giveGold": ("n",),
}

Report = validate_dmap.Report


def validate(doc, base: Path):
    rep = Report()

    if doc.get("format") != "dcamp":
        rep.err("el campo «format» debe ser \"dcamp\"")
    if doc.get("version") not in (1,):
        rep.warn(f"versión de formato desconocida: {doc.get('version')}")

    meta = doc.get("meta", {})
    if not meta.get("name"):
        rep.err("meta.name está vacío")
    if not meta.get("id"):
        rep.warn("meta.id está vacío: el mod reconoce los destinos de la campaña por él")
    if meta.get("act") not in (None, "I", "II", "III"):
        rep.err(f"meta.act «{meta.get('act')}» no es I, II ni III")

    if doc.get("text"):
        rep.warn("text: los textos por idioma se conservan, pero el mod todavía no los "
                 "aplica; en partida salen los de «name», «description» y «text»")

    nodes = doc.get("nodes", [])
    dialogues = doc.get("dialogues", [])
    if not nodes:
        rep.err("la campaña no tiene ningún nodo")

    node_ids, dlg_ids = set(), set()
    for i, d in enumerate(dialogues):
        did = d.get("id")
        etiqueta = f"diálogo #{i + 1}" + (f" «{did}»" if did else "")
        if not did:
            rep.err(f"{etiqueta}: sin identificador")
        elif did in dlg_ids:
            rep.err(f"{etiqueta}: identificador repetido")
        else:
            dlg_ids.add(did)
        if d.get("type") not in DLG_TYPES:
            rep.err(f"{etiqueta}: tipo «{d.get('type')}» desconocido")
        if d.get("type") == "cutscene":
            if not d.get("cutscene"):
                rep.err(f"{etiqueta}: es una cinemática pero no dice cuál")
        elif not (d.get("text") or "").strip():
            rep.err(f"{etiqueta}: no dice nada (texto vacío)")
        si = d.get("onlyIf")
        if si is not None and (not isinstance(si, dict) or not si.get("var")):
            rep.err(f"{etiqueta}: «solo si» sin variable")
        sp = d.get("speaker")
        if sp and sp not in CHARACTERS:
            rep.err(f"{etiqueta}: «{sp}» no es un personaje del juego")
        # el cuadro de la campaña oficial (StoryMessages) pinta cuatro caras como
        # mucho, contando la del que habla
        reparto = d.get("cast") or []
        for c in reparto:
            if c not in CHARACTERS:
                rep.err(f"{etiqueta}: «{c}» no es un personaje del juego")
        en_escena = len(reparto) + (1 if sp else 0)
        if en_escena > 4:
            rep.err(f"{etiqueta}: {en_escena} personajes en escena; el cuadro del juego "
                    "pinta 4 como mucho")
        if sp and sp in reparto:
            rep.warn(f"{etiqueta}: «{sp}» habla y además está en el reparto; sobra una vez")
        if d.get("type") in TIPOS_VIEJOS:
            rep.warn(f"{etiqueta}: el tipo «{d.get('type')}» no lo lleva el mod; en partida "
                     "sale como texto normal")
        # (antes estas comprobaciones vivían dentro del bucle de «y después» y
        # solo se hacían con los diálogos que encadenaban con otro)
        if d.get("type") == "choice" and not d.get("options"):
            rep.err(f"{etiqueta}: es de elección múltiple pero no tiene opciones")
        if len(d.get("options") or []) > 5:
            rep.err(f"{etiqueta}: {len(d['options'])} opciones; el cuadro del juego admite 5")
        # la virtud, como el juego: un héroe y sus dos virtudes (14-oct)
        if d.get("type") == "virtue":
            heroe = d.get("hero")
            if heroe and heroe not in {h["id"] for h in DATA.get("heroes", [])}:
                rep.err(f"{etiqueta}: el héroe «{heroe}» no existe")
            elif not heroe:
                rep.warn(f"{etiqueta}: es de virtud pero no dice qué héroe elige; "
                         "saldrá como una elección normal")
            peso = d.get("weight", 1)
            if not isinstance(peso, int) or peso < 1:
                rep.err(f"{etiqueta}: el peso de la virtud debe ser un entero de 1 en adelante")
            if len(d.get("options") or []) > 2:
                rep.warn(f"{etiqueta}: una virtud tiene dos botones; sobran opciones")

    # ---- cadenas de «y después» ----
    # Van fuera del bucle de arriba a propósito: `dlg_ids` se llena ahí mismo, y
    # un diálogo puede encadenar con otro que se declare más abajo en el archivo.
    por_id = {d.get("id"): d for d in dialogues if d.get("id")}
    for d in dialogues:
        sig = d.get("next")
        if not sig:
            continue
        quien = d.get("title") or d.get("id")
        if sig == d.get("id"):
            rep.err(f"diálogo «{quien}»: se encadena a sí mismo")
            continue
        if sig not in dlg_ids:
            rep.err(f"diálogo «{quien}»: encadena «{sig}», que no existe")
            continue
        # ¿la cadena da vueltas?
        vistos, actual = {d.get("id")}, por_id.get(sig)
        while actual is not None and actual.get("next"):
            if actual["next"] in vistos:
                rep.err(f"diálogo «{quien}»: la cadena de «y después» da vueltas y no "
                        f"termina nunca (pasa por «{actual['next']}»)")
                break
            vistos.add(actual["next"])
            actual = por_id.get(actual["next"])
    # ---- nodos ----
    for i, n in enumerate(nodes):
        nid = n.get("id")
        etiqueta = f"nodo #{i + 1}" + (f" «{n.get('name') or nid}»" if (n.get('name') or nid) else "")
        if not nid:
            rep.err(f"{etiqueta}: sin identificador")
        elif nid in node_ids:
            rep.err(f"{etiqueta}: identificador «{nid}» repetido")
        else:
            node_ids.add(nid)

        if not (n.get("name") or "").strip():
            rep.warn(f"{etiqueta}: sin nombre visible")
        if n.get("marker") not in MARKERS:
            rep.err(f"{etiqueta}: marcador «{n.get('marker')}» desconocido")
        if n.get("kind") not in KINDS:
            rep.err(f"{etiqueta}: tipo «{n.get('kind')}» desconocido")

        coords = n.get("coords")
        if (not isinstance(coords, list) or len(coords) != 2
                or not all(isinstance(c, (int, float)) for c in coords)):
            rep.err(f"{etiqueta}: coordenadas mal puestas")
        else:
            mx, my = CANVAS[0] / 2, CANVAS[1] / 2
            if not (-mx <= coords[0] <= mx and -my <= coords[1] <= my):
                rep.err(f"{etiqueta}: {coords} cae fuera del mapa "
                        f"(x ±{mx:.0f}, y ±{my:.0f})")

        if n.get("kind") == "scenario":
            m = n.get("map")
            if not m:
                rep.err(f"{etiqueta}: es un escenario pero no dice qué .dmap se juega")
            elif not (base / m).exists():
                rep.err(f"{etiqueta}: no encuentro «{m}» junto al .dcamp")

        for campo in ("onArrive", "onTravel", "onComplete"):
            v = n.get(campo)
            if v and v not in dlg_ids:
                rep.err(f"{etiqueta}: {campo} usa el diálogo «{v}», que no existe")

        rec = n.get("rewards") or {}
        for it in rec.get("items", []):
            if it not in ITEMS:
                rep.err(f"{etiqueta}: la recompensa «{it}» no existe en el catálogo")
        oro = rec.get("gold", 0)
        if not isinstance(oro, int) or oro < 0:
            rep.err(f"{etiqueta}: el oro de la recompensa debe ser un entero de 0 en adelante")
        if n.get("marker") == "city" and n.get("kind") != "dialogue":
            rep.err(f"{etiqueta}: una visita a la ciudad tiene que ser de conversación, no un escenario")
        qta = (n.get("spawn") or {}).get("questsThisAct", 0)
        if not isinstance(qta, int) or isinstance(qta, bool) or qta < 0:
            rep.err(f"{etiqueta}: «misiones del acto» debe ser un entero de 0 en adelante")
        el = (n.get("spawn") or {}).get("choice")
        if el is not None and (not isinstance(el, dict) or not el.get("var")):
            rep.err(f"{etiqueta}: «solo si se eligió» sin variable")

    # ---- referencias entre nodos (ya con todos los ids conocidos) ----
    for n in nodes:
        etiqueta = f"nodo «{n.get('name') or n.get('id')}»"
        sp = n.get("spawn") or {}
        for a in sp.get("afterNodes", []):
            if a == n.get("id"):
                rep.err(f"{etiqueta}: se exige a sí mismo, así que nunca aparecería")
            elif a not in node_ids:
                rep.err(f"{etiqueta}: espera al nodo «{a}», que no existe")
        ocultan = sp.get("hideAfterNodes", [])
        if not isinstance(ocultan, list):
            rep.err(f"{etiqueta}: «desaparece al completar» tiene que ser una lista de nodos")
            ocultan = []
        for a in ocultan:
            if a == n.get("id"):
                rep.err(f"{etiqueta}: desaparece al completarse a sí mismo; un nodo completado ya se va")
            elif a not in node_ids:
                rep.err(f"{etiqueta}: desaparece al completar «{a}», que no existe")
            elif a in sp.get("afterNodes", []):
                rep.err(f"{etiqueta}: necesita «{a}» para salir y desaparece al completarlo: no se vería nunca")
        for q in sp.get("afterQuests", []):
            if q not in QUESTS:
                rep.err(f"{etiqueta}: espera la misión «{q}», que no es del juego")
        if sp.get("afterQuests"):
            rep.warn(f"{etiqueta}: espera a misiones del juego, que en una campaña de la "
                     "comunidad no se juegan; solo saldrá si un diálogo lo desbloquea")

    # ---- la apertura ----
    # Sale en el mapa del mundo, donde solo existe el cuadro con caras.
    intro = doc.get("intro")
    if intro:
        di = por_id.get(intro)
        if di is None:
            rep.err(f"intro: el diálogo «{intro}» no existe")
        elif not di.get("speaker") and not di.get("cast"):
            rep.warn(f"intro: «{intro}» no tiene a nadie en escena; en el mapa del mundo solo "
                     "se puede pintar el cuadro con caras")

    # ---- acciones de diálogo ----
    for d in dialogues:
        if d.get("skipTo") and d.get("skipTo") not in dlg_ids:
            rep.err(f"diálogo «{d.get('id')}»: si no sale, salta a «{d.get('skipTo')}», que no existe")
        listas = [(f"diálogo «{d.get('id')}», al cerrarse", d.get("actions") or [], None)]
        listas += [(f"diálogo «{d.get('id')}», opción {oi + 1}", o.get("then") or [], o)
                   for oi, o in enumerate(d.get("options") or [])]
        for donde, acciones, o in listas:
            if o is not None and not (o.get("text") or "").strip():
                rep.err(f"{donde}: sin texto")
            for a in acciones:
                acc = a.get("action")
                if acc not in ACTIONS:
                    rep.err(f"{donde}: acción «{acc}» desconocida")
                    continue
                for campo in ACTIONS[acc]:
                    if a.get(campo) in (None, ""):
                        rep.err(f"{donde}: la acción «{acc}» necesita «{campo}»")
                if acc in ("unlockNode", "completeNode") and a.get("node") not in node_ids:
                    rep.err(f"{donde}: «{acc}» apunta al nodo «{a.get('node')}», que no existe")
                if acc == "showDialogue" and a.get("dialogue") not in dlg_ids:
                    rep.err(f"{donde}: encadena el diálogo «{a.get('dialogue')}», que no existe")
                if acc == "giveItem" and a.get("item") not in ITEMS:
                    rep.err(f"{donde}: el objeto «{a.get('item')}» no existe")
                if acc == "giveRecipe":
                    if a.get("recipe") not in RECETAS:
                        rep.err(f"{donde}: la receta «{a.get('recipe')}» no existe")
                    elif ACTO_RECETA.get(a.get("recipe")) == 2:
                        rep.warn(f"{donde}: «{a.get('recipe')}» es una receta del Acto II; "
                                 "a quien no tenga esa caja no le llegará")
                if acc == "removeMaterials" and a.get("material") not in MATERIALES:
                    rep.err(f"{donde}: el material «{a.get('material')}» no existe")

    # ---- inventario de salida ----
    ini = doc.get("start")
    if ini is not None:
        if not isinstance(ini, dict):
            rep.err("start: debe ser un objeto con «gold» e «items»")
        else:
            oro = ini.get("gold", 0)
            if not isinstance(oro, int) or oro < 0:
                rep.err("start: «gold» debe ser un entero de 0 en adelante")
            consumibles = {c["id"] for c in DATA.get("consumables", [])}
            for it in ini.get("items") or []:
                cual = it.get("id") or it.get("item")
                if cual in consumibles:
                    rep.warn(f"start: «{cual}» es un consumible; el juego los borra al cargar el "
                             "mapa del mundo, que es justo después, y el mod se lo salta. Dalo "
                             "como recompensa o con «dar objeto»")
                elif cual not in INICIO:
                    rep.err(f"start: «{cual}» no existe en el catálogo")
                q = it.get("qty", 1)
                if not isinstance(q, int) or q < 1:
                    rep.err(f"start: la cantidad de «{cual}» debe ser un entero de 1 en adelante")
            hab = ini.get("skills") or []
            if not isinstance(hab, list):
                rep.err("start: «skills» tiene que ser una lista de habilidades")
                hab = []
            for h in hab:
                if HABILIDADES and h not in HABILIDADES:
                    rep.err(f"start: la habilidad «{h}» no existe")

    # ---- tienda ----
    # Como la del juego (14-oct): recetas y equipo, uno de cada, a su precio.
    # `qty` ya no se usa (el juego agota el artículo al comprarlo) y se ignora.
    vendibles = {r["id"] for r in DATA.get("recipes", [])} | {g["id"] for g in DATA.get("gear", [])}
    for it in (doc.get("shop") or {}).get("items", []):
        cual = it.get("id")
        if cual in vendibles:
            continue
        if cual not in ITEMS:
            rep.err(f"tienda: «{cual}» no existe en el catálogo")
        elif str(cual).startswith("LOOT_"):
            rep.warn(f"tienda: «{cual}» es una carta de botín y la tienda no la puede "
                     "vender; se salta en la partida. Pon una receta o equipo")
        else:
            rep.warn(f"tienda: «{cual}» es un consumible; el juego no los vende y vale 0, "
                     "así que saldría gratis. Pon una receta o equipo")

    # ---- ¿se puede llegar a todos? ----
    # La misma regla que el mod (`Progreso.DebeAparecer`), en el mejor caso: un
    # nodo sale si lo desbloquea un diálogo de un nodo al que ya se llega, o si
    # se cumplen a la vez «sale solo», sus previos, la variable que lo abre, la
    # elección que pide y las misiones del acto. Un `unlockNode` solo cuenta
    # cuando se ha llegado al nodo cuyo diálogo lo dispara; si no, un ciclo de
    # verdad (A abre B desde un diálogo de A, pero A exige haber terminado B)
    # pasaría por bueno. Es la misma cuenta que `campIssues` del editor.
    por_id = {d.get("id"): d for d in dialogues if d.get("id")}

    posibles = {}                       # variable -> valores a los que puede llegar ("*" = cualquiera)
    TOPE_VALORES = 40                   # un `addVar` en bucle no puede contar hasta el infinito

    def vale(v, x):                     # toda variable empieza en 0
        return x == 0 or "*" in posibles.get(v, set()) or x in posibles.get(v, set())

    def distinto(v, x):
        return x != 0 or any(y != x for y in posibles.get(v, set()))

    def efectos(did, vistos=None, ef=None):
        """Nodos que abre y variables que cambia un diálogo, como lo ejecuta el
        mod: la escena entera (`next`, «enseña este diálogo», lo que hace al
        cerrarse y cada opción), pero con `onlyIf` solo la rama que la variable
        permite (`Conversacion.Mostrar`) y nada de lo que va detrás de
        `startScenario`, que cambia de escena (`Acciones.Siguiente`)."""
        vistos = set() if vistos is None else vistos
        ef = {"nodos": set(), "vars": {}, "sumas": []} if ef is None else ef
        if not did or did in vistos or did not in por_id:
            return ef
        vistos.add(did)
        d = por_id[did]
        si = d.get("onlyIf") or {}
        if si.get("var"):
            x = si.get("value", 1)
            if distinto(si["var"], x):
                efectos(d.get("skipTo"), vistos, ef)
            if not vale(si["var"], x):
                return ef
        listas = [("a", d.get("actions") or [])] + [
            (f"o{oi}", o.get("then") or []) for oi, o in enumerate(d.get("options") or [])]
        for donde, acciones in listas:
            for ai, a in enumerate(acciones):
                acc = a.get("action")
                if acc == "startScenario":
                    break                       # la escena cambia: lo de detrás no se hace
                if acc in ("unlockNode", "completeNode"):
                    ef["nodos"].add(a.get("node"))
                elif acc == "showDialogue":
                    efectos(a.get("dialogue"), vistos, ef)
                elif acc == "setVar" and a.get("var"):
                    ef["vars"].setdefault(a["var"], set()).add(a.get("value") or 0)
                elif acc == "addVar" and a.get("var"):
                    # cada suma cuenta UNA vez (un diálogo suena una vez); se
                    # aplica al juntar, para no repetirla en cada vuelta
                    ef["sumas"].append((f"{did}|{donde}|{ai}", a["var"], a.get("value") or 0))
        efectos(d.get("next"), vistos, ef)
        return ef

    # lo que cambian los escenarios con «Fijar una variable de la campaña»
    def vars_de_mapa(obj, out):
        if isinstance(obj, dict):
            if obj.get("id") == "setCampaignVar":
                pr = obj.get("params") or {}
                if pr.get("var"):
                    out.setdefault(pr["var"], set()).add(pr.get("value", 1))
            for v in obj.values():
                vars_de_mapa(v, out)
        elif isinstance(obj, list):
            for v in obj:
                vars_de_mapa(v, out)
        return out

    de_mapa = {}                        # id de nodo -> {variable: valores}
    for n in nodes:
        if n.get("kind") == "scenario" and n.get("map") and (base / n["map"]).exists():
            try:
                de_mapa[n.get("id")] = vars_de_mapa(
                    json.loads((base / n["map"]).read_text(encoding="utf-8")), {})
            except (OSError, json.JSONDecodeError):
                pass

    # una condición sobre una variable que no cambia nadie no se cumple nunca
    cambiadas = set()
    for d in dialogues:
        for acciones in [d.get("actions") or []] + [o.get("then") or [] for o in d.get("options") or []]:
            cambiadas |= {a.get("var") for a in acciones
                          if a.get("action") in ("setVar", "addVar") and a.get("var")}
    for vs in de_mapa.values():
        cambiadas |= set(vs)
    for n in nodes:
        sp = n.get("spawn") or {}
        for v in {sp.get("unlockVar"), (sp.get("choice") or {}).get("var")} - {None, ""}:
            if v not in cambiadas:
                rep.warn(f"nodo «{n.get('name') or n.get('id')}»: espera a la variable «{v}», "
                         "que no cambia ningún diálogo ni ningún escenario de la campaña")

    def no_cero(v):                     # "*" también es «no 0»
        return any(x != 0 for x in posibles.get(v, set()))

    def es_mision(o):
        # `GetCompletedQuestsByAct` cuenta lo que el mod registra como misión:
        # todo menos los eventos de conversación (`MapaMundo.Registrar`)
        return not (o.get("kind") == "dialogue" and o.get("marker") == "narrative")

    def misiones(abiertos, yo):
        return sum(1 for o in nodes if o is not yo and o.get("id") in abiertos and es_mision(o))

    # lo que tiene que estar completado sí o sí para que un nodo salga solo: sus
    # previos, y los previos de esos mientras ningún diálogo los pueda abrir
    nodo_por_id = {n.get("id"): n for n in nodes if n.get("id")}
    abribles = set()
    for d in dialogues:
        for acciones in [d.get("actions") or []] + [o.get("then") or [] for o in d.get("options") or []]:
            for a in acciones:
                if a.get("action") in ("unlockNode", "completeNode"):
                    abribles.add(a.get("node"))

    def previos(nid, vistos=None):
        vistos = set() if vistos is None else vistos
        s_, n = set(), nodo_por_id.get(nid)
        if n is None or nid in vistos:
            return s_
        vistos.add(nid)
        for p_ in (n.get("spawn") or {}).get("afterNodes") or []:
            s_.add(p_)
            if p_ not in abribles:
                s_ |= previos(p_, vistos)
        return s_

    def quitado_por(n, hechos):
        return next((h for h in (n.get("spawn") or {}).get("hideAfterNodes") or [] if h in hechos), None)

    por_cadena = {}

    def sale_solo(n, abiertos):
        sp = n.get("spawn") or {}
        if sp.get("auto", True) is False or sp.get("afterQuests"):
            return False
        if sp.get("unlockVar") and not no_cero(sp["unlockVar"]):
            return False
        el = sp.get("choice") or {}
        if el.get("var") and not vale(el["var"], el.get("value", 1)):
            return False
        if not all(p in abiertos for p in sp.get("afterNodes") or []):
            return False
        qta = sp.get("questsThisAct") or 0
        if isinstance(qta, int) and qta > 0 and misiones(abiertos, n) < qta:
            return False
        h = quitado_por(n, previos(n.get("id")))
        if h:
            por_cadena[n.get("id")] = h
            return False
        return True

    # lo que el mod pone al empezar: antes de la apertura y sin nada hecho
    abiertos = {n["id"] for n in nodes if n.get("id") and sale_solo(n, set())}
    if nodes and not abiertos:
        rep.err("ningún nodo aparece al empezar: la campaña arrancaría vacía")

    sumadas = set()

    def suma(vs, sumas=()):
        mas = False

        def pon(v, x):
            nonlocal mas
            s_ = posibles.setdefault(v, set())
            if x not in s_ and "*" not in s_:
                s_.add(x)
                mas = True
            if len(s_) > TOPE_VALORES and "*" not in s_:
                s_.add("*")
                mas = True

        for v, xs in vs.items():
            for x in xs:
                pon(v, x)
        for clave, v, k in sumas:
            if clave in sumadas:
                continue
            sumadas.add(clave)
            mas = True
            for x in {0} | set(posibles.get(v, set())):
                pon(v, "*" if x == "*" else x + k)
        return mas

    crecio = True
    while crecio:
        crecio = False
        desbloqueables = set()
        # (diálogo, qué está hecho seguro cuando suena)
        suenan = [(doc.get("intro"), set())]
        for n in nodes:
            if n.get("id") in abiertos:
                antes = previos(n.get("id"))
                suenan += [(n.get("onArrive"), antes), (n.get("onTravel"), antes),
                           (n.get("onComplete"), antes | {n.get("id")})]
                crecio |= suma(de_mapa.get(n.get("id"), {}))
        for did, hechos in suenan:
            if did:
                ef = efectos(did)
                # un desbloqueo no devuelve lo que ya se fue (hideAfterNodes gana)
                desbloqueables |= {x for x in ef["nodos"]
                                   if x in nodo_por_id and not quitado_por(nodo_por_id[x], hechos)}
                crecio |= suma(ef["vars"], ef["sumas"])
        for n in nodes:
            nid = n.get("id")
            if nid and nid not in abiertos and (nid in desbloqueables or sale_solo(n, abiertos)):
                abiertos.add(nid)
                crecio = True

    for n in nodes:
        if n.get("id") and n["id"] not in abiertos:
            h = por_cadena.get(n["id"])
            if h and h not in ((n.get("spawn") or {}).get("afterNodes") or []):
                rep.err(f"nodo «{n.get('name') or n['id']}»: solo puede salir después de completar "
                        f"«{h}» (a través de los nodos que exige antes), y completar «{h}» lo "
                        "hace desaparecer")
            rep.err(f"al nodo «{n.get('name') or n['id']}» no se puede llegar: "
                    "sus requisitos no se cumplen nunca")

    return rep, node_ids


def main(argv):
    if len(argv) < 2:
        print(__doc__.strip())
        return 2
    failed = False
    for path in argv[1:]:
        p = Path(path)
        print(f"\n\033[1m{p.name}\033[0m")
        try:
            doc = json.loads(p.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as e:
            print(f"  ✗ no se puede leer: {e}")
            failed = True
            continue

        rep, _ = validate(doc, p.parent)
        for m in rep.errors:
            print(f"  ✗ {m}")
        for m in rep.warnings:
            print(f"  · {m}")

        # los escenarios que usa se validan también: de nada sirve una campaña
        # bien enhebrada si uno de sus tableros está roto
        for n in doc.get("nodes", []):
            if n.get("kind") != "scenario" or not n.get("map"):
                continue
            sub = p.parent / n["map"]
            if not sub.exists():
                continue
            try:
                srep = validate_dmap.validate(json.loads(sub.read_text(encoding="utf-8")))
            except (OSError, json.JSONDecodeError) as e:
                print(f"  ✗ {n['map']}: no se puede leer: {e}")
                failed = True
                continue
            for m in srep.errors:
                print(f"  ✗ {n['map']}: {m}")
            failed |= bool(srep.errors)

        if not rep.errors:
            print(f"  ✓ válida — {len(doc.get('nodes', []))} nodos, "
                  f"{len(doc.get('dialogues', []))} diálogos")
        failed |= bool(rep.errors)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
