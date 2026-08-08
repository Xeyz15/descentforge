/* DescentForge — el poco JavaScript que necesita el sitio.

   Dos cosas: el cambio de idioma y el menú de móvil. Nada más, y sin ninguna
   librería: la página tiene que verse igual con el JavaScript apagado, así que
   el texto en español va escrito en el HTML y el inglés viaja en `data-en`.

   Mismo convenio que el editor (ver `web/src/js/idioma.js`): el idioma elegido
   se recuerda en `localStorage`. */

(function () {
  'use strict';

  var CLAVE = 'descentforge.sitio.lang';
  var idioma = 'es';

  /* Cada nodo con `data-es`/`data-en` lleva sus dos versiones.

     **Se usa `innerHTML` a propósito**, y hace falta: media página lleva
     negritas y `<code>` dentro de la frase («**Necesitas tener el juego**»),
     y con `textContent` el marcado desaparecía al cambiar de idioma. Es seguro
     porque estas cadenas son del propio HTML, escritas a mano: aquí no entra
     texto de nadie de fuera. El día que la galería de escenarios traiga texto
     de usuarios, ESE irá con `textContent` y sin excepción. */
  function aplicar(lang) {
    idioma = lang === 'en' ? 'en' : 'es';
    document.documentElement.lang = idioma;

    var nodos = document.querySelectorAll('[data-es]');
    for (var i = 0; i < nodos.length; i++) {
      var n = nodos[i];
      var texto = n.getAttribute('data-' + idioma);
      if (texto !== null) n.innerHTML = texto;
    }

    var botones = document.querySelectorAll('.idiomas button');
    for (var j = 0; j < botones.length; j++) {
      botones[j].setAttribute('aria-pressed',
        botones[j].getAttribute('data-lang') === idioma ? 'true' : 'false');
    }

    try { localStorage.setItem(CLAVE, idioma); } catch (e) { /* modo privado */ }
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.idiomas button') : null;
    if (b) { aplicar(b.getAttribute('data-lang')); return; }

    // el menú de móvil
    if (e.target.id === 'abrirMenu') {
      var nav = document.getElementById('nav');
      var abierto = nav.classList.toggle('abierto');
      e.target.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      return;
    }
    // al elegir una sección, el menú se cierra solo
    if (e.target.closest && e.target.closest('#nav a')) {
      document.getElementById('nav').classList.remove('abierto');
      document.getElementById('abrirMenu').setAttribute('aria-expanded', 'false');
    }
  });

  /* `data-aviso`: un botón que todavía no lleva a ningún sitio dice por qué,
     con su propio mensaje. Mejor eso que un enlace muerto que parezca roto.

     Desde el 8-ago-2026 solo queda uno, el de subir un escenario: la descarga
     del mod va a su Release y el editor ya está publicado en `editor/`. Había
     también un `data-descarga` genérico para las descargas sin publicar; se
     quitó al quedarse sin usuarios. */
  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;

    var propio = e.target.closest('[data-aviso]');
    if (propio) {
      e.preventDefault();
      alert(propio.getAttribute('data-aviso-' + idioma) ||
            propio.getAttribute('data-aviso-es'));
    }
  });

  var guardado = null;
  try { guardado = localStorage.getItem(CLAVE); } catch (e) { /* nada */ }
  /* Si no hay nada guardado, se mira el idioma del navegador: alguien que
     llega desde fuera con el navegador en inglés no tiene por qué encontrarse
     la página en español. */
  aplicar(guardado || ((navigator.language || 'es').slice(0, 2) === 'es' ? 'es' : 'en'));
})();
