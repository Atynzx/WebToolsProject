const map = L.map('map', {
  zoomControl: true,
  worldCopyJump: true,
  inertia: true,
  inertiaDeceleration: 2200,
  easeLinearity: 0.15,
  zoomAnimation: true,
  fadeAnimation: true,
  markerZoomAnimation: true,
  preferCanvas: true
}).setView([36, -97], 4);

const basemaps = {
  "Carto Dark": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap &copy; CARTO' }),
  "Carto Light": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap &copy; CARTO' }),
  "OpenStreetMap": L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }),
  "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri' })
};

let activeBasemap = basemaps['Carto Dark'].addTo(map);

const radarProducts = {
  "Base Reflectivity (N0Q)": "N0Q",
  "Super-Res Reflectivity (N0B)": "N0B",
  "Base Velocity (N0U)": "N0U",
  "Storm Relative Motion (N0S)": "N0S",
  "Enhanced Echo Tops (EET)": "EET",
  "Correlation Coefficient (N0C)": "N0C"
};

const nexradSites = [
  { id: 'KTLX', name: 'Oklahoma City, OK', lat: 35.333, lon: -97.277 },
  { id: 'KFDR', name: 'Frederick, OK', lat: 34.362, lon: -98.976 },
  { id: 'KVNX', name: 'Vance AFB, OK', lat: 36.741, lon: -98.127 },
  { id: 'KDGX', name: 'Brandon, MS', lat: 32.280, lon: -89.985 },
  { id: 'KBMX', name: 'Birmingham, AL', lat: 33.171, lon: -86.769 },
  { id: 'KFFC', name: 'Peachtree City, GA', lat: 33.363, lon: -84.566 },
  { id: 'KTLH', name: 'Tallahassee, FL', lat: 30.398, lon: -84.329 },
  { id: 'KBUF', name: 'Buffalo, NY', lat: 42.949, lon: -78.736 },
  { id: 'KLOT', name: 'Chicago, IL', lat: 41.604, lon: -88.084 },
  { id: 'KDVN', name: 'Davenport, IA', lat: 41.612, lon: -90.581 },
  { id: 'KAMA', name: 'Amarillo, TX', lat: 35.233, lon: -101.709 },
  { id: 'KHGX', name: 'Houston/Galveston, TX', lat: 29.472, lon: -95.079 },
  { id: 'KMHX', name: 'Morehead City, NC', lat: 34.776, lon: -76.876 },
  { id: 'KDIX', name: 'Mt. Holly, NJ', lat: 39.947, lon: -74.411 },
  { id: 'KABR', name: 'Aberdeen, SD', lat: 45.456, lon: -98.413 },
  { id: 'KGGW', name: 'Glasgow, MT', lat: 48.212, lon: -106.625 },
  { id: 'KRIW', name: 'Riverton, WY', lat: 43.066, lon: -108.477 },
  { id: 'KFTG', name: 'Denver/Boulder, CO', lat: 39.786, lon: -104.545 },
  { id: 'KPUX', name: 'Pueblo, CO', lat: 38.459, lon: -104.181 },
  { id: 'KATX', name: 'Seattle/Tacoma, WA', lat: 48.194, lon: -122.496 }
];

const state = {
  selectedRadarSite: 'KTLX',
  selectedRadarProduct: 'N0Q',
  colors: {
    regular: '#f7b500', pds: '#ff4d4f', emergency: '#8f1d2c', watch: '#7c3aed', mcd: '#0ea5e9'
  }
};

let radarLayer;
const radarSitesLayer = L.layerGroup().addTo(map);
const drawLayer = new L.FeatureGroup().addTo(map);

map.addControl(new L.Control.Draw({ edit: { featureGroup: drawLayer }, draw: { circlemarker: false } }));
map.on(L.Draw.Event.CREATED, e => drawLayer.addLayer(e.layer));

