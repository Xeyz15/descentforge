/* DescentForge — la galería de escenarios de la comunidad.

   No hay servidor. Lo que se ve sale de `mapas/indice.json`, un archivo que
   vive en el propio sitio, y subir un escenario es abrir un «issue» en el
   repositorio de GitHub con todo ya relleno: una comprobación automática lo
   valida y lo publica (ver `galeria/publicar.py`).

   **Todo lo que ha escrito la gente se pinta con `textContent`.** El título, la
   descripción, el autor y las notas vienen de fuera: aquí no se monta HTML con
   ellos en ningún sitio. (En el resto del sitio `innerHTML` es seguro porque
   son cadenas del propio HTML; en esta página, no.)

   El idioma lo lleva `sitio.js`, que deja el elegido en `<html lang>`; aquí se
   mira y se repinta cuando cambia. */
(function () {
  'use strict';

  var REPO = 'Xeyz15/descentforge';
  var INDICE = 'mapas/indice.json';
  var TOPE_URL = 7000;                    // por encima, el paquete viaja por el portapapeles

  var IDIOMAS = { es: 'Español', en: 'English', pt: 'Português', fr: 'Français', de: 'Deutsch', it: 'Italiano',
                  pl: 'Polski', ru: 'Русский', zh: '中文', ko: '한국어', hu: 'Magyar', cs: 'Čeština', otro: '…' };
  var ETIQUETAS = {
    combate: ['Combate', 'Combat'], exploracion: ['Exploración', 'Exploration'], puzle: ['Puzle', 'Puzzle'],
    narrativa: ['Narrativa', 'Story'], defensa: ['Defensa', 'Defence'], escolta: ['Escolta', 'Escort'],
    contrarreloj: ['Contrarreloj', 'Against the clock'], jefe: ['Jefe final', 'Boss fight'], sigilo: ['Sigilo', 'Stealth'],
    mazmorra: ['Mazmorra', 'Dungeon'], 'aire-libre': ['Aire libre', 'Outdoors'], humor: ['Humor', 'Humour']
  };
  var DURACIONES = [0, 30, 60, 90, 120, 150, 180];
  var T = {
    es: {
      cargando: 'Cargando la galería…', error: 'No se ha podido cargar la galería. Prueba a recargar la página.',
      vacia: 'Aún no hay escenarios publicados', vaciaSub: 'Sé el primero: monta una misión con el editor y súbela.',
      nada: 'Ningún escenario casa con esos filtros.', buscar: 'Buscar por título, autor o texto…',
      todosIdiomas: 'Cualquier idioma', todosTipos: 'Escenarios y campañas', escenario: 'Escenario', campana: 'Campaña',
      heroes: 'héroes', cualquierHeroes: 'Cualquier grupo', paraN: 'Para {0} héroes', todasCajas: 'Cualquier caja',
      acto1: 'Solo caja base', acto2: 'Necesita Acto II', todasEtiquetas: 'Cualquier estilo',
      recientes: 'Más recientes', porTitulo: 'Por título', descargar: '⬇ Descargar', ficha: 'Ver ficha', cerrarFicha: 'Cerrar ficha',
      de: 'de', min: 'min', cajaBase: 'Caja base', cajaActo2: 'Acto II', nEscenarios: '{0} escenarios',
      losetas: 'Losetas', pisos: 'Pisos', salas: 'Salas', mesa: 'Mesa', casillas: 'casillas', enemigos: 'Enemigos',
      objetos: 'Objetos', objetivos: 'Objetivos', opcionales: 'opcionales', disparadores: 'Disparadores',
      propios: 'Monstruos propios', mod: 'Mod necesario', dificultad: 'Dificultad', probado: 'Probado en mesa',
      probadoNo: 'Sin probar', probadoCon: 'Sí, con {0} héroes', version: 'Versión', subido: 'Publicado',
      actualizado: 'Actualizado', por: 'Subido por', notas: 'Notas para montarlo', destinos: 'Destinos',
      dialogos: 'Diálogos', inventario: 'Inventario de salida', si: 'Sí', musica: 'Música propia',
      musicaAviso: 'el audio va aparte', comentar: 'Comentar o avisar de un problema', archivos: 'Archivos',
      facil: 'Fácil', normal: 'Normal', dificil: 'Difícil', guerra: 'Guerra',
      // subir
      subirTitulo: 'Subir un escenario', elegir: 'Suelta aquí tu escenario o pulsa para elegirlo',
      subirSub: 'Tres pasos y está en la galería.', p1: 'El archivo', p2: 'La ficha', p3: 'Detalles',
      cambiar: 'Pulsa o suelta otro para cambiarlo', esCampana: 'Campaña', esMapa: 'Escenario suelto', heroesN: 'héroes', mapasN: 'escenarios',
      elegirAyuda: 'Un <code>.dmap</code>, o una campaña: su <code>.dcamp</code> y todos sus <code>.dmap</code> a la vez.',
      fTitulo: 'Título', fAutor: 'Autor (el nombre que quieras que se vea)', fDesc: 'Descripción',
      fDescAyuda: 'De qué va, qué tiene de especial. Sin destripar el final.', fIdioma: 'Idioma en que está escrito',
      fDuracion: 'Cuánto dura, más o menos', noSe: 'No lo sé', fEtiquetas: 'Estilo (hasta 5)',
      fProbado: '¿Lo has jugado en mesa?', fNotas: 'Notas para quien lo monte (opcional)',
      fNotasAyuda: 'Algo que convenga saber antes de empezar: una regla de la casa, una loseta que se sustituye…',
      fVersion: 'Versión', acepta: 'Es mío, lo he hecho yo, y no lleva textos ni imágenes del juego.',
      leido: 'Archivos leídos:', enviar: 'Continuar en GitHub', cancelar: 'Cancelar',
      necesitaCuenta: 'Para publicar hace falta una cuenta de GitHub (es gratis). El último paso se hace allí: se abre un formulario ya relleno y solo hay que pulsar «Submit new issue».',
      faltaArchivo: 'Elige primero el archivo del escenario.', faltaCampo: 'Falta rellenar: {0}.',
      faltaAcepta: 'Marca la casilla de que el escenario es tuyo.', malArchivo: '«{0}» no parece un archivo del editor.',
      malNombre: 'El nombre de archivo «{0}» lleva acentos, espacios o símbolos. Renómbralo (solo letras, números y guiones) y vuelve a elegirlo.',
      unaCampana: 'Solo puede ir una campaña (.dcamp) por envío.', unMapa: 'Elige un solo .dmap, o una campaña con todos sus escenarios.',
      faltanMapas: 'A la campaña le faltan estos escenarios: {0}', sobranMapas: 'Estos escenarios no los usa la campaña: {0}',
      grande: 'El envío es demasiado grande para publicarlo así.',
      sinCompresion: 'Este navegador es demasiado antiguo para preparar el envío. Prueba con Firefox, Chrome o Edge actualizados.',
      listoTitulo: 'Último paso, en GitHub', listoDirecto: 'Se ha abierto GitHub en otra pestaña con el formulario relleno. Revisa el título y pulsa «Submit new issue». En un par de minutos estará en la galería y te lo dirán allí mismo.',
      listoPegar: 'Se ha abierto GitHub en otra pestaña y el escenario está copiado. <b>Haz clic en el recuadro «Escenario», pega (Ctrl+V)</b> y pulsa «Submit new issue». En un par de minutos estará en la galería.',
      copiar: 'Copiar otra vez', copiado: 'Copiado', abrir: 'Abrir GitHub', hecho: 'Entendido'
    },
    en: {
      cargando: 'Loading the gallery…', error: 'The gallery could not be loaded. Try reloading the page.',
      vacia: 'No scenarios published yet', vaciaSub: 'Be the first: build a quest with the editor and upload it.',
      nada: 'No scenario matches those filters.', buscar: 'Search by title, author or text…',
      todosIdiomas: 'Any language', todosTipos: 'Scenarios and campaigns', escenario: 'Scenario', campana: 'Campaign',
      heroes: 'heroes', cualquierHeroes: 'Any party', paraN: 'For {0} heroes', todasCajas: 'Any box',
      acto1: 'Core box only', acto2: 'Needs Act II', todasEtiquetas: 'Any style',
      recientes: 'Newest', porTitulo: 'By title', descargar: '⬇ Download', ficha: 'Details', cerrarFicha: 'Close details',
      de: 'by', min: 'min', cajaBase: 'Core box', cajaActo2: 'Act II', nEscenarios: '{0} scenarios',
      losetas: 'Tiles', pisos: 'Levels', salas: 'Rooms', mesa: 'Table', casillas: 'squares', enemigos: 'Enemies',
      objetos: 'Objects', objetivos: 'Objectives', opcionales: 'optional', disparadores: 'Triggers',
      propios: 'Custom monsters', mod: 'Mod needed', dificultad: 'Difficulty', probado: 'Playtested',
      probadoNo: 'Not playtested', probadoCon: 'Yes, with {0} heroes', version: 'Version', subido: 'Published',
      actualizado: 'Updated', por: 'Uploaded by', notas: 'Set-up notes', destinos: 'Destinations',
      dialogos: 'Dialogues', inventario: 'Starting inventory', si: 'Yes', musica: 'Custom music',
      musicaAviso: 'the audio file is separate', comentar: 'Comment or report a problem', archivos: 'Files',
      facil: 'Easy', normal: 'Normal', dificil: 'Hard', guerra: 'Warfare',
      subirTitulo: 'Upload a scenario', elegir: 'Drop your scenario here or click to pick it',
      subirSub: 'Three steps and it is in the gallery.', p1: 'The file', p2: 'The details', p3: 'Extras',
      cambiar: 'Click or drop another one to change it', esCampana: 'Campaign', esMapa: 'Single scenario', heroesN: 'heroes', mapasN: 'scenarios',
      elegirAyuda: 'A <code>.dmap</code>, or a campaign: its <code>.dcamp</code> and all its <code>.dmap</code> files at once.',
      fTitulo: 'Title', fAutor: 'Author (the name you want shown)', fDesc: 'Description',
      fDescAyuda: 'What it is about, what makes it special. No spoilers for the ending.', fIdioma: 'Language it is written in',
      fDuracion: 'Roughly how long it takes', noSe: 'Not sure', fEtiquetas: 'Style (up to 5)',
      fProbado: 'Have you played it at the table?', fNotas: 'Notes for whoever sets it up (optional)',
      fNotasAyuda: 'Anything worth knowing before starting: a house rule, a tile to swap…',
      fVersion: 'Version', acepta: 'It is mine, I made it, and it carries no text or images from the game.',
      leido: 'Files read:', enviar: 'Continue on GitHub', cancelar: 'Cancel',
      necesitaCuenta: 'Publishing needs a GitHub account (it is free). The last step happens there: a form opens already filled in and you only press “Submit new issue”.',
      faltaArchivo: 'Pick the scenario file first.', faltaCampo: 'Missing: {0}.',
      faltaAcepta: 'Tick the box saying the scenario is yours.', malArchivo: '“{0}” does not look like an editor file.',
      malNombre: 'The file name “{0}” has accents, spaces or symbols. Rename it (letters, digits and hyphens only) and pick it again.',
      unaCampana: 'Only one campaign (.dcamp) per submission.', unMapa: 'Pick a single .dmap, or a campaign with all its scenarios.',
      faltanMapas: 'The campaign is missing these scenarios: {0}', sobranMapas: 'The campaign does not use these scenarios: {0}',
      grande: 'The submission is too large to publish this way.',
      sinCompresion: 'This browser is too old to prepare the submission. Try an up-to-date Firefox, Chrome or Edge.',
      listoTitulo: 'Last step, on GitHub', listoDirecto: 'GitHub has opened in another tab with the form filled in. Check the title and press “Submit new issue”. It will be in the gallery within a couple of minutes and you will be told right there.',
      listoPegar: 'GitHub has opened in another tab and the scenario is copied. <b>Click the “Escenario” box, paste (Ctrl+V)</b> and press “Submit new issue”. It will be in the gallery within a couple of minutes.',
      copiar: 'Copy again', copiado: 'Copied', abrir: 'Open GitHub', hecho: 'Got it'
    }
  };

  var raiz = document.getElementById('galeria-viva');
  if (!raiz) return;
  var estado = { lista: null, error: false, q: '', idioma: '', tipo: '', heroes: '', acto: '', etiqueta: '', orden: 'recientes', abierta: '' };
  var leng = function () { return document.documentElement.lang === 'en' ? 'en' : 'es'; };
  var t = function (k) { var s = T[leng()][k]; for (var i = 1; i < arguments.length; i++) s = s.replace('{' + (i - 1) + '}', arguments[i]); return s; };
  var etq = function (id) { return (ETIQUETAS[id] || [id, id])[leng() === 'en' ? 1 : 0]; };

  /* Crea un elemento. El texto SIEMPRE entra por `textContent`. */
  function el(tag, clase, texto) {
    var n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto !== undefined && texto !== null) n.textContent = String(texto);
    return n;
  }
  function fecha(seg) {
    try { return new Date(seg * 1000).toLocaleDateString(leng() === 'en' ? 'en-GB' : 'es-ES', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch (e) { return ''; }
  }

  // ------------------------------------------------------------ la miniatura
  /* El tablero dibujado con las casillas que el propio archivo declara: no se
     sube ninguna imagen, así que no hay imágenes que moderar. */
  function miniatura(silueta) {
    var c = document.createElement('canvas'); c.className = 'mini'; c.width = 220; c.height = 150;
    var g = c.getContext && c.getContext('2d');
    if (!g || !silueta || !silueta.length) return c;
    var mx = 0, my = 0;
    silueta.forEach(function (s) { if (s[0] > mx) mx = s[0]; if (s[1] > my) my = s[1]; });
    var lado = Math.max(2, Math.floor(Math.min((c.width - 16) / (mx + 1), (c.height - 16) / (my + 1))));
    var ox = Math.round((c.width - (mx + 1) * lado) / 2), oy = Math.round((c.height - (my + 1) * lado) / 2);
    var color = function (s) {
      if (s[3]) return 'rgba(74,130,170,' + (s[4] ? .45 : .8) + ')';             // agua, lava…: lo de debajo
      var base = [[201, 178, 138], [226, 205, 160], [244, 232, 200]][Math.min(2, s[2])];
      return 'rgba(' + base.join(',') + ',' + (s[4] ? .42 : 1) + ')';            // las salas que salen luego, apagadas
    };
    silueta.slice().sort(function (a, b) { return (a[2] - b[2]) || (b[3] - a[3]); }).forEach(function (s) {
      g.fillStyle = color(s);
      g.fillRect(ox + s[0] * lado, oy + s[1] * lado, lado - (lado > 3 ? 1 : 0), lado - (lado > 3 ? 1 : 0));
    });
    return c;
  }

  // ------------------------------------------------------------ una tarjeta
  function chip(texto, clase) { return el('span', 'chip' + (clase ? ' ' + clase : ''), texto); }
  function dato(dl, nombre, valor) {
    if (valor === undefined || valor === null || valor === '') return;
    dl.appendChild(el('dt', null, nombre)); dl.appendChild(el('dd', null, valor));
  }
  function tarjeta(e) {
    var f = e.ficha || {}, abierta = estado.abierta === e.id;
    var art = el('article', 'esc' + (abierta ? ' abierta' : '')); art.id = e.id;
    art.appendChild(miniatura(f.silueta));
    var cuerpo = el('div', 'esc-cuerpo');
    cuerpo.appendChild(el('h3', null, e.titulo));
    cuerpo.appendChild(el('p', 'esc-autor', t('de') + ' ' + e.autor));
    var chips = el('div', 'chips');
    chips.appendChild(chip(e.tipo === 'campana' ? t('campana') + ' · ' + t('nEscenarios', f.escenarios || 0) : t('escenario'), 'fuerte'));
    if (f.heroes) chips.appendChild(chip((f.heroes[0] === f.heroes[1] ? f.heroes[0] : f.heroes[0] + '–' + f.heroes[1]) + ' ' + t('heroes')));
    chips.appendChild(chip(IDIOMAS[e.idioma] || e.idioma));
    if (e.duracion) chips.appendChild(chip((e.duracion >= 180 ? '180+' : e.duracion) + ' ' + t('min')));
    chips.appendChild(chip(f.acto === 2 ? t('cajaActo2') : t('cajaBase'), f.acto === 2 ? 'caja2' : ''));
    (e.etiquetas || []).forEach(function (x) { chips.appendChild(chip(etq(x), 'suave')); });
    cuerpo.appendChild(chips);
    var desc = el('p', 'esc-desc', abierta || e.descripcion.length <= 230 ? e.descripcion : e.descripcion.slice(0, 220).replace(/\s+\S*$/, '') + '…');
    cuerpo.appendChild(desc);

    if (abierta) {
      var dl = el('dl', 'esc-datos');
      if (e.tipo === 'campana') {
        dato(dl, t('destinos'), f.destinos); dato(dl, t('dialogos'), f.dialogos);
        dato(dl, t('enemigos'), f.enemigos); if (f.inventario_inicial) dato(dl, t('inventario'), t('si'));
      } else {
        dato(dl, t('dificultad'), ({ easy: t('facil'), normal: t('normal'), hard: t('dificil'), warfare: t('guerra') })[f.dificultad] || f.dificultad);
        dato(dl, t('losetas'), f.losetas + (f.pisos > 1 ? ' · ' + f.pisos + ' ' + t('pisos').toLowerCase() : ''));
        if (f.salas > 1) dato(dl, t('salas'), f.salas);
        if (f.mesa) dato(dl, t('mesa'), f.mesa[0] + ' × ' + f.mesa[1] + ' ' + t('casillas'));
        dato(dl, t('enemigos'), f.enemigos); dato(dl, t('objetos'), f.objetos);
        dato(dl, t('objetivos'), (f.objetivos || []).length + (f.opcionales ? ' + ' + f.opcionales + ' ' + t('opcionales') : ''));
        dato(dl, t('disparadores'), f.disparadores);
        if (f.musica) dato(dl, t('musica'), t('si') + ' (' + t('musicaAviso') + ')');
      }
      if (f.monstruos_propios) dato(dl, t('propios'), f.monstruos_propios);
      dato(dl, t('mod'), '≥ ' + (f.mod || '0.1.6'));
      dato(dl, t('probado'), e.probado ? t('probadoCon', e.probado) : t('probadoNo'));
      dato(dl, t('version'), e.version);
      dato(dl, t('subido'), fecha(e.creado));
      if (e.actualizado - e.creado > 3600) dato(dl, t('actualizado'), fecha(e.actualizado));
      dato(dl, t('por'), '@' + e.usuario);
      dato(dl, t('archivos'), (e.archivos || []).join(', '));
      cuerpo.appendChild(dl);
      if (e.notas) { cuerpo.appendChild(el('h4', null, t('notas'))); cuerpo.appendChild(el('p', 'esc-desc', e.notas)); }
      var hilo = el('a', 'esc-hilo', t('comentar'));
      hilo.href = 'https://github.com/' + REPO + '/issues/' + encodeURIComponent(e.issue);
      hilo.target = '_blank'; hilo.rel = 'noopener noreferrer';
      cuerpo.appendChild(hilo);
    }

    var pie = el('div', 'esc-pie');
    var baja = el('a', 'boton principal', t('descargar'));
    baja.href = 'mapas/' + encodeURIComponent(e.id) + '/' + encodeURIComponent(e.descarga);
    baja.setAttribute('download', e.descarga);
    var mas = el('button', 'boton secundario', abierta ? t('cerrarFicha') : t('ficha')); mas.type = 'button';
    mas.addEventListener('click', function () {
      estado.abierta = abierta ? '' : e.id;
      if (history.replaceState) history.replaceState(null, '', abierta ? location.pathname : '#' + e.id);
      pintar();
    });
    pie.appendChild(baja); pie.appendChild(mas);
    cuerpo.appendChild(pie);
    art.appendChild(cuerpo);
    return art;
  }

  // ------------------------------------------------------------ filtros y lista
  function opcion(sel, valor, texto, elegido) {
    var o = el('option', null, texto); o.value = valor; if (String(elegido) === String(valor)) o.selected = true; sel.appendChild(o);
  }
  function selector(clave, opciones) {
    var s = el('select'); s.setAttribute('aria-label', opciones[0][1]);
    opciones.forEach(function (o) { opcion(s, o[0], o[1], estado[clave]); });
    s.addEventListener('change', function () { estado[clave] = s.value; pintar(true); });
    return s;
  }
  function filtrados() {
    var q = estado.q.trim().toLowerCase();
    var l = estado.lista.filter(function (e) {
      var f = e.ficha || {};
      if (estado.idioma && e.idioma !== estado.idioma) return false;
      if (estado.tipo && e.tipo !== estado.tipo) return false;
      if (estado.acto && String(f.acto) !== estado.acto) return false;
      if (estado.etiqueta && (e.etiquetas || []).indexOf(estado.etiqueta) < 0) return false;
      if (estado.heroes && f.heroes && !(f.heroes[0] <= +estado.heroes && f.heroes[1] >= +estado.heroes)) return false;
      if (q && (e.titulo + ' ' + e.autor + ' ' + e.descripcion).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    if (estado.orden === 'titulo') l.sort(function (a, b) { return a.titulo.localeCompare(b.titulo); });
    else l.sort(function (a, b) { return b.creado - a.creado; });
    return l;
  }
  var cajaBuscar = null;
  function pintar(mantenerFoco) {
    var foco = mantenerFoco && document.activeElement === cajaBuscar;
    raiz.textContent = '';
    if (estado.error) { raiz.appendChild(el('p', 'hueco', t('error'))); return; }
    if (!estado.lista) { raiz.appendChild(el('p', 'apagado', t('cargando'))); return; }
    if (!estado.lista.length) {
      var h = el('div', 'hueco'); var p = el('p'); p.appendChild(el('b', null, t('vacia'))); h.appendChild(p);
      var p2 = el('p', null, t('vaciaSub')); p2.style.margin = '0'; h.appendChild(p2); raiz.appendChild(h); return;
    }
    var barra = el('div', 'filtros');
    cajaBuscar = el('input'); cajaBuscar.type = 'search'; cajaBuscar.placeholder = t('buscar'); cajaBuscar.value = estado.q;
    cajaBuscar.setAttribute('aria-label', t('buscar'));
    cajaBuscar.addEventListener('input', function () { estado.q = cajaBuscar.value; pintarLista(); });
    barra.appendChild(cajaBuscar);
    var idi = {}; estado.lista.forEach(function (e) { idi[e.idioma] = 1; });
    barra.appendChild(selector('idioma', [['', t('todosIdiomas')]].concat(Object.keys(idi).map(function (k) { return [k, IDIOMAS[k] || k]; }))));
    barra.appendChild(selector('tipo', [['', t('todosTipos')], ['escenario', t('escenario')], ['campana', t('campana')]]));
    barra.appendChild(selector('heroes', [['', t('cualquierHeroes')], ['2', t('paraN', 2)], ['3', t('paraN', 3)], ['4', t('paraN', 4)]]));
    barra.appendChild(selector('acto', [['', t('todasCajas')], ['1', t('acto1')], ['2', t('acto2')]]));
    var usadas = {}; estado.lista.forEach(function (e) { (e.etiquetas || []).forEach(function (x) { usadas[x] = 1; }); });
    if (Object.keys(usadas).length)
      barra.appendChild(selector('etiqueta', [['', t('todasEtiquetas')]].concat(Object.keys(usadas).map(function (k) { return [k, etq(k)]; }))));
    barra.appendChild(selector('orden', [['recientes', t('recientes')], ['titulo', t('porTitulo')]]));
    raiz.appendChild(barra);
    var lista = el('div', 'esc-lista'); lista.id = 'esc-lista'; raiz.appendChild(lista);
    pintarLista();
    if (foco) { cajaBuscar.focus(); cajaBuscar.setSelectionRange(cajaBuscar.value.length, cajaBuscar.value.length); }
  }
  function pintarLista() {
    var lista = document.getElementById('esc-lista'); if (!lista) return;
    lista.textContent = '';
    var l = filtrados();
    if (!l.length) { lista.appendChild(el('p', 'apagado', t('nada'))); return; }
    l.forEach(function (e) { lista.appendChild(tarjeta(e)); });
  }

  function cargar() {
    fetch(INDICE + '?v=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        estado.lista = (d && Array.isArray(d.escenarios)) ? d.escenarios.filter(function (e) { return e && e.id && e.titulo; }) : [];
        var h = (location.hash || '').slice(1);
        if (/^e\d+$/.test(h) && estado.lista.some(function (e) { return e.id === h; })) estado.abierta = h;
        pintar();
        if (estado.abierta) { var n = document.getElementById(estado.abierta); if (n && n.scrollIntoView) n.scrollIntoView({ block: 'center' }); }
      })
      .catch(function () { estado.error = true; pintar(); });
  }

  // ------------------------------------------------------------ subir
  var dlg = document.getElementById('subir');
  var envio = { archivos: [], paquete: '', url: '' };

  function campo(etiqueta, control, ayuda) {
    var d = el('label', 'campo'); d.appendChild(el('span', null, etiqueta)); d.appendChild(control);
    if (ayuda) d.appendChild(el('small', null, ayuda));
    return d;
  }
  function leer(file) {
    return new Promise(function (ok, mal) {
      var r = new FileReader(); r.onload = function () { ok({ nombre: file.name, contenido: String(r.result) }); };
      r.onerror = mal; r.readAsText(file);
    });
  }
  /* Lo mismo que comprobará el servidor de verdad, pero aquí y ya: para no
     mandar a nadie a GitHub con un envío que va a volver rechazado. */
  function revisar(archivos) {
    var docs = {}, i;
    for (i = 0; i < archivos.length; i++) {
      var a = archivos[i];
      if (!/^[A-Za-z0-9._\-]{1,80}\.(dmap|dcamp)$/.test(a.nombre)) return t('malNombre', a.nombre);
      try { docs[a.nombre] = JSON.parse(a.contenido); } catch (e) { return t('malArchivo', a.nombre); }
      var d = docs[a.nombre];
      if (!d || typeof d !== 'object' || (d.format !== 'dmap' && d.format !== 'dcamp')) return t('malArchivo', a.nombre);
    }
    var nombres = Object.keys(docs);
    var camps = nombres.filter(function (n) { return /\.dcamp$/.test(n); }), mapas = nombres.filter(function (n) { return /\.dmap$/.test(n); });
    if (camps.length > 1) return t('unaCampana');
    if (!camps.length) return mapas.length === 1 ? '' : t('unMapa');
    var usados = {}; ((docs[camps[0]].nodes) || []).forEach(function (n) { if (n && n.map) usados[n.map] = 1; });
    var faltan = Object.keys(usados).filter(function (m) { return mapas.indexOf(m) < 0; });
    if (faltan.length) return t('faltanMapas', faltan.join(', '));
    var sobran = mapas.filter(function (m) { return !usados[m]; });
    if (sobran.length) return t('sobranMapas', sobran.join(', '));
    return '';
  }
  function comprimir(texto) {
    if (typeof CompressionStream === 'undefined') return Promise.reject(new Error('sin'));
    var flujo = new Blob([texto]).stream().pipeThrough(new CompressionStream('gzip'));
    return new Response(flujo).arrayBuffer().then(function (buf) {
      var b = new Uint8Array(buf), s = '';
      for (var i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
      return btoa(s).replace(/\+/g, '-').replace(/\//g, '_');
    });
  }

  function abrirSubida() {
    envio = { archivos: [], paquete: '', url: '' };
    var f = document.getElementById('subir-cuerpo'); f.textContent = '';
    document.getElementById('subir-titulo').textContent = t('subirTitulo');
    var aviso = el('p', 'subir-error'); aviso.setAttribute('role', 'alert');
    var decir = function (m) { aviso.textContent = m || ''; if (m && aviso.scrollIntoView) aviso.scrollIntoView({ block: 'nearest' }); };

    document.getElementById('subir-sub').textContent = t('subirSub');
    var paso = function (n, nombre) {
      var h = el('h3', 'subir-paso'); h.appendChild(el('b', null, String(n))); h.appendChild(document.createTextNode(nombre)); return h;
    };

    var entrada = el('input'); entrada.type = 'file'; entrada.multiple = true; entrada.accept = '.dmap,.dcamp,application/json';
    var zona = el('label', 'soltar');
    var zIcono = el('span', 'soltar-icono', '⬆'); zIcono.setAttribute('aria-hidden', 'true');
    var zTitulo = el('b', null, t('elegir'));
    var ayudaArch = el('small'); ayudaArch.innerHTML = t('elegirAyuda');        // cadena propia, no de fuera
    var leidos = el('div', 'chips soltar-leidos');
    zona.appendChild(entrada); zona.appendChild(zIcono); zona.appendChild(zTitulo); zona.appendChild(leidos); zona.appendChild(ayudaArch);
    f.appendChild(paso(1, t('p1'))); f.appendChild(zona);

    var titulo = el('input'); titulo.maxLength = 80;
    var autor = el('input'); autor.maxLength = 40;
    try { autor.value = localStorage.getItem('descentforge.autor') || ''; } catch (e) {}
    var desc = el('textarea'); desc.rows = 5; desc.maxLength = 2000;
    var cuenta = el('small', 'cuenta', '0 / 2000');
    var contar = function () { cuenta.textContent = desc.value.length + ' / 2000'; };
    desc.addEventListener('input', contar);
    var idioma = el('select'); opcion(idioma, '', '—', '');
    Object.keys(IDIOMAS).forEach(function (k) { opcion(idioma, k, k === 'otro' ? (leng() === 'en' ? 'Other' : 'Otro') : IDIOMAS[k], ''); });
    var dur = el('select'); DURACIONES.forEach(function (m) { opcion(dur, m, m ? (m >= 180 ? '180+ ' : m + ' ') + t('min') : t('noSe'), 0); });
    var probado = el('select'); opcion(probado, 0, t('probadoNo'), 0); [2, 3, 4].forEach(function (n) { opcion(probado, n, t('probadoCon', n), 0); });
    var notas = el('textarea'); notas.rows = 2; notas.maxLength = 600;
    var version = el('input'); version.maxLength = 20; version.value = '1.0';
    var caja = el('div', 'chips elegir');
    Object.keys(ETIQUETAS).forEach(function (k) {
      var l = el('label', 'chip suave'); var c = el('input'); c.type = 'checkbox'; c.value = k;
      c.addEventListener('change', function () {
        if (caja.querySelectorAll('input:checked').length > 5) c.checked = false;
        l.classList.toggle('puesto', c.checked);
      });
      l.appendChild(c); l.appendChild(document.createTextNode(etq(k))); caja.appendChild(l);
    });
    var acepta = el('input'); acepta.type = 'checkbox';
    var lAcepta = el('label', 'campo linea'); lAcepta.appendChild(acepta); lAcepta.appendChild(el('span', null, t('acepta')));

    f.appendChild(paso(2, t('p2')));
    var fila0 = el('div', 'campos-fila ancha'); fila0.appendChild(campo(t('fTitulo'), titulo)); fila0.appendChild(campo(t('fAutor'), autor)); f.appendChild(fila0);
    var cDesc = campo(t('fDesc'), desc, t('fDescAyuda')); cDesc.appendChild(cuenta); f.appendChild(cDesc);
    var fila = el('div', 'campos-fila'); fila.appendChild(campo(t('fIdioma'), idioma)); fila.appendChild(campo(t('fDuracion'), dur)); f.appendChild(fila);
    f.appendChild(paso(3, t('p3')));
    var cEt = el('div', 'campo'); cEt.appendChild(el('span', null, t('fEtiquetas'))); cEt.appendChild(caja); f.appendChild(cEt);
    var fila2 = el('div', 'campos-fila'); fila2.appendChild(campo(t('fProbado'), probado)); fila2.appendChild(campo(t('fVersion'), version)); f.appendChild(fila2);
    f.appendChild(campo(t('fNotas'), notas, t('fNotasAyuda')));
    lAcepta.className = 'campo linea acepta';
    f.appendChild(lAcepta);
    f.appendChild(el('p', 'apagado nota', t('necesitaCuenta')));
    f.appendChild(aviso);

    var cargar = function (lista) {
      decir(''); leidos.textContent = ''; envio.archivos = []; zona.classList.remove('lleno');
      zIcono.textContent = '⬆'; zTitulo.textContent = t('elegir');
      if (!lista || !lista.length) return;
      Promise.all([].map.call(lista, leer)).then(function (archivos) {
        var mal = revisar(archivos);
        if (mal) { decir(mal); return; }
        envio.archivos = archivos;
        // lo que el autor ya escribió en el editor, puesto de partida
        var camp = archivos.filter(function (a) { return /\.dcamp$/.test(a.nombre); })[0];
        var principal = camp || archivos[0];
        var doc = JSON.parse(principal.contenido), meta = doc.meta || {};
        zona.classList.add('lleno'); zIcono.textContent = '✓';
        zTitulo.textContent = String(meta.name || principal.nombre).slice(0, 80);
        leidos.appendChild(el('span', 'chip fuerte', t(camp ? 'esCampana' : 'esMapa')));
        if (camp) leidos.appendChild(el('span', 'chip', (archivos.length - 1) + ' ' + t('mapasN')));
        else if (+meta.heroCount) leidos.appendChild(el('span', 'chip', (+meta.heroCount) + ' ' + t('heroesN')));
        archivos.forEach(function (a) { leidos.appendChild(el('span', 'chip suave', a.nombre)); });
        ayudaArch.textContent = t('cambiar');
        if (!titulo.value && meta.name) titulo.value = String(meta.name).slice(0, 80);
        if (!autor.value && meta.author) autor.value = String(meta.author).slice(0, 40);
        if (!desc.value && meta.description) { desc.value = String(meta.description).slice(0, 2000); contar(); }
      }).catch(function () { decir(t('malArchivo', '?')); });
    };
    entrada.addEventListener('change', function () { cargar(entrada.files); });
    ['dragenter', 'dragover'].forEach(function (n) {
      zona.addEventListener(n, function (ev) { ev.preventDefault(); zona.classList.add('encima'); });
    });
    ['dragleave', 'drop'].forEach(function (n) {
      zona.addEventListener(n, function (ev) { ev.preventDefault(); zona.classList.remove('encima'); });
    });
    zona.addEventListener('drop', function (ev) { if (ev.dataTransfer && ev.dataTransfer.files.length) cargar(ev.dataTransfer.files); });

    var pie = document.getElementById('subir-pie'); pie.textContent = '';
    var cancelar = el('button', 'boton secundario', t('cancelar')); cancelar.type = 'button';
    cancelar.addEventListener('click', function () { dlg.close(); });
    var enviar = el('button', 'boton principal', t('enviar')); enviar.type = 'button';
    enviar.addEventListener('click', function () {
      decir('');
      if (!envio.archivos.length) return decir(t('faltaArchivo'));
      if (!titulo.value.trim()) return decir(t('faltaCampo', t('fTitulo')));
      if (!autor.value.trim()) return decir(t('faltaCampo', t('fAutor')));
      if (!desc.value.trim()) return decir(t('faltaCampo', t('fDesc')));
      if (!idioma.value) return decir(t('faltaCampo', t('fIdioma')));
      if (!acepta.checked) return decir(t('faltaAcepta'));
      try { localStorage.setItem('descentforge.autor', autor.value.trim()); } catch (e) {}
      var datos = {
        v: 1, titulo: titulo.value.trim(), autor: autor.value.trim(), descripcion: desc.value.trim(), idioma: idioma.value,
        etiquetas: [].map.call(caja.querySelectorAll('input:checked'), function (c) { return c.value; }),
        duracion: +dur.value, probado: +probado.value, notas: notas.value.trim(), version: version.value.trim() || '1.0',
        acepta: true, archivos: envio.archivos
      };
      enviar.disabled = true;
      comprimir(JSON.stringify(datos)).then(function (b64) {
        enviar.disabled = false;
        if (b64.length > 60000) return decir(t('grande'));
        envio.paquete = 'DF1:' + b64 + ':FIN';
        var base = 'https://github.com/' + REPO + '/issues/new?template=escenario.yml&title=' + encodeURIComponent('Escenario: ' + datos.titulo);
        var directa = base + '&datos=' + encodeURIComponent(envio.paquete);
        var cabe = directa.length <= TOPE_URL;
        envio.url = cabe ? directa : base;
        if (!cabe && navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(envio.paquete).catch(function () {});
        window.open(envio.url, '_blank', 'noopener');
        ultimoPaso(cabe);
      }).catch(function () { enviar.disabled = false; decir(t('sinCompresion')); });
    });
    pie.appendChild(cancelar); pie.appendChild(enviar);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }

  function ultimoPaso(directo) {
    var f = document.getElementById('subir-cuerpo'); f.textContent = '';
    document.getElementById('subir-titulo').textContent = t('listoTitulo');
    document.getElementById('subir-sub').textContent = '';
    var hecho0 = el('div', 'subir-listo'); hecho0.appendChild(el('span', 'soltar-icono', '✓'));
    var p = el('p'); p.innerHTML = t(directo ? 'listoDirecto' : 'listoPegar');   // cadena propia
    hecho0.appendChild(p); f.appendChild(hecho0);
    if (!directo) {
      var ta = el('textarea', 'paquete'); ta.readOnly = true; ta.rows = 4; ta.value = envio.paquete;
      ta.addEventListener('focus', function () { ta.select(); });
      f.appendChild(ta);
    }
    var pie = document.getElementById('subir-pie'); pie.textContent = '';
    if (!directo) {
      var copiar = el('button', 'boton secundario', t('copiar')); copiar.type = 'button';
      copiar.addEventListener('click', function () {
        var hecho = function () { copiar.textContent = t('copiado'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(envio.paquete).then(hecho, function () {});
        else { var ta2 = f.querySelector('textarea'); ta2.select(); try { document.execCommand('copy'); hecho(); } catch (e) {} }
      });
      pie.appendChild(copiar);
    }
    var abrir = el('a', 'boton secundario', t('abrir')); abrir.href = envio.url; abrir.target = '_blank'; abrir.rel = 'noopener noreferrer';
    var listo = el('button', 'boton principal', t('hecho')); listo.type = 'button';
    listo.addEventListener('click', function () { dlg.close(); });
    pie.appendChild(abrir); pie.appendChild(listo);
  }

  [].forEach.call(document.querySelectorAll('[data-subir]'), function (b) {
    b.addEventListener('click', function (ev) { ev.preventDefault(); abrirSubida(); });
  });
  var x = document.getElementById('subir-x'); if (x) x.addEventListener('click', function () { dlg.close(); });

  // el idioma lo cambia `sitio.js`: cuando cambia, se repinta
  if (window.MutationObserver)
    new MutationObserver(function () { pintar(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  // para las pruebas: lo que no depende del navegador
  window.__galeria = { revisar: revisar, comprimir: comprimir, estado: estado, pintar: pintar };

  pintar();
  cargar();
  // el botón «Subir un mapa» del panel del juego llega con #subir: se abre ya el formulario
  if (location.hash === '#subir' && dlg) abrirSubida();
})();
