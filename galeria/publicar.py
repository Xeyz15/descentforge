#!/usr/bin/env python3
"""Publica en la galería el escenario que llega en un «issue» de GitHub.

Lo ejecuta la acción `.github/workflows/escenarios.yml`; no hay servidor.

    python3 galeria/publicar.py --evento "$GITHUB_EVENT_PATH" --salida resultado.json
    python3 galeria/publicar.py --retirar e12
    python3 galeria/publicar.py --reindexar

Qué hace con un issue:

  1. Saca del texto el paquete que escribió la página (`DF1:…:FIN`, un JSON
     comprimido): el título, la descripción, las características y los archivos.
  2. **No se fía de nada de eso.** Los archivos pasan por los validadores del
     proyecto —los mismos que usa el editor—, y lo que se enseña de cada
     escenario (héroes, caja, enemigos, tamaño de mesa…) se saca del propio
     archivo, no de lo que diga el formulario.
  3. Si vale, lo deja en `mapas/e<número del issue>/` y rehace `mapas/indice.json`,
     que es lo único que lee la página. Si no, dice qué falla.

Todo lo que escribe la gente se guarda como texto dentro de un JSON; quien lo
pinta es la página, con `textContent`. Aquí no se genera HTML.
"""
import argparse
import base64
import gzip
import io
import json
import re
import shutil
import sys
import tempfile
import time
import zipfile
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent
MAPAS = RAIZ / "mapas"
sys.path.insert(0, str(AQUI / "tools"))
import validate_dmap      # noqa: E402
import validate_dcamp     # noqa: E402

MAX_PAQUETE = 1_500_000         # bytes del paquete ya descomprimido
MAX_ARCHIVOS = 40
MAX_TITULO, MAX_AUTOR, MAX_DESC, MAX_NOTAS, MAX_VERSION = 80, 40, 2000, 600, 20
IDIOMAS = ["es", "en", "pt", "fr", "de", "it", "pl", "ru", "zh", "ko", "hu", "cs", "otro"]
ETIQUETAS = ["combate", "exploracion", "puzle", "narrativa", "defensa", "escolta",
             "contrarreloj", "jefe", "sigilo", "mazmorra", "aire-libre", "humor"]
DURACIONES = [0, 30, 60, 90, 120, 150, 180]
NOMBRE_OK = re.compile(r"^[A-Za-z0-9._\-]{1,80}\.(dmap|dcamp)$")
PAQUETE = re.compile(r"DF1:([A-Za-z0-9_\-=\s]+):FIN")

ENEMIGO = {e["id"]: e for e in validate_dmap.DATA["enemies"]}
LOSETA = {t["id"]: t for t in validate_dmap.DATA["tiles"]}
OBJETO = {(x if isinstance(x, str) else x["id"]): (x if isinstance(x, dict) else {})
          for x in validate_dmap.DATA["interactables"]}


class Rechazo(Exception):
    """Algo que se le cuenta tal cual a quien subió el escenario."""
    def __init__(self, es, en, lineas=None):
        super().__init__(es)
        self.es, self.en, self.lineas = es, en, lineas or []


# ---------------------------------------------------------------- la ficha
def acto(doc):
    """¿Hace falta la caja del Acto II? Se mira lo que el mapa pone de verdad."""
    propios = {c.get("id"): c.get("base") for c in ((doc.get("custom") or {}).get("enemies") or [])
               if isinstance(c, dict)}
    for e in (doc.get("spawns") or {}).get("enemies") or []:
        if (ENEMIGO.get(propios.get(e.get("enemy"), e.get("enemy"))) or {}).get("act") == 2:
            return 2
    for t in (doc.get("board") or {}).get("tiles") or []:
        if (LOSETA.get(t.get("tile")) or {}).get("act") == 2:
            return 2
    for o in (doc.get("spawns") or {}).get("interactables") or []:
        if (OBJETO.get(o.get("type")) or {}).get("act") == 2:
            return 2
    return 1


