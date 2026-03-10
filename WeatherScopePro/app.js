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
