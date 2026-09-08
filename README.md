# South St. Pete CRA Homebuyer Site

Free community resource by IBuyStPete.com. Check an address, run your numbers, see what the city may contribute.

## Launch (Chromebook, minimal terminal)
1. Push this folder to GitHub as `JoshuaStreeter/southside-cra` (GitHub web: New repo -> "uploading an existing file" -> drag the folder contents).
2. Open Claude Code (cloud or desktop) on the repo and paste:
   > Read CLAUDE.md and the two source-of-truth files. Build the site in `public/` per the brief, starting with the calculator and address check. Run `/design` before writing the page. Stop and ask before any dependency beyond Leaflet.
3. Netlify: New site from Git -> this repo. Site settings -> Environment variables -> `ANTHROPIC_API_KEY`.
4. Drop `cra_boundary.geojson` into `public/` (see `scripts/fetch-boundary.md`) and `hero.jpg` into `public/img/`.

## Editing program facts later
- Numbers: `data/program-data.json` (update `lastVerified`).
- Rules, status, first-hand notes: `knowledge/CRA_Knowledge_V4.md` (add a dated, tagged line + Changelog entry).
- Redeploy. Both the calculator and the chat assistant pick up the change.