def mod_minimo(doc):
    """La versión del mod que hace falta, por lo que el mapa usa."""
    acciones = {"runTrigger", "subVariable", "randomVariable", "startRoundTimer", "stopRoundTimer"}
    eventos = {"varChanged", "roundTimer"}
    condiciones = {"varBelow", "varNotEquals", "varBetween", "triggerFired", "triggerNotFired", "heroCount",
                   "heroCountAtLeast", "enemyCountAtLeast", "defeatedAtLeast", "groupAlive", "groupDefeated",
                   "not", "anyOf", "allOf"}
    if (doc.get("custom") or {}).get("enemies"):
        return "0.1.7"
    obj = doc.get("objectives") or {}
    if any(o.get("id") == "var_reaches" for o in (obj.get("primary") or []) + (obj.get("optional") or [])):
        return "0.1.7"
    for t in doc.get("triggers") or []:
        if t.get("else") or t.get("disabled") or (t.get("event") or {}).get("id") in eventos:
            return "0.1.7"
        if any(a.get("id") in acciones for a in t.get("actions") or []):
            return "0.1.7"
        if any(c.get("id") in condiciones for c in t.get("conditions") or []):
            return "0.1.7"
    return "0.1.6"


def ficha_mapa(doc):
    meta, tablero, puestos = doc.get("meta") or {}, doc.get("board") or {}, doc.get("spawns") or {}
    losetas = tablero.get("tiles") or []
    celdas = []                                   # la silueta, para la miniatura
    for p in losetas:
        fondo = (LOSETA.get(p.get("tile")) or {}).get("kind") == "underlay"
        for x, y in validate_dmap.tile_cells(p):
            celdas.append([int(x), int(y), int(p.get("level") or 0), 1 if fondo else 0, 1 if p.get("reveal") else 0])
    xs, ys = [c[0] for c in celdas] or [0], [c[1] for c in celdas] or [0]
    x0, y0 = min(xs), min(ys)
    celdas = [[c[0] - x0, c[1] - y0, c[2], c[3], c[4]] for c in celdas][:1500]
    enemigos = puestos.get("enemies") or []
    propios = {c.get("id"): str(c.get("name") or c.get("id"))[:40]
               for c in ((doc.get("custom") or {}).get("enemies") or []) if isinstance(c, dict)}
    cuenta = {}
    for e in enemigos:
        cuenta[e.get("enemy")] = cuenta.get(e.get("enemy"), 0) + 1
    objetivos = doc.get("objectives") or {}
    heroes = meta.get("heroCount") or [2, 4]
    salidas = len(puestos.get("heroStart") or [])
    return {
        "heroes": [int(heroes[0]), min(int(heroes[1]), salidas) if salidas >= 2 else int(heroes[1])],
        "dificultad": str(meta.get("difficulty") or "normal")[:12],
        "acto": acto(doc),
        "mod": mod_minimo(doc),
        "losetas": len(losetas),
        "pisos": len({int(p.get("level") or 0) for p in losetas}) or 1,
        "salas": len({p.get("reveal") for p in losetas if p.get("reveal")}) + 1,
        "mesa": [max(xs) - x0 + 1, max(ys) - y0 + 1],
        "enemigos": len(enemigos),
        "tipos_enemigo": [{"id": k, "n": v, **({"propio": propios[k]} if k in propios else {})}
                          for k, v in sorted(cuenta.items(), key=lambda kv: -kv[1])][:12],
        "objetos": len(puestos.get("interactables") or []),
        "objetivos": [o.get("id") for o in objetivos.get("primary") or []][:8],
        "opcionales": len(objetivos.get("optional") or []),
        "disparadores": len(doc.get("triggers") or []),
        "monstruos_propios": len(propios),
        "musica": bool(((meta.get("music") or {}).get("file") or "").strip()),
        "silueta": celdas,
    }


