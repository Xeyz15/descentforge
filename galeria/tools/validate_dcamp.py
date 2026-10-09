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

MARKERS = {"main", "side", "narrative"}
KINDS = {"scenario", "dialogue"}
DLG_TYPES = {"normal", "choice", "virtue", "challenge", "heroSelect", "enemySelect", "interact"}

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
    if meta.get("act") not in (None, "I", "II", "III"):
        rep.err(f"meta.act «{meta.get('act')}» no es I, II ni III")

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
        if not (d.get("text") or "").strip():
            rep.err(f"{etiqueta}: no dice nada (texto vacío)")
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
        if d.get("type") == "choice":
            rep.warn(f"diálogo «{quien}»: es de elección múltiple, así que su «y después» "
                     "no se usa; encadena desde la opción que corresponda")
        # ¿la cadena da vueltas?
        vistos, actual = {d.get("id")}, por_id.get(sig)
        while actual is not None and actual.get("next"):
            if actual["next"] in vistos:
                rep.err(f"diálogo «{quien}»: la cadena de «y después» da vueltas y no "
                        f"termina nunca (pasa por «{actual['next']}»)")
                break
            vistos.add(actual["next"])
            actual = por_id.get(actual["next"])
        if d.get("type") == "choice" and not d.get("options"):
            rep.err(f"{etiqueta}: es de elección múltiple pero no tiene opciones")
        if len(d.get("options") or []) > 5:
            rep.err(f"{etiqueta}: {len(d['options'])} opciones; el cuadro del juego admite 5")

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

    # ---- referencias entre nodos (ya con todos los ids conocidos) ----
    for n in nodes:
        etiqueta = f"nodo «{n.get('name') or n.get('id')}»"
        sp = n.get("spawn") or {}
        for a in sp.get("afterNodes", []):
            if a == n.get("id"):
                rep.err(f"{etiqueta}: se exige a sí mismo, así que nunca aparecería")
            elif a not in node_ids:
                rep.err(f"{etiqueta}: espera al nodo «{a}», que no existe")
        for q in sp.get("afterQuests", []):
            if q not in QUESTS:
                rep.err(f"{etiqueta}: espera la misión «{q}», que no es del juego")

    # ---- acciones de diálogo ----
    for d in dialogues:
        for oi, o in enumerate(d.get("options") or []):
            donde = f"diálogo «{d.get('id')}», opción {oi + 1}"
            if not (o.get("text") or "").strip():
                rep.err(f"{donde}: sin texto")
            for a in o.get("then") or []:
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
            for it in ini.get("items") or []:
                cual = it.get("id") or it.get("item")
                if cual not in ITEMS:
                    rep.err(f"start: «{cual}» no existe en el catálogo")

    # ---- tienda ----
    for it in (doc.get("shop") or {}).get("items", []):
        if it.get("id") not in ITEMS:
            rep.err(f"tienda: «{it.get('id')}» no existe en el catálogo")
        if not isinstance(it.get("qty"), int) or it["qty"] < 1:
            rep.err(f"tienda: «{it.get('id')}» con cantidad mal puesta")

    # ---- ¿se puede llegar a todos? ----
    # Ojo con los desbloqueos por diálogo: un `unlockNode` no está disponible
    # siempre, solo cuando se ha llegado al nodo donde ese diálogo se dispara.
    # Tratarlos como incondicionales dejaría pasar ciclos de verdad (A abre B
    # desde un diálogo de A, pero A exige haber terminado B).
    por_id = {d.get("id"): d for d in dialogues if d.get("id")}

    def abre_de(did, vistos=None):
        """Nodos que puede abrir un diálogo, siguiendo la escena entera.

        «La escena entera» importa: con el estilo del juego un diálogo se cuenta
        en varios cuadros encadenados con `next`, y la elección que abre el
        siguiente destino está en el ÚLTIMO. Mirar solo el cuadro al que apunta
        el nodo daba por inalcanzable media campaña.
        """
        vistos = vistos or set()
        if not did or did in vistos or did not in por_id:
            return set()
        vistos.add(did)
        d = por_id[did]
        abre = set()
        for o in (d.get("options") or []):
            for a in (o.get("then") or []):
                if a.get("action") in ("unlockNode", "completeNode"):
                    abre.add(a.get("node"))
                elif a.get("action") == "showDialogue":
                    abre |= abre_de(a.get("dialogue"), vistos)
        abre |= abre_de(d.get("next"), vistos)      # el resto de la escena
        return abre

    por_dialogo = {}                    # id de diálogo -> nodos que abre
    for d in dialogues:
        abre = abre_de(d.get("id"))
        if abre:
            por_dialogo[d.get("id")] = abre

    abiertos = {n["id"] for n in nodes
                if n.get("id") and (n.get("spawn") or {}).get("auto", True)
                and not (n.get("spawn") or {}).get("afterNodes")}
    crecio = True
    while crecio:
        crecio = False
        # lo que abren los diálogos de los nodos a los que ya se puede llegar
        desbloqueables = set()
        for n in nodes:
            if n.get("id") not in abiertos:
                continue
            for campo in ("onArrive", "onTravel", "onComplete"):
                desbloqueables |= por_dialogo.get(n.get(campo), set())

        for n in nodes:
            nid = n.get("id")
            if not nid or nid in abiertos:
                continue
            prev = (n.get("spawn") or {}).get("afterNodes") or []
            auto = (n.get("spawn") or {}).get("auto", True)
            if nid in desbloqueables or (auto and prev and all(p in abiertos for p in prev)):
                abiertos.add(nid)
                crecio = True

    if nodes and not abiertos:
        rep.err("ningún nodo aparece al empezar: la campaña arrancaría vacía")
    for n in nodes:
        if n.get("id") and n["id"] not in abiertos:
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
