#!/usr/bin/env python3
"""Builds the offline skill data of the web GUI from the Divine Pride API.

Writes, next to index.html:
  skilldata.js         skill names and in-game descriptions in English, Portuguese and Spanish
  img/skills/<id>.png  skill icons
so the page needs no requests to Divine Pride. The skill IDs are the ones listed in skills.js.

Usage (needs a free API key from your divine-pride.net profile page):
    set DIVINEPRIDE_API_KEY=<your key>
    python skilldata_sync.py                  # uses the cache in .cache when present
    python skilldata_sync.py --refresh        # ask the API again
    python skilldata_sync.py --es LATAM:es-ES # other server/language for one language

Each language is "SERVER:Accept-Language" (defaults below). Divine Pride has no Spanish LATAM text:
the LATAM server answers in Portuguese whatever language is asked, so a Spanish answer identical to
the Portuguese one is dropped and the page uses its built-in Spanish names and the English
descriptions. Client names are taken from the first line of the description when it has one (the
API name of some new skills is the untranslated kRO name), and placeholder names such as MH_LAST
are dropped.

Answers are cached in .cache
(git-ignored) as https://www.divine-pride.net/tools/api-doc asks, and 429 answers are retried after
Retry-After. The key is only read from the environment and sent to the API; it is never printed
or saved. Standard library only; behind a proxy, set HTTPS_PROXY first.
"""
import argparse
import datetime
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

try:
    # optional: on Linux/macOS this makes Python trust the OS certificate store as well
    import truststore
    truststore.inject_into_ssl()
except ImportError:
    pass

ROOT = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(ROOT, ".cache")
ICONS = os.path.join(ROOT, "img", "skills")
OUT = os.path.join(ROOT, "skilldata.js")
API = "https://www.divine-pride.net/api/database/Skill/{id}"
ICON_URL = "https://static.divine-pride.net/images/skill/{id}.png"

# English from the iRO client, Portuguese and Spanish from the LATAM client
DEFAULTS = {"en": "iRO:en", "pt": "LATAM:pt-BR", "es": "LATAM:es"}


def skill_ids():
    with open(os.path.join(ROOT, "skills.js"), encoding="utf-8") as f:
        ids = [int(x) for x in re.findall(r"\bs\((\d{4}),", f.read())]
    if not ids:
        sys.exit("no skill IDs found in skills.js")
    return ids


def request(url, headers):
    req = urllib.request.Request(url, headers=dict({"User-Agent": "AzzyAI-webgui"}, **headers))
    for _ in range(5):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code != 429:
                raise
            wait = int(e.headers.get("Retry-After") or 30)
            print(f"  rate limited, waiting {wait} s")
            time.sleep(wait)
    raise RuntimeError("still rate limited, try again later")