def validar(archivos):
    """→ (tipo, ficha, avisos, meta) o lanza `Rechazo` con lo que falla."""
    docs = {}
    for a in archivos:
        try:
            docs[a["nombre"]] = json.loads(a["contenido"])
        except (ValueError, TypeError):
            raise Rechazo(f"«{a['nombre']}» no es un archivo del editor (no se puede leer).",
                          f"“{a['nombre']}” is not an editor file (it cannot be read).")
        if not isinstance(docs[a["nombre"]], dict):
            raise Rechazo(f"«{a['nombre']}» no es un archivo del editor.", f"“{a['nombre']}” is not an editor file.")
    campanas = [n for n in docs if n.endswith(".dcamp")]
    mapas = [n for n in docs if n.endswith(".dmap")]
    errores, avisos = [], []
    if len(campanas) > 1:
        raise Rechazo("Solo puede ir una campaña (.dcamp) en cada envío.", "Only one campaign (.dcamp) per submission.")
    for n in mapas:
        rep = validate_dmap.validate(docs[n])
        errores += [f"{n}: {m}" for m in rep.errors]
        avisos += [f"{n}: {m}" for m in rep.warnings]
    camp = None
    if campanas:
        camp = docs[campanas[0]]
        with tempfile.TemporaryDirectory() as tmp:
            for n, d in docs.items():
                (Path(tmp) / n).write_text(json.dumps(d), encoding="utf-8")
            rep, _ = validate_dcamp.validate(camp, Path(tmp))
        errores += [f"{campanas[0]}: {m}" for m in rep.errors]
        avisos += [f"{campanas[0]}: {m}" for m in rep.warnings]
        usados = {n.get("map") for n in camp.get("nodes") or [] if n.get("map")}
        if usados - set(mapas):
            errores.append("faltan los escenarios de la campaña: " + ", ".join(sorted(usados - set(mapas))))
        if set(mapas) - usados:
            errores.append("estos escenarios no los usa la campaña: " + ", ".join(sorted(set(mapas) - usados)))
    elif len(mapas) != 1:
        raise Rechazo("Sube un solo escenario (.dmap), o una campaña (.dcamp) con todos sus escenarios.",
                      "Upload a single scenario (.dmap), or a campaign (.dcamp) with all its scenarios.")
    if errores:
        raise Rechazo("El escenario no pasa las comprobaciones del editor:",
                      "The scenario does not pass the editor's checks:", errores[:40])
    if camp is not None:
        fichas = [ficha_mapa(docs[n]) for n in mapas]
        ficha = {
            "escenarios": len(mapas),
            "heroes": [max(f["heroes"][0] for f in fichas), min(f["heroes"][1] for f in fichas)] if fichas else [2, 4],
            "acto": max([f["acto"] for f in fichas] + [2 if (camp.get("meta") or {}).get("requiresAct2") else 1]),
            "mod": max([f["mod"] for f in fichas] + ["0.1.7" if camp.get("start") else "0.1.6"]),
            "destinos": len(camp.get("nodes") or []),
            "dialogos": len(camp.get("dialogues") or []),
            "enemigos": sum(f["enemigos"] for f in fichas),
            "monstruos_propios": sum(f["monstruos_propios"] for f in fichas),
            "inventario_inicial": bool(camp.get("start")),
            "silueta": fichas[0]["silueta"] if fichas else [],
        }
        return "campana", ficha, avisos, camp.get("meta") or {}
    return "escenario", ficha_mapa(docs[mapas[0]]), avisos, docs[mapas[0]].get("meta") or {}


# ---------------------------------------------------------------- el paquete
def texto(v, tope, obligatorio=False, campo_es="", campo_en=""):
    t = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", str(v or "")).strip()
    if obligatorio and not t:
        raise Rechazo(f"Falta rellenar: {campo_es}.", f"Missing: {campo_en}.")
    if len(t) > tope:
        raise Rechazo(f"«{campo_es}» es demasiado largo (máximo {tope} caracteres).",
                      f"“{campo_en}” is too long (maximum {tope} characters).")
    return t