const warningLayer = L.geoJSON(null, {
  style: f => ({ color: getWarningColor(f.properties), weight: 2, fillOpacity: 0.16 }),
  onEachFeature: (f, layer) => {
    const p = f.properties || {};
    layer.bindPopup(`<b>${p.event || 'Warning'}</b><br>${p.headline || ''}<br><small>${p.areaDesc || ''}</small>`);
const map = L.map('map', { zoomControl: true }).setView([25, 0], 3);

const basemapDefs = {
  "Light (Carto)": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap &copy; CARTO' }),
  "Dark (Carto)": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap &copy; CARTO' }),
  "OpenStreetMap": L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }),
  "ESRI Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri' })
};

const radarProducts = {
  "Global Radar (RainViewer)": {
    url: 'https://tilecache.rainviewer.com/v2/radar/nowcast_0/256/{z}/{x}/{y}/6/1_1.png',
    attribution: 'RainViewer',
    type: 'rainviewer'
  },
  "NEXRAD Base Reflectivity": {
    url: 'https://opengeo.ncep.noaa.gov/geoserver/conus/conus_cref_raw/ows?service=WMS&version=1.1.1&request=GetMap&layers=conus_cref_raw&styles=&format=image/png&transparent=true&srs=EPSG:3857&bbox={bbox-epsg-3857}&width=256&height=256',
    attribution: 'NOAA NCEP',
    type: 'wms'
  },
  "MRMS Composite Reflectivity": {
    url: 'https://idpgis.ncep.noaa.gov/arcgis/services/NWS_Observations/radar_base_reflectivity/MapServer/WMSServer?service=WMS&request=GetMap&layers=0&styles=&format=image/png&transparent=true&version=1.1.1&srs=EPSG:3857&bbox={bbox-epsg-3857}&width=256&height=256',
    attribution: 'NOAA MRMS',
    type: 'wms'
  }
};

let activeBasemap = basemapDefs['Light (Carto)'].addTo(map);
let activeRadar;

function buildTileLayer(def) {
  if (def.type === 'wms') {
    return L.tileLayer.wms(def.url.split('?')[0], {
      layers: /layers=([^&]+)/.exec(def.url)?.[1] || '0',
      format: 'image/png',
      transparent: true,
      attribution: def.attribution,
      opacity: Number(document.getElementById('radarOpacity').value)
    });
  }
  return L.tileLayer(def.url, {
    attribution: def.attribution,
    opacity: Number(document.getElementById('radarOpacity').value)
  });
}

function setRadarLayer(productName) {
  if (activeRadar) map.removeLayer(activeRadar);
  activeRadar = buildTileLayer(radarProducts[productName]);
  activeRadar.addTo(map);
}

const basemapSelect = document.getElementById('basemapSelect');
Object.keys(basemapDefs).forEach(name => {
  basemapSelect.add(new Option(name, name));
});

const radarSelect = document.getElementById('radarProductSelect');
Object.keys(radarProducts).forEach(name => radarSelect.add(new Option(name, name)));
radarSelect.value = 'Global Radar (RainViewer)';
setRadarLayer(radarSelect.value);

basemapSelect.addEventListener('change', () => {
  map.removeLayer(activeBasemap);
  activeBasemap = basemapDefs[basemapSelect.value].addTo(map);
});

radarSelect.addEventListener('change', () => setRadarLayer(radarSelect.value));
document.getElementById('radarOpacity').addEventListener('input', e => {
  if (activeRadar) activeRadar.setOpacity(Number(e.target.value));
});

const drawingLayer = new L.FeatureGroup().addTo(map);
map.addControl(new L.Control.Draw({
  edit: { featureGroup: drawingLayer },
  draw: { circlemarker: false }
}));
map.on(L.Draw.Event.CREATED, e => drawingLayer.addLayer(e.layer));

const styleState = {
  regular: '#ffbf00',
  pds: '#ff4500',
  emergency: '#b00020',
  watch: '#9c27b0',
  mcd: '#1976d2'
};

const warningLayer = L.geoJSON(null, {
  style: feature => ({ color: getWarningColor(feature.properties), weight: 2, fillOpacity: 0.15 }),
  onEachFeature: (feature, layer) => {
    const p = feature.properties;
    layer.bindPopup(`<b>${p.event || 'Warning'}</b><br>${p.headline || ''}<br><small>${p.severity || ''} ${p.urgency || ''}</small>`);
  }
}).addTo(map);

const watchLayer = L.geoJSON(null, {
  style: { color: state.colors.watch, weight: 2, fillOpacity: 0.12 },
  onEachFeature: (f, l) => l.bindPopup(`<b>Watch ${f.properties.NUM || ''}</b><br>${f.properties.TYPE || ''}`)
}).addTo(map);

const mcdLayer = L.geoJSON(null, {
  style: { color: state.colors.mcd, weight: 2, fillOpacity: 0.08, dashArray: '5 4' },
  onEachFeature: (f, l) => l.bindPopup(`<b>MCD ${f.properties.mcdnum || ''}</b><br>${f.properties.attnwsfo || ''}`)
}).addTo(map);

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

function setupSelectors() {
  const basemapSelect = document.getElementById('basemapSelect');
  Object.keys(basemaps).forEach(k => basemapSelect.add(new Option(k, k)));
  basemapSelect.value = 'Carto Dark';
  basemapSelect.addEventListener('change', () => {
    map.removeLayer(activeBasemap);
    activeBasemap = basemaps[basemapSelect.value].addTo(map);
  });

  const radarProductSelect = document.getElementById('radarProductSelect');
  Object.entries(radarProducts).forEach(([name, code]) => radarProductSelect.add(new Option(name, code)));
  radarProductSelect.value = state.selectedRadarProduct;
  radarProductSelect.addEventListener('change', () => {
    state.selectedRadarProduct = radarProductSelect.value;
    updateRadarLayer();
    updateSelectedSiteCard();
  });

  document.getElementById('radarOpacity').addEventListener('input', updateRadarLayer);

  const modelSelect = document.getElementById('modelSelect');
  ['GFS', 'RAP', 'NAM', 'HRRR', 'RRFS'].forEach(m => modelSelect.add(new Option(m, m)));
}

function tileUrlForSite(siteId, productCode) {
  return `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::${siteId}-${productCode}-0/{z}/{x}/{y}.png`;
}

function updateRadarLayer() {
  if (radarLayer) map.removeLayer(radarLayer);
  radarLayer = L.tileLayer(tileUrlForSite(state.selectedRadarSite, state.selectedRadarProduct), {
    attribution: 'IEM / NOAA NEXRAD',
    opacity: Number(document.getElementById('radarOpacity').value),
    maxZoom: 10
  }).addTo(map);
}

function addRadarSites() {
  radarSitesLayer.clearLayers();
  nexradSites.forEach(site => {
    const marker = L.circleMarker([site.lat, site.lon], {
      radius: 6,
      color: '#60a5fa',
      weight: 2,
      fillColor: '#1d4ed8',
      fillOpacity: 0.85
    });
    marker.bindTooltip(`${site.id} · ${site.name}`);
    marker.on('click', () => {
      state.selectedRadarSite = site.id;
      map.flyTo([site.lat, site.lon], Math.max(map.getZoom(), 7), { duration: 0.9, easeLinearity: 0.2 });
      updateRadarLayer();
      fetchRadarStationInfo(site.id);
      updateSelectedSiteCard();
    });
    marker.addTo(radarSitesLayer);
  });
}

async function fetchRadarStationInfo(stationId) {
  const card = document.getElementById('selectedSiteCard');
  card.innerHTML = `Loading station metadata for <b>${stationId}</b>...`;
  try {
    const res = await fetch(`https://api.weather.gov/radar/stations/${stationId}`);
    const j = await res.json();
    const p = j.properties || {};
    card.innerHTML = `<b>${stationId}</b> - ${p.name || 'NEXRAD Site'}<br>
      Product: <b>${state.selectedRadarProduct}</b><br>
      Timezone: ${p.timeZone || 'N/A'}<br>
      Elevation: ${p.elevation?.value ? `${Math.round(p.elevation.value)} m` : 'N/A'}<br>
      Status: ${p.rda?.properties?.status || 'Operational'}`;
  } catch {
    updateSelectedSiteCard();
  }
}

function updateSelectedSiteCard() {
  const site = nexradSites.find(s => s.id === state.selectedRadarSite);
  document.getElementById('selectedSiteCard').innerHTML = `<b>${site?.id || ''}</b> — ${site?.name || ''}<br>
  Product code: <b>${state.selectedRadarProduct}</b><br>
  Source: NOAA / IEM Level-III tiles`;
}
  style: { color: styleState.watch, weight: 2, fillOpacity: 0.1 },
  onEachFeature: (feature, layer) => {
    layer.bindPopup(`<b>Watch ${feature.properties.NUM || ''}</b><br>${feature.properties.TYPE || ''}`);
  }
}).addTo(map);

