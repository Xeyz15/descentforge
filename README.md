# DescentForge — Web

DescentForge es un proyecto de aficionados para
crear misiones y campañas propias para el juego de mesa *Descent: Leyendas de
las Tinieblas* y jugarlas dentro de su aplicación oficial.

Aquí vive solo la página. El editor y el mod van por su cuenta.

## Qué hay dentro

```
index.html        la principal
editor.html       Editor Online
escenarios.html   escenarios de la comunidad
css/estilo.css    el estilo, común a las tres
js/sitio.js       idioma y menú de móvil
js/galeria.js     la galería: pinta mapas/indice.json y prepara las subidas
img/              logo y arte propio
mapas/            los escenarios publicados y su índice (lo escribe la acción)
galeria/          lo que revisa y publica cada escenario que llega
.github/          el formulario de subida y la acción que lo atiende
```

Es HTML, CSS y JavaScript a mano. **Sin dependencias, sin compilar, sin
servidor y sin analítica.** El español va escrito en el HTML —así se lee aunque
el JavaScript esté apagado— y el inglés viaja en atributos `data-en`.

## Cómo se sube un escenario

1. En la página de escenarios, **Subir un escenario**: se elige el `.dmap` (o
   el `.dcamp` con sus mapas), se rellena la ficha y la página lo empaqueta.
2. Eso abre un *issue* en este repositorio con el paquete ya puesto. Hace
   falta una cuenta de GitHub; no hay más registro que ese.
3. La acción `escenarios.yml` lo revisa con los mismos validadores que el
   editor. Si está bien, lo publica en `mapas/` y cierra el issue; si no,
   contesta en el propio issue con lo que falla.

Para **retirar** un escenario: pestaña *Actions* → *Escenarios* → *Run
workflow*, con su identificador (`e12`).

## Contar un fallo o echar una mano

- **Fallos e ideas:** [el tablón del proyecto](https://padlet.com/thexeyz/descent-forge-bugs-and-feedback-prl4js7shwmnimt3)
- **Desarrollo:** [el grupo de Telegram](https://t.me/+5mVXEQzDLvdlNTJk)

## Aviso

**DescentForge es un proyecto de aficionados, sin ánimo de lucro y sin ninguna
afiliación con Fantasy Flight Games ni con Asmodee.** *Descent: Leyendas de las
Tinieblas*, sus nombres, sus imágenes y sus reglas pertenecen a sus dueños.
Esta herramienta no sustituye al juego: lo necesita.

El logo y las ilustraciones de esta página están dibujados para este proyecto.
Las capturas de pantalla enseñan el editor en funcionamiento y, con él,
material del juego que pertenece a sus dueños.
