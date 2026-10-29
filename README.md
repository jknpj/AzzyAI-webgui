# AzzyAI Web Configuration

Browser-based configuration tool for [AzzyAI](https://github.com/SpenceKonde/AzzyAI), the Ragnarok Online homunculus and mercenary AI. It has the same features as the Windows `AzzyAIConfig.exe` GUI, but runs in any modern browser and needs no installation or build step.

## Features

- **Homunculus settings** (`H_Config.lua`): every option, grouped in the same categories as the desktop GUI, with search, Homunculus S / base type filters and a description for each option.
- **Mercenary settings** (`M_Config.lua`): categorized or alphabetical view.
- **Tactics** (`H_Tactics.lua`, `M_Tactics.lua`): add, edit and remove per-monster tactics.
- **PVP tactics** (`H_PVP_Tact.lua`, `M_PVP_Tact.lua`).
- **Extra options** (`H_Extra.lua`, `M_Extra.lua`): free-text editor.
- **Apply / Revert / Reset to Defaults**, import and export of individual files or all files at once.
- Official / private server selection (`ServerType`).

## Usage

Open `index.html` in a browser. A local file (`file://`) works, as does any static host such as GitHub Pages.

1. **File > Open USER_AI folder** and select your client's `AI\USER_AI` folder. Without a folder, the defaults are loaded.
2. Edit the settings.
3. Click **Apply**:
   - **Chrome / Edge**: the `.lua` files are written directly into the `USER_AI` folder (File System Access API). The browser asks for permission the first time.
   - **Firefox / Safari**: these browsers cannot write to folders, so Apply downloads `AzzyAI_config.zip`. Extract it into `USER_AI`.

The last applied configuration is kept in the browser's local storage and reloaded next time. The page warns before closing if there are unapplied edits.

## Using it in an AzzyAI fork

Add this repository as a submodule next to `USER_AI`:

```
git submodule add https://github.com/jknpj/AzzyAI-webgui.git webgui
```

**Help > Documentation** opens `../USER_AI/Documentation.pdf`, so it only works with that folder layout.

Things specific to a fork:

- `templates.js`: default contents of the `.lua` files, used by *Reset to Defaults* and when no folder is open. Keep it in sync with your fork's `USER_AI`.
- `homSchema.js` / `merSchema.js`: the options shown in each tab, with their types, ranges and descriptions. Add entries here when your fork adds new config options.
- `app.js`: `ABOUT_TEXT` (Help > About).

## Files

| File | Purpose |
|---|---|
| `index.html` | Page layout (Bootstrap 5, JSZip from CDN) |
| `app.js` | UI, Apply/Revert/Reset, import/export, folder access |
| `luaConfig.js` | Reads and writes `H_Config.lua` / `M_Config.lua`, keeping unknown lines |
| `tactics.js` | Reads and writes tactics and PVP tactics files |
| `homSchema.js`, `merSchema.js` | Option definitions |
| `templates.js` | Default `.lua` files |
| `azzyai.ico` | Icon (by Kami Kali) |

All scripts are plain classic scripts (no modules, no build), so the page also works from `file://`.

## Development

Syntax check (Windows `cmd`):

```
for %f in (*.js) do node --check %f
```

## Credits

AzzyAI by Dr. Azzy. Desktop GUI by Machiavellian and contributors. Icon by Kami Kali.