const mcdLayer = L.geoJSON(null, {
  style: { color: styleState.mcd, weight: 2, dashArray: '5,5', fillOpacity: 0.07 },
  onEachFeature: (feature, layer) => {
    layer.bindPopup(`<b>MCD ${feature.properties.mcdnum || ''}</b><br>${feature.properties.attnwsfo || ''}`);
  }
}).addTo(map);

function warningCategory(props = {}) {
  const text = `${props.description || ''} ${props.headline || ''} ${props.event || ''}`.toLowerCase();
  if (text.includes('emergency') || text.includes('destructive')) return 'emergency';
  if (text.includes('considerable') || text.includes('particularly dangerous situation') || text.includes('pds')) return 'pds';
  return 'regular';
}

function getWarningColor(props) {
  return state.colors[warningCategory(props)];
}

function warningAllowed(p) {
  if (!document.getElementById('toggleWarnings').checked) return false;
  const cat = warningCategory(p);
  if (cat === 'regular') return document.getElementById('toggleRegular').checked;
  if (cat === 'pds') return document.getElementById('togglePds').checked;
  return document.getElementById('toggleEmergency').checked;
}

async function fetchWarnings() {
  try {
    const res = await fetch('https://api.weather.gov/alerts/active?status=actual&message_type=alert');
    const j = await res.json();
    warningLayer.clearLayers();
    warningLayer.addData({ type: 'FeatureCollection', features: (j.features || []).filter(f => f.geometry && warningAllowed(f.properties)) });
    warningLayer.eachLayer(layer => layer.setStyle({ color: getWarningColor(layer.feature.properties) }));
  } catch (e) {
    console.error(e);
  }
}