def abrir_paquete(cuerpo):
    m = PAQUETE.search(cuerpo or "")
    if not m:
        raise Rechazo("No encuentro el escenario en el mensaje. Vuelve a la página de escenarios, pulsa «Subir un "
                      "escenario» y pega aquí lo que te copia.",
                      "I cannot find the scenario in the message. Go back to the scenarios page, press “Upload a "
                      "scenario” and paste here what it copies for you.")
    try:
        bruto = base64.urlsafe_b64decode(re.sub(r"\s+", "", m.group(1)))
        with gzip.GzipFile(fileobj=io.BytesIO(bruto)) as g:
            datos = g.read(MAX_PAQUETE + 1)
        if len(datos) > MAX_PAQUETE:
            raise Rechazo("El envío es demasiado grande.", "The submission is too large.")
        d = json.loads(datos.decode("utf-8"))
        assert isinstance(d, dict)
    except Rechazo:
        raise
    except Exception:
        raise Rechazo("El escenario ha llegado cortado o cambiado. Vuelve a copiarlo desde la página y pégalo entero.",
                      "The scenario arrived cut or altered. Copy it again from the page and paste it whole.")
    return d


def archivos_de(d):
    archivos = d.get("archivos")
    if not isinstance(archivos, list) or not archivos:
        raise Rechazo("El envío no trae ningún archivo.", "The submission carries no file.")
    if len(archivos) > MAX_ARCHIVOS:
        raise Rechazo("Demasiados archivos en un solo envío.", "Too many files in one submission.")
    limpios, vistos = [], set()
    for a in archivos:
        nombre = Path(str((a or {}).get("nombre") or "")).name
        if not NOMBRE_OK.match(nombre) or nombre in vistos:
            raise Rechazo(f"El nombre de archivo «{nombre}» no vale: solo letras sin acentos, números, guiones y puntos.",
                          f"The file name “{nombre}” is not valid: only unaccented letters, digits, hyphens and dots.")
        vistos.add(nombre)
        if not isinstance((a or {}).get("contenido"), str):
            raise Rechazo(f"«{nombre}» ha llegado vacío.", f"“{nombre}” arrived empty.")
        limpios.append({"nombre": nombre, "contenido": a["contenido"]})
    return limpios


