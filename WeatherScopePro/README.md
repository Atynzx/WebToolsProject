# WeatherScope Pro

Modernized weather workstation web app with a cleaner operational layout.

## Included capabilities

- Modern tabbed UI for **Radar**, **Layers**, **Models**, and **Map settings**
- Smoother map movement/zoom animations tuned for operational navigation
- NEXRAD network markers (clickable radar sites)
- Site-specific NEXRAD product loading (NOAA/IEM tile source), including:
  - Base Reflectivity
  - Super-Res Reflectivity
  - Base Velocity
  - Storm Relative Motion
  - Enhanced Echo Tops
  - Correlation Coefficient
- Hazard overlays for active warnings, SPC watches, and mesoscale discussions
- Warning severity category filtering and fully customizable colors
- Built-in drawing tools
- Model point viewer + quick sounding card (GFS/HRRR direct, RAP/NAM/RRFS mapped fallback)
- Light/dark theme toggle
A professional-style weather web app with:

- Global basemaps and radar overlays (RainViewer + NOAA products)
- Live warning polygons with category controls (regular, PDS/considerable, emergency/destructive)
- Weather watch and mesoscale discussion overlays
- User-customizable warning/watch colors and visibility
- Map drawing tools (markers, polygons, lines, etc.)
- Click-to-load model guidance and quick sounding profile
- Light/dark mode and responsive panel layout

## Run locally

```bash
cd WeatherScopePro
python3 -m http.server 8080
```

Open http://localhost:8080