async function fetchSpc() {
  try {
    const [w, m] = await Promise.all([
      fetch('https://www.spc.noaa.gov/products/watch/watches.json').then(r => r.json()),
      fetch('https://www.spc.noaa.gov/products/md/validmd.geojson').then(r => r.json())
    ]);
    watchLayer.clearLayers();
    mcdLayer.clearLayers();
    if (w.features) watchLayer.addData({ type: 'FeatureCollection', features: w.features });
    if (m.features) mcdLayer.addData(m);
  } catch (e) {
    console.error(e);
  }
}

function applyLayerStyles() {
  state.colors.regular = document.getElementById('regularColor').value;
  state.colors.pds = document.getElementById('pdsColor').value;
  state.colors.emergency = document.getElementById('emergencyColor').value;
  state.colors.watch = document.getElementById('watchColor').value;
  state.colors.mcd = document.getElementById('mcdColor').value;
  warningLayer.eachLayer(l => l.setStyle({ color: getWarningColor(l.feature.properties) }));
  watchLayer.setStyle({ color: state.colors.watch });
  mcdLayer.setStyle({ color: state.colors.mcd });
  renderLegend();
}

function bindLayerControls() {
  ['toggleWarnings', 'toggleRegular', 'togglePds', 'toggleEmergency'].forEach(id => {
    document.getElementById(id).addEventListener('change', fetchWarnings);
  });
  document.getElementById('toggleWatches').addEventListener('change', syncVisibility);
  document.getElementById('toggleMcd').addEventListener('change', syncVisibility);
  ['regularColor', 'pdsColor', 'emergencyColor', 'watchColor', 'mcdColor'].forEach(id => {
    document.getElementById(id).addEventListener('input', applyLayerStyles);
  });
  document.getElementById('toggleRadarSites').addEventListener('change', e => {
    if (e.target.checked) map.addLayer(radarSitesLayer);
    else map.removeLayer(radarSitesLayer);
  });
}

function syncVisibility() {
  const category = warningCategory(props);
  return styleState[category];
}

function warningVisible(props) {
  const category = warningCategory(props);
  const master = document.getElementById('toggleWarnings').checked;
  const allowRegular = document.getElementById('toggleWarningRegular').checked;
  const allowPds = document.getElementById('toggleWarningPds').checked;
  const allowEmergency = document.getElementById('toggleWarningEmergency').checked;
  if (!master) return false;
  if (category === 'regular') return allowRegular;
  if (category === 'pds') return allowPds;
  return allowEmergency;
}

async function fetchNwsWarnings() {
  try {
    const res = await fetch('https://api.weather.gov/alerts/active?status=actual&message_type=alert');
    const json = await res.json();
    const filtered = {
      type: 'FeatureCollection',
      features: (json.features || []).filter(f => f.geometry && warningVisible(f.properties))
    };
    warningLayer.clearLayers();
    warningLayer.addData(filtered);
    warningLayer.eachLayer(layer => layer.setStyle({ color: getWarningColor(layer.feature.properties) }));
  } catch (err) {
    console.error('Warning feed error', err);
  }
}