def publicar(numero, usuario, cuerpo):
    """Deja el escenario en `mapas/e<numero>/`. Devuelve su ficha pública."""
    d = abrir_paquete(cuerpo)
    if not d.get("acepta"):
        raise Rechazo("Falta marcar que el escenario es tuyo y que no lleva material del juego.",
                      "You need to tick that the scenario is yours and carries no game material.")
    archivos = archivos_de(d)
    tipo, ficha, avisos, meta = validar(archivos)
    if d.get("idioma") not in IDIOMAS:
        raise Rechazo("Falta decir en qué idioma está escrito el escenario.",
                      "Please say which language the scenario is written in.")
    eid = f"e{int(numero)}"
    carpeta = MAPAS / eid
    antes = {}
    if (carpeta / "ficha.json").exists():                    # una corrección del mismo issue
        antes = json.loads((carpeta / "ficha.json").read_text(encoding="utf-8"))
        shutil.rmtree(carpeta)
    carpeta.mkdir(parents=True)
    for a in archivos:
        (carpeta / a["nombre"]).write_text(a["contenido"], encoding="utf-8")
    if len(archivos) == 1:
        descarga = archivos[0]["nombre"]
    else:                                                    # una campaña baja en un .zip, con su carpeta
        base = Path(next(a["nombre"] for a in archivos if a["nombre"].endswith(".dcamp"))).stem
        nombre_carpeta = re.sub(r"[^A-Za-z0-9_\-]", "-", texto(d.get("titulo") or meta.get("name"), MAX_TITULO)
                                .lower()).strip("-")[:50] or base
        descarga = nombre_carpeta + ".zip"
        with zipfile.ZipFile(carpeta / descarga, "w", zipfile.ZIP_DEFLATED) as z:
            for a in archivos:
                z.writestr(f"{nombre_carpeta}/{a['nombre']}", a["contenido"])
    publica = {
        "id": eid,
        "issue": int(numero),
        "usuario": str(usuario)[:40],
        "creado": antes.get("creado") or int(time.time()),
        "actualizado": int(time.time()),
        "titulo": texto(d.get("titulo") or meta.get("name"), MAX_TITULO, True, "título", "title"),
        "autor": texto(d.get("autor") or meta.get("author") or usuario, MAX_AUTOR, True, "autor", "author"),
        "descripcion": texto(d.get("descripcion") or meta.get("description"), MAX_DESC, True, "descripción", "description"),
        "idioma": d["idioma"],
        "etiquetas": [e for e in (d.get("etiquetas") or []) if e in ETIQUETAS][:5],
        "duracion": d.get("duracion") if d.get("duracion") in DURACIONES else 0,
        "probado": d.get("probado") if d.get("probado") in (0, 2, 3, 4) else 0,
        "notas": texto(d.get("notas"), MAX_NOTAS, campo_es="notas", campo_en="notes"),
        "version": texto(d.get("version") or "1.0", MAX_VERSION, campo_es="versión", campo_en="version"),
        "tipo": tipo,
        "descarga": descarga,
        "archivos": [a["nombre"] for a in archivos],
        "ficha": ficha,
    }
    (carpeta / "ficha.json").write_text(json.dumps(publica, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    reindexar()
    return publica, avisos


def reindexar():
    """`mapas/indice.json` sale de las carpetas que haya: borrar una carpeta retira su escenario."""
    MAPAS.mkdir(exist_ok=True)
    fichas = []
    for f in sorted(MAPAS.glob("e*/ficha.json")):
        try:
            fichas.append(json.loads(f.read_text(encoding="utf-8")))
        except ValueError:
            print(f"· {f} no se puede leer; se deja fuera", file=sys.stderr)
    fichas.sort(key=lambda x: -x.get("creado", 0))
    (MAPAS / "indice.json").write_text(
        json.dumps({"actualizado": int(time.time()), "escenarios": fichas}, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8")
    return len(fichas)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--evento")
    ap.add_argument("--salida", default="resultado.json")
    ap.add_argument("--retirar")
    ap.add_argument("--reindexar", action="store_true")
    a = ap.parse_args()

    if a.reindexar:
        print(f"✓ índice rehecho: {reindexar()} escenario(s)")
        return 0
    if a.retirar:
        if not re.fullmatch(r"e\d+", a.retirar) or not (MAPAS / a.retirar).is_dir():
            print(f"✗ no existe «{a.retirar}»")
            return 1
        shutil.rmtree(MAPAS / a.retirar)
        print(f"✓ retirado {a.retirar}; quedan {reindexar()}")
        return 0

    evento = json.loads(Path(a.evento).read_text(encoding="utf-8"))
    issue = evento.get("issue") or {}
    numero, usuario = issue.get("number"), (issue.get("user") or {}).get("login") or "?"
    try:
        publica, avisos = publicar(numero, usuario, issue.get("body") or "")
        url = f"https://xeyz15.github.io/descentforge/escenarios.html#{publica['id']}"
        comentario = (f"✅ **Publicado:** [{publica['titulo']}]({url})\n\n"
                      f"Ya está en la galería. Si quieres corregirlo, **edita este mismo mensaje** con el paquete nuevo "
                      f"y se vuelve a publicar en su sitio.\n\n"
                      f"✅ **Published.** It is in the gallery now. To fix it, **edit this same message** with the new "
                      f"package and it is published again in its place.")
        if avisos:
            comentario += "\n\n<details><summary>Avisos del editor / Editor notes</summary>\n\n" + \
                          "\n".join("- " + m.replace("<", "&lt;") for m in avisos[:20]) + "\n</details>"
        resultado = {"ok": True, "comentario": comentario, "id": publica["id"], "titulo": publica["titulo"]}
    except Rechazo as r:
        lineas = "".join("\n- " + m.replace("<", "&lt;") for m in r.lineas)
        resultado = {"ok": False, "comentario":
                     f"❌ **No se ha publicado.** {r.es}{lineas}\n\n"
                     f"Corrígelo en el editor, vuelve a pulsar «Subir un escenario» en la página y **edita este mensaje** "
                     f"con el paquete nuevo.\n\n"
                     f"❌ **Not published.** {r.en}\n\nFix it in the editor, press “Upload a scenario” on the page again "
                     f"and **edit this message** with the new package."}
    Path(a.salida).write_text(json.dumps(resultado, ensure_ascii=False), encoding="utf-8")
    print(("✓ publicado " + resultado["id"]) if resultado["ok"] else "✗ rechazado")
    return 0


if __name__ == "__main__":
    sys.exit(main())
