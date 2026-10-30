# AzzyAI Web Configuration

Browser-based configuration tool for [AzzyAI](https://github.com/SpenceKonde/AzzyAI), the Ragnarok Online homunculus and mercenary AI. It has the same features as the Windows `AzzyAIConfig.exe` GUI, but runs in any modern browser and needs no installation or build step.

## Features

- **Homunculus settings** (`H_Config.lua`): every option, grouped in the same categories as the desktop GUI, with search across all categories, Homunculus S / base type filters and a description for each option.
- **Mercenary settings** (`M_Config.lua`): categorized (collapsible groups) or alphabetical view, with search.
- **Changes at a glance**: options that differ from the default are marked and have a ↺ button to restore the default; "Only changed from default" lists just those. The footer and the tabs show what has not been applied yet.
- **Tactics** (`H_Tactics.lua`, `M_Tactics.lua`): add, edit and remove per-monster tactics.
- **PVP tactics** (`H_PVP_Tact.lua`, `M_PVP_Tact.lua`).
- **Extra options** (`H_Extra.lua`, `M_Extra.lua`): free-text editor.
- **Apply / Revert / Reset to Defaults**, import and export of individual files or all files at once.
- Official / private server selection (`ServerType`).
- **Three languages**: English, Português (BR) and Español (LatAm). The 🌐 menu switches the whole interface, the option descriptions, the list labels and the tactics; the choice is remembered and the first visit follows the browser language. Setting names stay in English, since they are the names in the `.lua` files.
- **Homunculus skills**: a skill window with the icons of the selected homunculi (click one to see only its settings), a skill icon next to each setting that controls a skill, and a skill card with the official LATAM numbers at max level and the in-game description in the chosen language. Icons, official names and descriptions are a local copy (`skilldata.js`, `img/skills/`), so the page works offline and loads nothing from third-party sites except Bootstrap/JSZip.
- **Ragnarok look** in both themes: blue title bars and framed panels like the in-game windows, in a light and a dark version (or following the system), plus a layout that works on phones.
- Works with **AzzyAI HG** and with the **classic AzzyAI** (master branch, config GUI 1.56). See below.

## AzzyAI versions

The selector at the bottom left chooses which AzzyAI the files are for:

- **AzzyAI HG**: every option.
- **AzzyAI Classic**: hides the options the classic AI does not use (server type, the newer Homunculus S skills, Dieter Tempering/Blast Forge, Eira Light of Regenerate, inherited Bloodlust/SBR44) and does not write them to `H_Config.lua`.

When you open a `USER_AI` folder, the version is detected automatically: HG defines `ServerType` in `Defaults.lua`, the classic AI does not. Tactics and PVP tactics files have the same format in both versions. The list of HG-only options is `AzzyHomHgOnly` in `homSchema.js`.

## Usage

Open `index.html` in a browser. A local file (`file://`) works, as does any static host.

Hosted version: **https://jknpj.github.io/AzzyAI-webgui/**

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

**Help > Documentation** opens `../USER_AI/Documentation.pdf` when the page sits next to `USER_AI`; otherwise (e.g. on GitHub Pages) it opens `DOC_ONLINE_URL` from `app.js`.

Things specific to a fork:

- `templates.js`: default contents of the `.lua` files, used by *Reset to Defaults* and when no folder is open. Keep it in sync with your fork's `USER_AI`.
- `homSchema.js` / `merSchema.js`: the options shown in each tab, with their types, ranges and descriptions. Add entries here when your fork adds new config options, and their translations to `i18n.desc.pt.js` / `i18n.desc.es.js` (untranslated ones show in English).
- `skills.js`: which settings belong to which skill, and the skill numbers shown on the skill card (official values from `USER_AI/H_SkillList.lua`).
- `app.js`: `aboutText()` (Help > About) and `DOC_ONLINE_URL`.

## Translations

UI text is written in English in the code and translated through `tr('English text')` (`app.js`) or `data-i18n="English text"` attributes (`index.html`). `i18n.strings.js` maps each English text to its Portuguese and Spanish version; setting descriptions are in `i18n.desc.pt.js` and `i18n.desc.es.js`, keyed by setting name. Anything without a translation falls back to English, so a new string can be added to the code first and translated later.

## Skill data

`skilldata.js` (official names and in-game descriptions) and `img/skills/<id>.png` are generated from the [Divine Pride API](https://www.divine-pride.net/tools/api-doc) by `skilldata_sync.py`: English from the iRO client, Portuguese from the LATAM client. Divine Pride has no Spanish LATAM text (the LATAM server always answers in Portuguese), so in Spanish the page shows the Spanish names from `skills.js` and the English in-game descriptions. It needs a free API key from your Divine Pride profile and only the Python standard library:

```
set DIVINEPRIDE_API_KEY=<your key>
python skilldata_sync.py
```

The skills it fetches are the ones listed in `skills.js`. API answers are cached in `.cache/` (git-ignored), so running it again only asks for new skills; `--refresh` fetches everything again. Behind a proxy, set `HTTPS_PROXY` first. Until it has been run, the page uses the built-in names in `skills.js` and shows no descriptions.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page layout and the Ragnarok light/dark look (Bootstrap 5, JSZip from CDN) |
| `app.js` | UI, Apply/Revert/Reset, import/export, folder access |
| `luaConfig.js` | Reads and writes `H_Config.lua` / `M_Config.lua`, keeping unknown lines |
| `tactics.js` | Reads and writes tactics and PVP tactics files |
| `homSchema.js`, `merSchema.js` | Option definitions |
| `skills.js` | Homunculus skills: related settings, numbers, built-in names |
| `skilldata.js`, `img/skills/` | Official skill names, descriptions and icons (generated by `skilldata_sync.py`) |
| `i18n.js` | Language selection and lookup |
| `i18n.strings.js` | UI text in Portuguese and Spanish |
| `i18n.desc.pt.js`, `i18n.desc.es.js` | Option descriptions in Portuguese and Spanish |
| `templates.js` | Default `.lua` files |
| `azzyai.ico` | Icon (by Kami Kali) |

All scripts are plain classic scripts (no modules, no build), so the page also works from `file://`, also without a connection once Bootstrap and JSZip are in the browser cache.

## Development

`.github/workflows/pages.yml` runs `node --check` on every push and pull request, and publishes the site to GitHub Pages on pushes to `main`.

Syntax check (Windows `cmd`):

```
for %f in (*.js) do node --check %f
```

## Credits

AzzyAI by Dr. Azzy. Desktop GUI by Machiavellian and contributors. Icon by Kami Kali. Skill icons, names and descriptions from [Divine Pride](https://www.divine-pride.net). Ragnarok Online is property of Gravity Co.