async function fetchSpcProducts() {
  try {
    const [watchRes, mcdRes] = await Promise.all([
      fetch('https://www.spc.noaa.gov/products/watch/watches.json'),
      fetch('https://www.spc.noaa.gov/products/md/validmd.geojson')
    ]);
    const watchJson = await watchRes.json();
    const mcdJson = await mcdRes.json();

    watchLayer.clearLayers();
    if (watchJson.features) {
      watchLayer.addData({ type: 'FeatureCollection', features: watchJson.features });
    }

    mcdLayer.clearLayers();
    if (mcdJson.features) {
      mcdLayer.addData(mcdJson);
    }
  } catch (err) {
    console.error('SPC products unavailable', err);
  }
}

const layerToggles = ['toggleWarnings', 'toggleWatches', 'toggleMcd', 'toggleWarningRegular', 'toggleWarningPds', 'toggleWarningEmergency'];
layerToggles.forEach(id => document.getElementById(id).addEventListener('change', () => {
  warningLayer.clearLayers();
  fetchNwsWarnings();
  toggleVisibility();
}));

function toggleVisibility() {
  document.getElementById('toggleWatches').checked ? map.addLayer(watchLayer) : map.removeLayer(watchLayer);
  document.getElementById('toggleMcd').checked ? map.addLayer(mcdLayer) : map.removeLayer(mcdLayer);
}

function renderLegend() {
  const entries = [
    ['Regular Warning', state.colors.regular],
    ['PDS Warning', state.colors.pds],
    ['Emergency Warning', state.colors.emergency],
    ['Watch', state.colors.watch],
    ['MCD', state.colors.mcd],
    ['NEXRAD Site', '#1d4ed8']
  ];
  document.getElementById('legend').innerHTML = entries.map(([n, c]) => `<li><span class="swatch" style="background:${c}"></span>${n}</li>`).join('');
}

function mappedModelCode(label) {
  if (label === 'HRRR') return 'hrrr';
  if (label === 'GFS') return 'gfs_global';
  return 'gfs_global';
}

