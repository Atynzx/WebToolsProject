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

## Run locally

```bash
cd WeatherScopePro
python3 -m http.server 8080
```

Open http://localhost:8080
