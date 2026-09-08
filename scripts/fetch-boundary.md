# Getting cra_boundary.geojson

The site checks addresses against the exact CRA polygon. It is not in the repo yet.

1. Open the city Geohub dataset "South St. Pete Community Redevelopment Area":
   https://geohub-csp.opendata.arcgis.com/datasets/81d48cd538f34c7f9aba176f2a85a2e0
2. Download -> GeoJSON.
3. Save it as `public/cra_boundary.geojson` (WGS84 / EPSG:4326 - Hub exports this by default).
4. Sanity check in a browser: geojson.io - the polygon should sit between 2nd Ave N, 4th St S, 30th Ave S and 49th St S.

Reference map published by the city (same boundary, interactive):
https://egis.stpete.org/portal/apps/webappviewer/index.html?id=23110ee207fd4a74824a45222b9a4325

Claude Code: if the Hub API download URL resolves from the CLI, script it; otherwise this stays a one-time manual step.