async function fetchModelData(lat, lon) {
  const selectedModel = document.getElementById('modelSelect').value;
  const field = document.getElementById('modelFieldSelect').value;
  const modelCode = mappedModelCode(selectedModel);
  const modelCard = document.getElementById('modelCard');
  const soundingCard = document.getElementById('soundingCard');

  modelCard.textContent = 'Loading model data...';
  soundingCard.textContent = 'Loading sounding...';

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&models=${modelCode}&hourly=temperature_2m,windspeed_10m,temperature_850hPa,temperature_500hPa,relative_humidity_700hPa,cape&forecast_days=1&timezone=UTC`;
    const res = await fetch(url);
    const j = await res.json();
    const h = j.hourly || {};
    const fieldValue = {
      temp2m: `${h.temperature_2m?.[0] ?? 'N/A'} °C`,
      wind10m: `${h.windspeed_10m?.[0] ?? 'N/A'} km/h`,
      cape: `${h.cape?.[0] ?? 'N/A'} J/kg`,
      rh700: `${h.relative_humidity_700hPa?.[0] ?? 'N/A'} %`
    }[field];

    modelCard.innerHTML = `<b>${selectedModel}</b> (provider: ${modelCode})<br>
      Point: ${lat.toFixed(2)}, ${lon.toFixed(2)}<br>
      Selected field: <b>${fieldValue}</b><br>
      Temp 850mb: ${h.temperature_850hPa?.[0] ?? 'N/A'} °C · Temp 500mb: ${h.temperature_500hPa?.[0] ?? 'N/A'} °C`;

    const profile = [
      ['1000mb', Number(h.temperature_2m?.[0] ?? 18)],
      ['850mb', Number(h.temperature_850hPa?.[0] ?? 10)],
      ['700mb', Number(h.temperature_850hPa?.[0] ?? 10) - 8],
      ['500mb', Number(h.temperature_500hPa?.[0] ?? -8)],
      ['300mb', Number(h.temperature_500hPa?.[0] ?? -8) - 22]
    ];
    soundingCard.innerHTML = `<b>Quick sounding profile</b><br>${profile.map(([p, t]) => `${p}: ${t.toFixed(1)}°C`).join('<br>')}`;
  } catch {
    modelCard.textContent = 'Model unavailable.';
function updateStyleInputs() {
  styleState.regular = document.getElementById('warningRegularColor').value;
  styleState.pds = document.getElementById('warningPdsColor').value;
  styleState.emergency = document.getElementById('warningEmergencyColor').value;
  styleState.watch = document.getElementById('watchColor').value;
  styleState.mcd = document.getElementById('mcdColor').value;

  warningLayer.eachLayer(layer => layer.setStyle({ color: getWarningColor(layer.feature.properties) }));
  watchLayer.setStyle({ color: styleState.watch });
  mcdLayer.setStyle({ color: styleState.mcd });
  renderLegend();
}

['warningRegularColor', 'warningPdsColor', 'warningEmergencyColor', 'watchColor', 'mcdColor']
  .forEach(id => document.getElementById(id).addEventListener('input', updateStyleInputs));

const modelDataCard = document.getElementById('modelDataCard');
const soundingCard = document.getElementById('soundingCard');

async function fetchModelAndSounding(lat, lon) {
  modelDataCard.textContent = 'Loading model guidance...';
  soundingCard.textContent = 'Loading quick-look sounding...';
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&hourly=temperature_850hPa,temperature_500hPa,relative_humidity_700hPa,windspeed_10m&forecast_days=1&timezone=UTC`;
    const res = await fetch(url);
    const json = await res.json();
    const h = json.hourly || {};

    modelDataCard.innerHTML = `<b>Location:</b> ${lat.toFixed(2)}, ${lon.toFixed(2)}<br>
      <b>T850:</b> ${h.temperature_850hPa?.[0] ?? 'N/A'} °C<br>
      <b>T500:</b> ${h.temperature_500hPa?.[0] ?? 'N/A'} °C<br>
      <b>RH700:</b> ${h.relative_humidity_700hPa?.[0] ?? 'N/A'} %<br>
      <b>Surface Wind:</b> ${h.windspeed_10m?.[0] ?? 'N/A'} km/h`;

    const profile = [
      ['1000 hPa', (h.temperature_850hPa?.[0] ?? 15) + 6],
      ['850 hPa', h.temperature_850hPa?.[0] ?? 10],
      ['700 hPa', (h.temperature_850hPa?.[0] ?? 10) - 7],
      ['500 hPa', h.temperature_500hPa?.[0] ?? -8],
      ['300 hPa', (h.temperature_500hPa?.[0] ?? -8) - 20]
    ];

    soundingCard.innerHTML = `<b>Quick Sounding (Model-derived)</b><br>${profile.map(row => `${row[0]}: ${Number(row[1]).toFixed(1)}°C`).join('<br>')}`;
  } catch (err) {
    modelDataCard.textContent = 'Model data unavailable right now.';
    soundingCard.textContent = 'Sounding unavailable.';
  }
}

function setupTheme() {
  const btn = document.getElementById('themeToggle');
  btn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    btn.textContent = document.body.classList.contains('light') ? 'Dark Mode' : 'Light Mode';
  });
}

map.on('click', e => fetchModelData(e.latlng.lat, e.latlng.lng));

setupTabs();
setupSelectors();
setupTheme();
bindLayerControls();
addRadarSites();
updateRadarLayer();
updateSelectedSiteCard();
renderLegend();
syncVisibility();
fetchWarnings();
fetchSpc();
setInterval(fetchWarnings, 180000);
setInterval(fetchSpc, 300000);
map.on('click', e => fetchModelAndSounding(e.latlng.lat, e.latlng.lng));

function renderLegend() {
  const legend = document.getElementById('legendList');
  const items = [
    ['Regular Warning', styleState.regular],
    ['PDS/Considerable Warning', styleState.pds],
    ['Emergency/Destructive Warning', styleState.emergency],
    ['Watch', styleState.watch],
    ['Mesoscale Discussion', styleState.mcd]
  ];
  legend.innerHTML = items.map(([name, color]) => `<li><span class="swatch" style="background:${color}"></span>${name}</li>`).join('');
}

document.getElementById('darkModeBtn').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

renderLegend();
toggleVisibility();
fetchNwsWarnings();
fetchSpcProducts();
setInterval(fetchNwsWarnings, 180000);
setInterval(fetchSpcProducts, 300000);
