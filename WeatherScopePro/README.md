# WeatherScope Pro

Refactored weather workstation with a map-first radar UI and structured settings system.

## What was fixed and improved

- Repaired broken behavior with a full code pass and rebuilt app flow.
- Moved radar controls from sidebar into a **bottom in-map overlay**.
- Added radar overlay controls:
  - Play/Pause loop
  - Frame step back/forward
  - Snapshot button
  - Timeline scrubber + timestamp
  - Radar product selector
  - Dynamic site metadata panel
- Added **NEXRAD Level III (site-based)** and **Level II mosaic** viewing mode.
- Expanded NEXRAD product list including reflectivity, velocity, dual-pol, and derived products.
- Added many additional NEXRAD site markers across the U.S.
- Added **Settings modal** with categories:
  - Radar Rendering
  - Warnings
  - Watches
  - Advisories
  - Appearance
- Added per-alert-subtype controls (visibility + color + line weight), including:
  - Tornado Warning (Radar, Observed, PDS, Emergency)
  - Severe / Flood warnings
  - Watches
  - Advisories

## GitHub "fix it" buttons (important)

If GitHub shows warnings and offers quick-fix choices, avoid using them blindly on this project.
Those one-click options can reformat or replace code blocks and accidentally break the app.

Safer workflow:

1. Pull latest changes locally.
2. Run the app and reproduce the issue.
3. Make a targeted edit in the affected file.
4. Re-test locally before pushing.
5. Open a PR so the diff can be reviewed line-by-line.

If you are fixing merge conflicts specifically:

- Prefer manual conflict resolution in your editor.
- Keep both sides only when they are truly compatible.
- Re-run checks (`node --check app.js`) and open the app after resolving.

## Run locally

```bash
cd WeatherScopePro
python3 -m http.server 8080
```

Open http://localhost:8080