def fetch_skill(sid, key, server, language, refresh, delay):
    """API answer for one skill, from the cache when possible. None if the server lacks it."""
    folder = os.path.join(CACHE, f"{server}-{language}")
    path = os.path.join(folder, f"{sid}.json")
    if os.path.exists(path) and not refresh:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    url = API.format(id=sid) + "?" + urllib.parse.urlencode({"apiKey": key})
    try:
        data = json.loads(request(url, {"Accept": "application/json", "Accept-Language": language,
                                        "x-server": server}).decode("utf-8"))
    except urllib.error.HTTPError as e:
        # report only the status: the request URL contains the key
        if e.code == 401:
            sys.exit("HTTP 401: the API key was refused")
        if e.code == 404:
            data = None
        else:
            sys.exit(f"HTTP {e.code} for skill {sid} ({server}, {language})")
    except urllib.error.URLError as e:
        sys.exit(f"network error: {e.reason}")
    os.makedirs(folder, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    time.sleep(delay)
    return data


TITLE_SKIP = re.compile(r"^(max|nível|nivel|level|lv|tipo|type|descri)", re.I)


def title_line(text):
    """The skill name some client texts start with ("Grande Fornalha\\nNível máximo: ..."), or None."""
    first = (text or "").replace("\r", "").strip().split("\n", 1)[0].strip()
    if not first or "^" in first or ":" in first or TITLE_SKIP.match(first) or len(first) > 40:
        return None
    return first


def clean_description(text):
    lines = (text or "").replace("\r\n", "\n").replace("\r", "\n").strip().split("\n")
    # the client text may start with the skill name, which the page already shows
    if lines and title_line(lines[0]):
        lines = lines[1:]
    return "\n".join(l.rstrip() for l in lines).strip()


def official_name(lang, data):
    """Skill name as the client shows it. LATAM's API name is sometimes the untranslated kRO name
    while the description starts with the Portuguese one (8044: Blast Forge / Grande Fornalha).
    iRO has placeholder names for some new skills (MH_LAST), which are dropped."""
    name = (data.get("name") or "").strip()
    # English titles aren't trusted: iRO's 8044 text is titled "Blazing Lava" but describes Blast Forge
    if lang != "en":
        name = title_line(data.get("description")) or name
    if re.fullmatch(r"[A-Z0-9_]+", name):
        return None
    return name or None


def save_icon(sid, data, refresh):
    path = os.path.join(ICONS, f"{sid}.png")
    if os.path.exists(path) and not refresh:
        return True
    url = (data or {}).get("iconUrl") or ICON_URL.format(id=sid)
    try:
        png = request(url, {})
    except (urllib.error.HTTPError, urllib.error.URLError):
        return False
    os.makedirs(ICONS, exist_ok=True)
    with open(path, "wb") as f:
        f.write(png)
    return True


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    for lang, default in DEFAULTS.items():
        parser.add_argument(f"--{lang}", default=default, help=f"SERVER:Accept-Language (default {default})")
    parser.add_argument("--refresh", action="store_true", help="ignore the cache and the icons already saved")
    parser.add_argument("--delay", type=float, default=1.0, help="seconds between API requests")
    args = parser.parse_args()

    key = os.environ.get("DIVINEPRIDE_API_KEY", "").strip()
    if not key:
        sys.exit("DIVINEPRIDE_API_KEY is not set (get it from your divine-pride.net profile page)")

    sources = {lang: getattr(args, lang).split(":", 1) for lang in DEFAULTS}
    ids = skill_ids()
    skills, missing, no_icon, same_es = {}, {lang: [] for lang in DEFAULTS}, [], []
    for sid in ids:
        entry = {"name": {}, "desc": {}}
        icon_data = None
        for lang, (server, language) in sources.items():
            data = fetch_skill(sid, key, server, language, args.refresh, args.delay)
            if not isinstance(data, dict) or not data.get("name"):
                missing[lang].append(sid)
                continue
            region = data.get("region")
            if region and region.lower() != server.lower():
                print(f"  warning: {sid} asked for {server}, got {region}")
            name = official_name(lang, data)
            if name:
                entry["name"][lang] = name
            entry["desc"][lang] = clean_description(data.get("description"))
            icon_data = icon_data or data
        # LATAM answers in Portuguese whatever language is asked: a Spanish copy of the Portuguese
        # text is dropped, so the page shows its own Spanish name and the English description
        if entry["desc"].get("es") and entry["desc"].get("es") == entry["desc"].get("pt"):
            entry["desc"].pop("es")
            entry["name"].pop("es", None)
            same_es.append(sid)
        if not save_icon(sid, icon_data, args.refresh):
            no_icon.append(sid)
        skills[sid] = entry
        print(f"{sid} " + " | ".join(entry["name"].get(l, "-") for l in DEFAULTS))

    if same_es:
        print(f"note: the Spanish source answered in Portuguese for {len(same_es)} skills; Spanish uses the "
              "built-in names and the English descriptions for them")

    header = [
        "// Generated by skilldata_sync.py from the Divine Pride API (https://www.divine-pride.net)",
        f"// on {datetime.date.today()}; do not edit by hand. Sources: "
        + ", ".join(f"{lang} = {s[0]} ({s[1]})" for lang, s in sources.items()) + ".",
        "// Skill names, descriptions and icons are Ragnarok Online data, property of Gravity Co.",
        "window.AzzySkillData = {",
    ]
    body = [f"  {sid}: {json.dumps(skills[sid], ensure_ascii=False, sort_keys=True)}," for sid in ids]
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(header + body + ["};", ""]))

    print(f"wrote {OUT}: {len(skills)} skills, icons in {ICONS}")
    for lang, lst in missing.items():
        if lst:
            print(f"  no {lang} data for: {lst}")
    if no_icon:
        print(f"  no icon for: {no_icon}")


if __name__ == "__main__":
    main()
