<<<<<<< HEAD
# DescentForge Camera Patch - Analysis Tool

This tool analyzes DescentForge_camera.dll to find methods that handle camera pan/look actions.

## Project Structure
- **CameraPatcher.csproj** - .NET 10 project using AsmResolver 6.1.0 + Mono.Cecil
- **Program.cs** - Analysis tool for finding Pan/Move/Look methods  
- **DescentForge_camera.dll** - Target DLL for patching (will be uploaded separately)

## Usage
```bash
dotnet restore
dotnet run
```

## Planned Patches (Applied Individually)
1. **Pillar Fix** - Geometry sealing fix
2. **Camera Command/Message** - Delay for camera actions  
3. **Camera Pan** - 0.5s delay for Pan-Up behavior

## Current Status
- ✅ Build successful with AsmResolver 6.1.0 (0 errors, 0 warnings)
- ✅ DLL analysis tool working
- ✅ GitHub repository initialized and ready
- ❌ No patches applied yet

---
=======
# DescentForge — Web

DescentForge is a fan project for creating your own missions and campaigns for the
board game *Descent: Legends of the Dark* and playing them inside its official app.

This repository holds only the website. The editor and the mod live elsewhere.

## Online editor

- Project page: <https://wintechr-alt.github.io/descentforge_shared/>
- Online editor: <https://wintechr-alt.github.io/descentforge_shared/editor/>

## What's inside

```
index.html        main page
editor.html       online editor landing page
editor/           the editor (open index.html in this folder)
escenarios.html   community scenarios
css/estilo.css    shared styles
js/sitio.js       language and mobile menu
js/galeria.js     gallery: renders mapas/indice.json and prepares submissions
img/              logo and own artwork
mapas/            published scenarios and their index (written by the action)
galeria/          review and publish pipeline for incoming scenarios
.github/          submission form and the action that handles it
```

Plain HTML, CSS and JavaScript. **No dependencies, no build step, no server
and no analytics.** Spanish is written directly into the HTML — so it reads
even with JavaScript disabled — and English lives in `data-en` attributes.

## How to submit a scenario

1. On the scenarios page, choose **Submit a scenario**: pick the `.dmap` (or the
   `.dcamp` with its maps), fill in the details, and the page packages it.
2. That opens an *issue* in this repository with the package already attached. You
   only need a GitHub account; there is no separate registration.
3. The `escenarios.yml` action reviews it with the same validators as the editor.
   If it passes, it publishes the scenario in `mapas/` and closes the issue; if
   not, it replies in the issue with what failed.

To **withdraw** a scenario: Actions tab → Escenarios → Run workflow, with its
identifier (`e12`).

## Reporting a bug or helping out

- **Bugs and ideas:** [the project board](https://padlet.com/thexeyz/descent-forge-bugs-and-feedback-prl4js7shwmnimt3)
- **Development:** [the Telegram group](https://t.me/+5mVXEQzDLvdlNTJk)

## Notice

**DescentForge is a fan project, non-commercial and with no affiliation to
Fantasy Flight Games or Asmodee.** *Descent: Legends of the Dark*, its names,
images and rules belong to their owners. This tool does not replace the game;
it needs it.

The logo and illustrations on this page were drawn for this project. The
screenshots show the editor in use and, along with it, copyrighted game material
that belongs to its owners.
>>>>>>> 91c42e2508fa7d5c4cb5bc91693376ac96c67ece
