# South St. Pete CRA Homebuyer Site

Free community resource by IBuyStPete.com. Check an address, run your numbers, see what the city may contribute.

## Launch (Chromebook, minimal terminal)
1. Push this folder to GitHub as `JoshuaStreeter/southside-cra` (GitHub web: New repo -> "uploading an existing file" -> drag the folder contents).
2. Open Claude Code (cloud or desktop) on the repo and paste:
   > Read CLAUDE.md and the two source-of-truth files. Build the site in `public/` per the brief, starting with the calculator and address check. Run `/design` before writing the page. Stop and ask before any dependency beyond Leaflet.
3. Netlify: New site from Git -> this repo. Site settings -> Environment variables -> `ANTHROPIC_API_KEY`.
4. Drop `cra_boundary.geojson` into `public/` (see `scripts/fetch-boundary.md`) and `hero.jpg` into `public/img/`.

## Two things the site is waiting on
Until these are added, the site still works - it just says so plainly instead of guessing.
- **`public/cra_boundary.geojson`** - without it the address check is switched off and points people at the city's own map. See `scripts/fetch-boundary.md`.
- **`public/img/hero.jpg`** - without it the top of the page is flat navy behind the headline. Any wide neighborhood photo works.

## Checking it still works
Run `npm run verify` (or `bash verify.sh`). It checks the numbers file is valid, that no dollar figure is hardcoded into the page, that the calculator still gets the known answers right, and that the chat function responds. It never changes anything, so it is safe to run any time - especially after editing a number.

## Editing program facts later
- Numbers: `public/data/program-data.json` (update `lastVerified`).
- Rules, status, first-hand notes: `knowledge/CRA_Knowledge_V4.md` (add a dated, tagged line + Changelog entry).
- Redeploy. Both the calculator and the chat assistant pick up the change.
