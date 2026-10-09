#!/usr/bin/env python3
"""Valida un archivo .dmap contra el catálogo extraído del juego.

    python3 tools/validate_dmap.py mapa.dmap [otro.dmap ...]

Sale con código 1 si algún mapa tiene errores. Los avisos no hacen fallar.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CAT = ROOT / "tools"


def load(name):
    return json.loads((CAT / name).read_text(encoding="utf-8"))


DATA = load("editor_data.json")
LIB = load("objectives.json")
TRG = load("triggers.json")

TILES = {t["id"]: t for t in DATA["tiles"]}
ENEMIES = {e["id"] for e in DATA["enemies"]}
# De qué caja es cada enemigo. Entran en la partida los tengas o no —el mod los
# pide con `ownedOnly: false`, para que un mapa de la comunidad se juegue como
# lo escribió su autor—, pero quien no tenga esa caja no tiene la miniatura y
# tendrá que sustituirla en la mesa.
ACTO_ENEMIGO = {e["id"]: int(e.get("act") or 1) for e in DATA["enemies"]}
# Recetas y materiales de fabricación: los pide una acción concreta («enseñar
# una receta», «quitar materiales») y son los dos únicos catálogos donde el
# autor elige un identificador que no está puesto en el tablero, así que si se
# cuela uno inventado no hay nada más que lo cace.
RECETAS = {r["id"] for r in DATA.get("recipes", [])}
ACTO_RECETA = {r["id"]: int(r.get("act") or 1) for r in DATA.get("recipes", [])}
MATERIALES = {m["id"] for m in DATA.get("materials", [])}

# A CUALQUIER objeto se le permite salirse del suelo; solo se le exige tocar el
# tablero por alguna casilla (más abajo, donde se comprueban las casillas). La
# escalera era la única con permiso y se quedó corto: ver el comentario largo.
# El grupo del juego, medido y no elegido: ver la nota larga en la comprobación
# de `heroStart`.
MIN_HEROES, MAX_HEROES = 2, 4
# el catálogo pasó de ser una lista de nombres a fichas con su tamaño real
PROPS = {x if isinstance(x, str) else x["id"] for x in DATA["interactables"]}
# La ficha entera de cada objeto, que además del tamaño dice si trae su propia
# lógica del juego (`build_interactuables.py`).
FICHA_PROP = {x["id"]: x for x in DATA["interactables"] if isinstance(x, dict)}
# Cuántas casillas ocupa cada objeto. La estantería son dos y la campana cuatro:
# comprobar solo la casilla donde se pulsa deja pasar objetos que se salen del
# tablero por el otro extremo.
PROP_TAM = {x["id"]: (int(x.get("w", 1) or 1), int(x.get("h", 1) or 1))
            for x in DATA["interactables"] if isinstance(x, dict)}
# Objetos que se apoyan en el CRUCE de la rejilla y no en el centro de una
# casilla: las columnas corta y alta. Para ellos `pos` es el cruce —la esquina
# superior izquierda de la casilla (x,y)— y no ocupan ninguna casilla; lo único
# que se les exige es tocar suelo por alguna de sus cuatro esquinas.
EN_EL_CRUCE = {x["id"] for x in DATA["interactables"]
               if isinstance(x, dict) and x.get("anchor") == "vertex"}


def celdas_del_cruce(o):
    """Las cuatro casillas que se tocan en el cruce donde va el objeto."""
    x, y = (o.get("pos") or [0, 0])[:2]
    return [(x - 1, y - 1), (x, y - 1), (x - 1, y), (x, y)]


# Figuras de peana grande (Levirax, Xenith): ocupan 2×2. Sale del catálogo
# (`size`). Mirando solo la casilla donde está, una figura al borde del tablero
# se colaba con media peana en el vacío.
ENEMY_TAM = {e["id"]: int(e.get("size") or 1) for e in DATA["enemies"]}


def enemy_celdas(e):
    n = ENEMY_TAM.get(e.get("enemy"), 1)
    x, y = (e.get("pos") or [0, 0])[:2]
    return [(x + dx, y + dy) for dx in range(n) for dy in range(n)]


def prop_celdas(o):
    """Todas las casillas que ocupa un objeto, ya girado."""
    if o.get("type") in EN_EL_CRUCE:
        return []
    w, h = PROP_TAM.get(o.get("type"), (1, 1))
    if ((o.get("rot", 0) % 360) + 360) % 360 in (90, 270):
        w, h = h, w
    x, y = (o.get("pos") or [0, 0])[:2]
    return [(x + dx, y + dy) for dx in range(w) for dy in range(h)]
OBJ = {o["id"]: o for o in LIB["objectives"]}
FAIL = {f["id"]: f for f in LIB["failConditions"]}
EVENTS = {e["id"]: e for e in TRG["events"]}
ACTIONS = {a["id"]: a for a in TRG["actions"]}
CONDS = {c["id"]: c for c in TRG["conditions"]}


def rot_cell(c, r):
    x, y = c
    return {0: (x, y), 90: (-y, x), 180: (-x, -y), 270: (y, -x)}[r % 360]


def tile_cells(placement):
    """Las casillas de una loseta colocada, sin repetir.

    El catálogo del juego trae alguna casilla duplicada (19b declara diez y son
    nueve distintas). Sin quitar el duplicado, la loseta se «solapa consigo
    misma» y el mapa salía rechazado por un dato del propio juego.
    """
    t = TILES.get(placement["tile"])
    if not t:
        return []
    px, py = placement["pos"]
    vistas, fuera = set(), []
    for dx, dy in (rot_cell(c, placement.get("rot", 0)) for c in t["cells"]):
        c = (px + dx, py + dy)
        if c not in vistas:
            vistas.add(c)
            fuera.append(c)
    return fuera


class Report:
    def __init__(self):
        self.errors, self.warnings = [], []

    def err(self, msg):
        self.errors.append(msg)

    def warn(self, msg):
        self.warnings.append(msg)


def check_params(rep, where, spec, params):
    """Compara los parámetros presentes con los declarados en el catálogo."""
    declared = {p["key"]: p for p in spec.get("params", [])}
    for key in params:
        if key not in declared:
            rep.warn(f"{where}: parámetro desconocido «{key}»")
    for key, p in declared.items():
        val = params.get(key)
        if val in (None, "", []):
            if p.get("opt"):
                continue                # puede ir vacío: el mod pone el suyo
            rep.err(f"{where}: falta el parámetro «{p.get('label', key)}»")
        elif p["type"] == "int" and not isinstance(val, int):
            rep.err(f"{where}: «{key}» debería ser un número")


def validate(doc):
    rep = Report()

    if doc.get("format") != "dmap":
        rep.err("el campo «format» debe ser \"dmap\"")
    if doc.get("version") not in (1, 2):
        rep.warn(f"versión de formato desconocida: {doc.get('version')}")

    meta = doc.get("meta", {})
    if not meta.get("name"):
        rep.err("meta.name está vacío")
    hero_count = meta.get("heroCount", [2, 4])

    board = doc.get("board", {})
    spawns = doc.get("spawns", {})

    # ---- el Taller: monstruos propios ----
    # Un monstruo propio es un enemigo más para todo lo de abajo, así que sus
    # ids se suman a los del catálogo SOLO para este mapa.
    enemigos = set(ENEMIES)
    propio = doc.get("custom")
    if propio is not None and not isinstance(propio, dict):
        rep.err("custom: debe ser un objeto")
        propio = None
    for i, c in enumerate((propio or {}).get("enemies") or []):
        quien = f"monstruo propio #{i + 1}"
        if not isinstance(c, dict) or not isinstance(c.get("id"), str) or not c.get("id"):
            rep.err(f"{quien}: sin identificador")
            continue
        quien = f"monstruo propio «{c.get('name') or c['id']}»"
        if c["id"] in ENEMIES:
            rep.err(f"{quien}: su id «{c['id']}» ya es un enemigo del juego; necesita uno nuevo")
            continue
        if c["id"] in enemigos:
            rep.err(f"{quien}: el id «{c['id']}» está repetido")
            continue
        if c.get("base") not in ENEMIES:
            rep.err(f"{quien}: su enemigo de base «{c.get('base')}» no existe en el juego")
            continue
        for t in c.get("tiers") or []:
            for k, minimo in (("tier", 1), ("health", 1), ("defense", 0), ("attack", 0)):
                if not isinstance(t.get(k), int) or t[k] < minimo:
                    rep.err(f"{quien}: nivel con «{k}» mal puesto ({t.get(k)!r})")
        if not c.get("tiers"):
            rep.warn(f"{quien}: sin niveles propios; usará los de su enemigo de base")
        enemigos.add(c["id"])

    # ---- losetas: existencia y solapamiento por nivel ----
    occupied = {}          # (nivel, x, y) -> (índice, id) de la loseta
    floor_cells = set()    # celdas pisables, para validar posiciones
    clashes = {}           # (a, b) -> [celdas], para no repetir el mismo choque
    for i, p in enumerate(board.get("tiles", [])):
        t = TILES.get(p.get("tile"))
        if not t:
            rep.err(f"loseta #{i + 1}: «{p.get('tile')}» no existe en el catálogo")
            continue
        if p.get("rot", 0) % 90:
            rep.err(f"loseta #{i + 1}: rotación {p['rot']} no es múltiplo de 90")
        lvl = p.get("level", 0)
        under = t.get("kind") == "underlay"
        for cell in tile_cells(p):
            key = (lvl,) + cell
            if under:
                continue                       # los underlays van debajo
            if key in occupied:
                clashes.setdefault((occupied[key], (i, p["tile"])), []).append(cell)
            occupied[key] = (i, p["tile"])
            floor_cells.add(key)

    for (a, b), cells in clashes.items():
        rep.err(f"la loseta #{b[0] + 1} «{b[1]}» se solapa con la #{a[0] + 1} "
                f"«{a[1]}» en {len(cells)} casilla(s), p. ej. {cells[0]}")

    if not board.get("tiles"):
        rep.err("el mapa no tiene ninguna loseta")

    # ---- el tablero tiene que ser una sola pieza ----
    # Un mapa cuyas losetas no se tocan es legal loseta a loseta y aun así no se
    # puede jugar: los héroes no pueden pasar de un trozo a otro. Se comprobaba
    # cada loseta por separado y por eso se colaron mapas hechos de islas.
    por_nivel = {}
    for (lvl, x, y) in floor_cells:
        por_nivel.setdefault(lvl, set()).add((x, y))
    for lvl, celdas in sorted(por_nivel.items()):
        restantes, trozos = set(celdas), 0
        while restantes:
            trozos += 1
            cola = [restantes.pop()]
            while cola:
                x, y = cola.pop()
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    v = (x + dx, y + dy)
                    if v in restantes:
                        restantes.discard(v)
                        cola.append(v)
        if trozos > 1:
            rep.err(f"la altura {lvl} está partida en {trozos} trozos que no se tocan: "
                    "las losetas de un tablero van pegadas unas a otras")
    # y un piso de arriba necesita algo debajo
    for lvl in sorted(por_nivel):
        if lvl > 0 and (lvl - 1) not in por_nivel:
            rep.err(f"la altura {lvl} está en el aire: no hay losetas en la {lvl - 1}")

    def cell_key(pos, default_level=0):
        return (pos[2] if len(pos) > 2 else default_level, pos[0], pos[1])

    def on_floor(rep, what, pos, lvl=0):
        key = (lvl, pos[0], pos[1])
        if floor_cells and key not in floor_cells:
            rep.err(f"{what} está en {pos[:2]} (altura {lvl}), fuera de las losetas")

    # ---- inicio de héroes ----
    #
    # **De 2 a 4, y los dos extremos están medidos en el juego.**
    #
    # El máximo: el prefab `UIHeroStatusDialog` trae un array `MiniViews` de
    # tamaño 4 y `SyncTo` indexa por número de jugadores
    # (`MiniViews[j].SyncTo(players[j])`), así que un quinto héroe lanza
    # IndexOutOfRange y se lleva por delante la barra de héroes entera.
    #
    # El mínimo: la pantalla oficial de selección no deja confirmar con menos de
    # dos — `UIIntroSequenceHeroSelect.CanProceed` es `_selectedHeroes.Count >= 2`
    # — y `Encuentro.Lanzar` tampoco arranca por debajo de ahí. Descent es un
    # juego de dos a cuatro héroes.
    starts = spawns.get("heroStart", [])
    if not starts:
        rep.err("no hay ninguna casilla de inicio: el grupo no tiene por dónde entrar")
    elif len(starts) < MIN_HEROES:
        rep.err(f"heroStart tiene {len(starts)} casilla(s) y el juego no arranca "
                f"con menos de {MIN_HEROES} héroes")
    elif len(starts) > MAX_HEROES:
        rep.err(f"heroStart tiene {len(starts)} casillas y el juego no admite "
                f"más de {MAX_HEROES} héroes")
    elif len(starts) < hero_count[1]:
        rep.err(f"heroStart tiene {len(starts)} casillas y el mapa admite "
                f"hasta {hero_count[1]} héroes")
    for s in starts:
        on_floor(rep, "una casilla de inicio", s, s[2] if len(s) > 2 else 0)
    if len(set(map(tuple, starts))) != len(starts):
        rep.err("hay casillas de inicio de héroe repetidas")

    # ---- enemigos ----
    groups = set()
    for i, e in enumerate(spawns.get("enemies", [])):
        if e.get("enemy") not in enemigos:
            rep.err(f"enemigo #{i + 1}: «{e.get('enemy')}» no existe en el catálogo")
        for c in enemy_celdas(e):
            on_floor(rep, f"el enemigo #{i + 1}", list(c), e.get("level", 0))
        if e.get("group"):
            groups.add(e["group"])
    enemigos_a2 = sorted({e.get("enemy") for e in spawns.get("enemies", [])
                          if ACTO_ENEMIGO.get(e.get("enemy")) == 2})
    if enemigos_a2:
        rep.warn("enemigos del Acto II (quien no tenga esa caja no tiene su miniatura): "
                 + ", ".join(enemigos_a2))

    # ---- interactuables ----
    for i, o in enumerate(spawns.get("interactables", [])):
        if o.get("type") not in PROPS:
            rep.warn(f"objeto #{i + 1}: tipo «{o.get('type')}» no está en el catálogo")
        if o.get("rot", 0) % 90:
            rep.err(f"objeto #{i + 1}: giro {o['rot']}° (solo 0, 90, 180 o 270)")

        # Lo que pasa al usarlo: si se pide la lógica del juego, tiene que
        # traerla; y si se pide la del autor, tiene que haber algo escrito, que si
        # no el objeto se pulsa y no pasa nada.
        beh = (o.get("behavior") or "").strip().lower()
        ficha = FICHA_PROP.get(o.get("type")) or {}
        tiene_algo = bool((o.get("text") or "").strip()) or \
            (o.get("loot") or {}).get("mode", "none") != "none"
        if beh not in ("", "official", "custom"):
            rep.err(f"objeto #{i + 1}: comportamiento «{beh}» "
                    "(solo «official» o «custom»)")
        # Aviso y no error: los `.dmap` de antes del 11-ago-2026 traen esto
        # escrito en sus puertas porque el editor lo ofrecía, y el mod ya las
        # desvía a su propia lógica (`Objetos.EsOficial`). El mapa se juega bien
        # tal cual está; marcarlo en rojo haría pensar que hay que rehacerlo.
        elif beh == "official" and o.get("type") in ("Door", "Gate"):
            rep.warn(f"objeto #{i + 1} «{o.get('type')}»: pide el comportamiento del "
                     "juego, que en una puerta es un cuadro vacío; se juega con la "
                     "lógica del mod y no hay que tocar nada")
        elif beh == "official" and not ficha.get("official"):
            rep.err(f"objeto #{i + 1} «{o.get('type')}»: se le pide el comportamiento "
                    "del juego y este objeto no trae lógica propia")
        elif beh == "official" and tiene_algo:
            rep.warn(f"objeto #{i + 1} «{o.get('type')}»: usa el comportamiento del "
                     "juego, así que su texto y su botín no se van a usar")
        elif (beh == "custom" or not ficha.get("official")) and not tiene_algo:
            rep.warn(f"objeto #{i + 1} «{o.get('type')}»: sin texto ni botín, "
                     "usarlo no hará nada")

        usos = (o.get("uses") or "").strip().lower()
        # un número de usos también vale (así lo escribe Bigorna: «1», «3»; «0» = siempre)
        if usos not in ("", "once", "always") and not usos.isdigit():
            rep.err(f"objeto #{i + 1}: «{usos}» no es un límite de usos "
                    "(«once», «always», un número de usos, o vacío para dejarlo al objeto)")
        # Todas sus casillas, no solo la de origen: una campana es de 1×4 y con
        # mirar solo dónde se pulsa se colaba medio objeto fuera del tablero,
        # que en el juego sale flotando en el vacío.
        lvl = o.get("level", 0)
        # Las columnas van en el cruce: no ocupan casilla, así que la
        # comprobación de «se sale del suelo» no les vale. Se les pide lo suyo:
        # tocar suelo por alguna de las cuatro esquinas del cruce.
        if o.get("type") in EN_EL_CRUCE:
            if floor_cells and not any((lvl,) + c in floor_cells
                                       for c in celdas_del_cruce(o)):
                rep.err(f"la columna #{i + 1} «{o.get('type')}» está en un cruce "
                        f"que no toca el tablero por ninguna esquina")
            continue
        celdas = prop_celdas(o)
        fuera = [c for c in celdas if floor_cells and (lvl,) + c not in floor_cells]
        # **Sobresalir del suelo vale.** Estuvo prohibido y era demasiado
        # estricto: la escalera ya era la excepción declarada (comunica dos
        # alturas, así que parte de ella se apoya donde aún no hay tablero) y
        # resulta que la excepción era la regla. Está medido con el carro: en
        # `medir-objetos.dmap`, puesto en 34,9, el juego lo pinta hasta la 36,9,
        # que no tiene loseta debajo. Si el editor no deja hacer eso, el editor
        # no enseña lo que pasa en el juego, que es lo único que importa aquí.
        #
        # Lo único que no vale es que el objeto esté ENTERO en el aire.
        # Menos el terreno que une piezas: una escalera o un puente van en el
        # hueco ENTRE losetas, y no pisar ninguna es lo normal.
        if fuera and o.get("type") in ("Staircase", "Bridge", "Ladder", "LadderMedium"):
            pass
        elif fuera and len(fuera) == len(celdas):
            rep.err(f"el objeto #{i + 1} «{o.get('type')}» no toca el tablero "
                    f"por ninguna casilla")
        elif fuera:
            # Se avisa igualmente: sobresalir a propósito y sobresalir por un
            # clic torpe se ven idénticos en el mapa guardado.
            w, h = PROP_TAM.get(o.get("type"), (1, 1))
            rep.warn(f"objeto #{i + 1} «{o.get('type')}» ({w}×{h}): "
                     f"{len(fuera)} casilla(s) sobresalen del suelo "
                     f"(p. ej. {list(fuera[0])})")

    # ---- las piezas que trae la caja ----
    # Descent se monta sobre la mesa: si el mapa pone cinco cofres y la caja
    # trae cuatro, el archivo es correcto y el escenario no se puede montar. Va
    # de aviso y no de error por eso mismo — el .dmap está bien escrito—, pero
    # tiene que decirse, porque no se ve mirando el archivo.
    #
    # Se cuenta el caso peor, todo puesto a la vez, que con el terreno es
    # siempre: se monta al empezar y no se recoge.
    #
    # Lo que trae la caja está contado a mano en `tools/unidades-caja.json`; el
    # juego no lo declara (sus `ProductModel` traen enemigos y botín, no
    # terreno). De lo que no está contado no se dice nada.
    puestos = {}
    for o in spawns.get("interactables", []):
        puestos[o.get("type")] = puestos.get(o.get("type"), 0) + 1
    for tipo, n in sorted(puestos.items(), key=lambda kv: str(kv[0])):
        tope = (FICHA_PROP.get(tipo) or {}).get("units")
        if tope is not None and n > tope:
            rep.warn(f"pones {n} «{tipo}» y la caja solo trae {tope}: "
                     f"ese mapa no se puede montar en la mesa")
    for pool, g in (DATA.get("propPools") or {}).items():
        n = sum(c for t, c in puestos.items()
                if (FICHA_PROP.get(t) or {}).get("pool") == pool)
        tope = int(g.get("max") or 0)
        if tope and n > tope:
            rep.warn(f"pones {n} {g.get('nombre', pool)} y la caja solo trae "
                     f"{tope} contando todas sus variantes")
    act2 = sorted({t for t in puestos if (FICHA_PROP.get(t) or {}).get("act") == 2})
    if act2:
        rep.warn("terreno que no está en la caja del Acto I: " + ", ".join(act2))
    # ---- y las losetas, que también hay las que hay ----
    # Lo mismo con el tablero, con una vuelta de tuerca: la pieza es el CARTÓN,
    # no la cara. La 1a y la 1b son la misma loseta puesta del derecho o del
    # revés, así que un mapa no puede enseñar las dos a la vez ni repetir
    # ninguna. Se cuenta por `piece`, que es lo que comparten las dos caras y lo
    # que estampa `build_editor_data.py` desde `unidades-caja.json`.
    #
    # Mismo criterio que arriba: aviso y no error (el .dmap está bien escrito),
    # y de lo que no esté contado no se dice nada.
    por_pieza = {}
    for p in board.get("tiles", []):
        ficha = TILES.get(p.get("tile")) or {}
        pieza = ficha.get("piece")
        if pieza is None:
            continue
        v = por_pieza.setdefault(pieza, {"n": 0, "caras": set(),
                                         "tope": ficha.get("units")})
        v["n"] += 1
        v["caras"].add(p.get("tile"))
    for pieza, v in sorted(por_pieza.items()):
        if v["tope"] is None or v["n"] <= v["tope"]:
            continue
        caras = ", ".join(sorted(v["caras"]))
        if len(v["caras"]) > 1:
            rep.warn(f"usas a la vez las caras {caras} y son el mismo cartón: "
                     f"{v['n']} puestas y la caja solo trae {v['tope']}")
        else:
            rep.warn(f"pones {v['n']} veces la loseta «{caras}» y la caja solo "
                     f"trae {v['tope']}: ese tablero no se puede montar en la mesa")

    # y las losetas 19, 20 y 21, que solo salen en misiones del Acto II
    losetas2 = sorted({p.get("tile") for p in board.get("tiles", [])
                       if TILES.get(p.get("tile"), {}).get("act") == 2})
    if losetas2:
        rep.warn("losetas del Acto II: " + ", ".join(losetas2))

    n_props = len(spawns.get("interactables", []))

    def check_refs(rep, where, spec, params):
        """Comprueba que grupo/enemigo/objeto referenciados existan de verdad."""
        for p in spec.get("params", []):
            val = params.get(p["key"])
            if val in (None, "", []):
                continue
            if p["type"] == "group" and val not in groups:
                rep.err(f"{where}: el grupo «{val}» no lo usa ningún enemigo")
            elif p["type"] == "enemy" and val not in enemigos:
                rep.err(f"{where}: el enemigo «{val}» no existe")
            elif p["type"] == "interactable" and not (
                    isinstance(val, int) and 0 <= val < n_props):
                rep.err(f"{where}: el objeto #{val} no existe en el mapa")
            elif p["type"] == "recipe" and val not in RECETAS:
                rep.err(f"{where}: la receta «{val}» no existe")
            elif p["type"] == "recipe" and ACTO_RECETA.get(val) == 2:
                # mismo aviso que con los consumibles: quien no tenga esa caja
                # no la tiene comprada, y al mod no le consta
                rep.warn(f"{where}: «{val}» es una receta del Acto II; a quien no "
                         "tenga esa caja no le llegará")
            elif p["type"] == "material" and val not in MATERIALES:
                rep.err(f"{where}: el material «{val}» no existe")

    # ---- objetivos ----
    objectives = doc.get("objectives", {})
    primary = objectives.get("primary", [])
    if isinstance(primary, dict):        # formato v1
        primary = [primary]
    if not primary:
        rep.err("el mapa no tiene ningún objetivo principal")
    for i, o in enumerate(primary):
        spec = OBJ.get(o.get("id"))
        if not spec:
            rep.err(f"objetivo #{i + 1}: «{o.get('id')}» no existe")
            continue
        where = f"objetivo «{spec['name']}»"
        check_params(rep, where, spec, o.get("params", {}))
        check_refs(rep, where, spec, o.get("params", {}))

    for i, f in enumerate(objectives.get("failConditions", [])):
        spec = FAIL.get(f.get("id"))
        if not spec:
            rep.err(f"condición de derrota #{i + 1}: «{f.get('id')}» no existe")
            continue
        where = f"derrota «{spec['name']}»"
        check_params(rep, where, spec, f.get("params", {}))
        check_refs(rep, where, spec, f.get("params", {}))

    # ---- triggers ----
    ids = set()
    for i, t in enumerate(doc.get("triggers", [])):
        name = t.get("name") or f"trigger #{i + 1}"
        if t.get("id") in ids:
            rep.err(f"{name}: el id «{t['id']}» está repetido")
        ids.add(t.get("id"))

        ev = EVENTS.get((t.get("event") or {}).get("id"))
        if not ev:
            rep.err(f"{name}: evento «{(t.get('event') or {}).get('id')}» desconocido")
        else:
            check_params(rep, f"{name} · cuándo", ev, t["event"].get("params", {}))
            check_refs(rep, f"{name} · cuándo", ev, t["event"].get("params", {}))

        def condiciones(lista, donde):
            for c in lista or []:
                # las que combinan otras: el mod las entiende, el editor aún no
                # las pinta; se validan por dentro
                if c.get("id") in ("not", "anyOf", "allOf"):
                    dentro = (c.get("params") or {}).get("conditions")
                    if not isinstance(dentro, list) or not dentro:
                        rep.err(f"{donde}: «{c.get('id')}» sin condiciones dentro")
                    else:
                        condiciones(dentro, donde)
                    continue
                spec = CONDS.get(c.get("id"))
                if not spec:
                    rep.err(f"{donde}: condición «{c.get('id')}» desconocida")
                else:
                    check_params(rep, f"{donde} · condición", spec, c.get("params", {}))
                    check_refs(rep, f"{donde} · condición", spec, c.get("params", {}))

        condiciones(t.get("conditions", []), name)

        if not t.get("actions"):
            rep.err(f"{name}: no hace nada (sin acciones)")
        def acciones(lista, rotulo, hondo=0):
            for a in lista or []:
                par = a.get("params") or {}
                # «si…»: lleva condiciones y dos listas de acciones dentro
                if a.get("id") == "if":
                    if hondo > 8:
                        rep.err(f"{name}: demasiados «si…» unos dentro de otros")
                        continue
                    condiciones(par.get("conditions") or [], f"{name} · si…")
                    dentro = par.get("then") or par.get("actions") or []
                    if not dentro and not par.get("else"):
                        rep.err(f"{name}: un «si…» que no hace nada en ninguna rama")
                    acciones(dentro, "si… entonces", hondo + 1)
                    acciones(par.get("else") or [], "si… si no", hondo + 1)
                    continue
                # una escena propia: una lista de cuadros de diálogo
                if a.get("id") == "playScene":
                    cuadros = par.get("dialogues")
                    if not isinstance(cuadros, list) or not cuadros:
                        rep.err(f"{name}: «playScene» sin cuadros de diálogo")
                    elif any(not isinstance(c, dict) or not (c.get("text") or c.get("options"))
                             for c in cuadros):
                        rep.err(f"{name}: «playScene» tiene un cuadro vacío")
                    continue
                spec = ACTIONS.get(a.get("id"))
                if not spec:
                    rep.err(f"{name}: {rotulo} «{a.get('id')}» desconocida")
                else:
                    check_params(rep, f"{name} · {rotulo}", spec, par)
                    check_refs(rep, f"{name} · {rotulo}", spec, par)

        for rama, rotulo in (("actions", "acción"), ("else", "si no")):
            acciones(t.get(rama), rotulo)
        if t.get("else") and not t.get("conditions"):
            rep.warn(f"{name}: tiene «si no» pero ninguna condición; no correrá nunca")

    return rep


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
        rep = validate(doc)
        for m in rep.errors:
            print(f"  ✗ {m}")
        for m in rep.warnings:
            print(f"  · {m}")
        if not rep.errors:
            n = len(doc.get("board", {}).get("tiles", []))
            print(f"  ✓ válido — {n} losetas, "
                  f"{len(doc.get('spawns', {}).get('enemies', []))} enemigos, "
                  f"{len(doc.get('triggers', []))} triggers")
        failed |= bool(rep.errors)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
