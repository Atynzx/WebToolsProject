const state = {
  theme: 'dark',
  radar: {
    level: 'level3',
    site: 'KTLX',
    product: 'N0Q',
    opacity: 0.85,
    frameCount: 12,
    frameIndex: 11,
    playing: false,
    timer: null
  },
  settingsCategory: 'radarRendering',
  styles: {
    tornado_radar: { label: 'Tornado Warning · Radar Indicated', color: '#ffc107', weight: 2, visible: true },
    tornado_observed: { label: 'Tornado Warning · Observed', color: '#ff7043', weight: 2, visible: true },
    tornado_pds: { label: 'Tornado Warning · Particularly Dangerous Situation', color: '#ff1744', weight: 3, visible: true },
    tornado_emergency: { label: 'Tornado Warning · Emergency', color: '#9b0000', weight: 3, visible: true },
    severe_warning: { label: 'Severe Thunderstorm Warning', color: '#fdd835', weight: 2, visible: true },
    flood_warning: { label: 'Flash Flood Warning', color: '#43a047', weight: 2, visible: true },
    watch_tornado: { label: 'Tornado Watch', color: '#8e24aa', weight: 2, visible: true },
    watch_severe: { label: 'Severe Thunderstorm Watch', color: '#5e35b1', weight: 2, visible: true },
    advisory_general: { label: 'Advisories (General)', color: '#42a5f5', weight: 1, visible: true }
  }
};

const radarProducts = {
  Reflectivity: 'N0Q',
  'Base Reflectivity': 'N0Q',
  'Composite Reflectivity': 'NCR',
  Velocity: 'N0U',
  'Base Velocity': 'N0U',
  'Storm Relative Velocity': 'N0S',
  'Correlation Coefficient (CC)': 'N0C',
  'Differential Reflectivity (ZDR)': 'N0X',
  'Specific Differential Phase (KDP)': 'N0K',
  'Echo Tops': 'EET',
  'Vertically Integrated Liquid (VIL)': 'N0V',
  'One Hour Precipitation': 'DAA'
};

const nexradSites = [
  ['KTLX', 'Oklahoma City, OK', 35.333, -97.277], ['KFDR', 'Frederick, OK', 34.362, -98.976], ['KVNX', 'Vance AFB, OK', 36.741, -98.127],
  ['KDGX', 'Brandon, MS', 32.280, -89.985], ['KBMX', 'Birmingham, AL', 33.171, -86.769], ['KFFC', 'Peachtree City, GA', 33.363, -84.566],
  ['KTLH', 'Tallahassee, FL', 30.398, -84.329], ['KMLB', 'Melbourne, FL', 28.113, -80.654], ['KAMX', 'Miami, FL', 25.611, -80.413],
  ['KBUF', 'Buffalo, NY', 42.949, -78.736], ['KTYX', 'Fort Drum, NY', 43.756, -75.681], ['KOKX', 'New York, NY', 40.865, -72.864],
  ['KLOT', 'Chicago, IL', 41.604, -88.084], ['KILX', 'Lincoln, IL', 40.151, -89.337], ['KDVN', 'Davenport, IA', 41.612, -90.581],
  ['KDMX', 'Des Moines, IA', 41.731, -93.723], ['KOAX', 'Omaha, NE', 41.320, -96.367], ['KLNX', 'North Platte, NE', 41.957, -100.576],
  ['KAMA', 'Amarillo, TX', 35.233, -101.709], ['KLBB', 'Lubbock, TX', 33.654, -101.814], ['KHGX', 'Houston/Galveston, TX', 29.472, -95.079],
  ['KEWX', 'Austin/San Antonio, TX', 29.704, -98.029], ['KCRP', 'Corpus Christi, TX', 27.784, -97.511], ['KSHV', 'Shreveport, LA', 32.451, -93.841],
  ['KMHX', 'Morehead City, NC', 34.776, -76.876], ['KRAX', 'Raleigh, NC', 35.665, -78.490], ['KCLX', 'Charleston, SC', 32.655, -81.043],
  ['KDIX', 'Mt. Holly, NJ', 39.947, -74.411], ['KDOX', 'Dover, DE', 38.826, -75.440], ['KAKQ', 'Wakefield, VA', 36.983, -77.008],
  ['KABR', 'Aberdeen, SD', 45.456, -98.413], ['KGGW', 'Glasgow, MT', 48.212, -106.625], ['KTFX', 'Great Falls, MT', 47.459, -111.385],
  ['KRIW', 'Riverton, WY', 43.066, -108.477], ['KFTG', 'Denver/Boulder, CO', 39.786, -104.545], ['KPUX', 'Pueblo, CO', 38.459, -104.181],
  ['KGJX', 'Grand Junction, CO', 39.062, -108.214], ['KATX', 'Seattle/Tacoma, WA', 48.194, -122.496], ['KRTX', 'Portland, OR', 45.715, -122.965],
  ['KMUX', 'San Francisco Bay, CA', 37.156, -121.898], ['KNKX', 'San Diego, CA', 32.919, -117.041], ['KYUX', 'Yuma, AZ', 32.495, -114.657]
].map(([id, name, lat, lon]) => ({ id, name, lat, lon }));

const basemaps = {
  'Carto Dark': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap &copy; CARTO' }),
  'Carto Light': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap &copy; CARTO' }),
  'OpenStreetMap': L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }),
  Satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri' })
};

const map = L.map('map', {
  zoomControl: true, worldCopyJump: true, inertia: true, inertiaDeceleration: 2600,
  easeLinearity: 0.15, zoomAnimation: true, fadeAnimation: true, markerZoomAnimation: true, preferCanvas: true
}).setView([36, -97], 4);

let activeBasemap = basemaps['Carto Dark'].addTo(map);
let radarLayer;
const siteLayer = L.layerGroup().addTo(map);
const drawLayer = new L.FeatureGroup().addTo(map);
const nwsAlertLayer = L.geoJSON(null, { style: styleNwsFeature, onEachFeature: bindNwsPopup }).addTo(map);
const spcWatchLayer = L.geoJSON(null, { style: { color: '#9c27b0', weight: 2, fillOpacity: 0.1 } }).addTo(map);
const mcdLayer = L.geoJSON(null, { style: { color: '#03a9f4', weight: 2, dashArray: '5 4', fillOpacity: 0.08 } }).addTo(map);

map.addControl(new L.Control.Draw({ edit: { featureGroup: drawLayer }, draw: { circlemarker: false } }));
map.on(L.Draw.Event.CREATED, e => drawLayer.addLayer(e.layer));

function bindNwsPopup(feature, layer) {
  const p = feature.properties || {};
  layer.bindPopup(`<b>${p.event || 'Alert'}</b><br>${p.headline || ''}<br><small>${p.areaDesc || ''}</small>`);
}

function classifyAlert(props = {}) {
  const event = (props.event || '').toLowerCase();
  const text = `${props.description || ''} ${props.headline || ''}`.toLowerCase();
  if (event.includes('tornado warning')) {
    if (text.includes('emergency')) return 'tornado_emergency';
    if (text.includes('particularly dangerous situation') || text.includes('pds')) return 'tornado_pds';
    if (text.includes('observed') || text.includes('confirmed')) return 'tornado_observed';
    return 'tornado_radar';
  }
  if (event.includes('severe thunderstorm warning')) return 'severe_warning';
  if (event.includes('flash flood warning')) return 'flood_warning';
  if (event.includes('tornado watch')) return 'watch_tornado';
  if (event.includes('severe thunderstorm watch')) return 'watch_severe';
  if (event.includes('advisory')) return 'advisory_general';
  return 'advisory_general';
}

function styleNwsFeature(feature) {
  const key = classifyAlert(feature.properties);
  const cfg = state.styles[key] || state.styles.advisory_general;
  return { color: cfg.color, weight: cfg.weight, fillOpacity: 0.13 };
}

function alertVisible(props) {
  const cfg = state.styles[classifyAlert(props)] || state.styles.advisory_general;
  return cfg.visible;
}

function level3TileUrl(site, product, frameOffset) {
  return `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::${site}-${product}-${frameOffset}/{z}/{x}/{y}.png`;
}

function level2TileUrl(product) {
  const l2ProductMap = {
    N0Q: 'conus_cref_raw', NCR: 'conus_cref_raw', N0U: 'conus_bref_qcd', N0S: 'conus_bref_qcd',
    N0C: 'conus_cref_raw', N0X: 'conus_cref_raw', N0K: 'conus_cref_raw', EET: 'conus_cref_raw', N0V: 'conus_cref_raw', DAA: 'conus_cref_raw'
  };
  const layer = l2ProductMap[product] || 'conus_cref_raw';
  return { base: 'https://opengeo.ncep.noaa.gov/geoserver/conus/wms', layer };
}

function rebuildRadarLayer() {
  if (radarLayer) map.removeLayer(radarLayer);
  if (state.radar.level === 'level3') {
    const frameOffset = state.radar.frameCount - 1 - state.radar.frameIndex;
    radarLayer = L.tileLayer(level3TileUrl(state.radar.site, state.radar.product, frameOffset), {
      attribution: 'IEM / NOAA NEXRAD Level III', opacity: state.radar.opacity, maxZoom: 10
    }).addTo(map);
  } else {
    const def = level2TileUrl(state.radar.product);
    radarLayer = L.tileLayer.wms(def.base, {
      layers: def.layer, format: 'image/png', transparent: true, opacity: state.radar.opacity, version: '1.1.1', attribution: 'NOAA NCEP (L2 mosaic)'
    }).addTo(map);
  }
  updateTimestamp();
  updateSiteMeta();
}

function updateTimestamp() {
  const minutesAgo = (state.radar.frameCount - 1 - state.radar.frameIndex) * 5;
  const t = new Date(Date.now() - minutesAgo * 60000);
  document.getElementById('timestampLabel').textContent = t.toLocaleString();
  document.getElementById('timelineSlider').value = String(state.radar.frameIndex);
}

function updateSiteMeta() {
  const site = nexradSites.find(s => s.id === state.radar.site);
  const levelLabel = state.radar.level === 'level3' ? 'Level III Site' : 'Level II Mosaic';
  document.getElementById('siteMeta').innerHTML = `${site?.id || ''} — ${site?.name || ''}<br>Product: ${state.radar.product} · ${levelLabel}<br>Source: NOAA / IEM`;
}

function addSiteMarkers() {
  siteLayer.clearLayers();
  nexradSites.forEach(site => {
    const marker = L.circleMarker([site.lat, site.lon], { radius: 5.5, color: '#77a5ff', fillColor: '#1f4ec7', fillOpacity: 0.9, weight: 2 });
    marker.bindTooltip(`${site.id} · ${site.name}`);
    marker.on('click', async () => {
      state.radar.site = site.id;
      map.flyTo([site.lat, site.lon], Math.max(7, map.getZoom()), { duration: 0.9 });
      rebuildRadarLayer();
      await fetchSiteMetadata(site.id);
    });
    marker.addTo(siteLayer);
  });
}

async function fetchSiteMetadata(siteId) {
  try {
    const res = await fetch(`https://api.weather.gov/radar/stations/${siteId}`);
    if (!res.ok) return;
    const json = await res.json();
    const p = json.properties || {};
    document.getElementById('siteMeta').innerHTML = `${siteId} — ${p.name || 'NEXRAD Site'}<br>Product: ${state.radar.product} · ${state.radar.level.toUpperCase()}<br>Elevation: ${p.elevation?.value ? Math.round(p.elevation.value) + 'm' : 'N/A'} · Timezone: ${p.timeZone || 'N/A'}`;
  } catch {}
}

function populateSelectors() {
  const radarProductSelect = document.getElementById('radarProductSelect');
  Object.entries(radarProducts).forEach(([name, code]) => radarProductSelect.add(new Option(name, code)));
  radarProductSelect.value = state.radar.product;
  radarProductSelect.addEventListener('change', e => { state.radar.product = e.target.value; rebuildRadarLayer(); });

  document.getElementById('radarDataModeSelect').addEventListener('change', e => {
    state.radar.level = e.target.value;
    rebuildRadarLayer();
  });

  const modelSelect = document.getElementById('modelSelect');
  ['GFS', 'RAP', 'NAM', 'HRRR', 'RRFS'].forEach(m => modelSelect.add(new Option(m, m)));

  const basemapSelect = document.getElementById('basemapSelect');
  Object.keys(basemaps).forEach(name => basemapSelect.add(new Option(name, name)));
  basemapSelect.value = 'Carto Dark';
  basemapSelect.addEventListener('change', () => {
    map.removeLayer(activeBasemap);
    activeBasemap = basemaps[basemapSelect.value].addTo(map);
  });
}

function setPlaying(playing) {
  state.radar.playing = playing;
  document.getElementById('playPauseBtn').textContent = playing ? '⏸' : '▶';
  if (state.radar.timer) clearInterval(state.radar.timer);
  if (playing) {
    state.radar.timer = setInterval(() => {
      state.radar.frameIndex = (state.radar.frameIndex + 1) % state.radar.frameCount;
      rebuildRadarLayer();
    }, 700);
  }
}

function bindOverlayControls() {
  document.getElementById('playPauseBtn').addEventListener('click', () => setPlaying(!state.radar.playing));
  document.getElementById('stepBackBtn').addEventListener('click', () => {
    state.radar.frameIndex = Math.max(0, state.radar.frameIndex - 1);
    rebuildRadarLayer();
  });
  document.getElementById('stepForwardBtn').addEventListener('click', () => {
    state.radar.frameIndex = Math.min(state.radar.frameCount - 1, state.radar.frameIndex + 1);
    rebuildRadarLayer();
  });
  document.getElementById('timelineSlider').addEventListener('input', e => {
    state.radar.frameIndex = Number(e.target.value);
    rebuildRadarLayer();
  });
  document.getElementById('snapshotBtn').addEventListener('click', () => {
    const center = map.getCenter();
    alert(`Snapshot marker\nCenter: ${center.lat.toFixed(2)}, ${center.lng.toFixed(2)}\nTime: ${document.getElementById('timestampLabel').textContent}`);
  });
}

async function fetchNwsAlerts() {
  try {
    const res = await fetch('https://api.weather.gov/alerts/active?status=actual&message_type=alert');
    if (!res.ok) return;
    const json = await res.json();
    const features = (json.features || []).filter(f => f.geometry && alertVisible(f.properties));
    nwsAlertLayer.clearLayers();
    nwsAlertLayer.addData({ type: 'FeatureCollection', features });
    nwsAlertLayer.eachLayer(layer => layer.setStyle(styleNwsFeature(layer.feature)));
  } catch {}
}

async function fetchSpc() {
  try {
    const [watchJson, mcdJson] = await Promise.all([
      fetch('https://www.spc.noaa.gov/products/watch/watches.json').then(r => r.json()),
      fetch('https://www.spc.noaa.gov/products/md/validmd.geojson').then(r => r.json())
    ]);
    spcWatchLayer.clearLayers();
    mcdLayer.clearLayers();
    if (watchJson.features) spcWatchLayer.addData({ type: 'FeatureCollection', features: watchJson.features });
    if (mcdJson.features) mcdLayer.addData(mcdJson);
  } catch {}
}

function renderLegend() {
  const items = [
    ['Radar Sites', '#1f4ec7'],
    ['Tornado Warning', state.styles.tornado_observed.color],
    ['Severe Warning', state.styles.severe_warning.color],
    ['Flood Warning', state.styles.flood_warning.color],
    ['Watch', state.styles.watch_tornado.color],
    ['Advisory', state.styles.advisory_general.color]
  ];
  document.getElementById('legend').innerHTML = items.map(([n, c]) => `<li><span class="swatch" style="background:${c}"></span>${n}</li>`).join('');
}

function openSettings() {
  document.getElementById('settingsModal').classList.add('open');
  document.getElementById('settingsModal').setAttribute('aria-hidden', 'false');
  renderSettings();
}
function closeSettings() {
  document.getElementById('settingsModal').classList.remove('open');
  document.getElementById('settingsModal').setAttribute('aria-hidden', 'true');
}

function settingsCategories() {
  return [
    { key: 'radarRendering', label: 'Radar Rendering' },
    { key: 'warnings', label: 'Warnings' },
    { key: 'watches', label: 'Watches' },
    { key: 'advisories', label: 'Advisories' },
    { key: 'appearance', label: 'Appearance' }
  ];
}

function styleRows(keys) {
  return keys.map(key => {
    const s = state.styles[key];
    return `<div class="setting-card"><div class="setting-row">
      <div>${s.label}</div>
      <button class="eye-btn" data-action="toggle-visible" data-key="${key}">${s.visible ? '👁 Visible' : '🚫 Hidden'}</button>
      <input type="color" data-action="set-color" data-key="${key}" value="${s.color}" />
      <select data-action="set-weight" data-key="${key}">
        ${[1,2,3,4].map(w => `<option value="${w}" ${s.weight === w ? 'selected' : ''}>${w}px</option>`).join('')}
      </select>
    </div></div>`;
  }).join('');
}

function renderSettings() {
  const nav = document.getElementById('settingsNav');
  nav.innerHTML = settingsCategories().map(c => `<button class="btn ${state.settingsCategory === c.key ? 'btn-primary' : ''}" data-setting-category="${c.key}">${c.label}</button>`).join('');

  const content = document.getElementById('settingsContent');
  if (state.settingsCategory === 'radarRendering') {
    content.innerHTML = `<h3>Radar Settings</h3>
      <label>Radar Opacity
        <input id="radarOpacitySetting" type="range" min="0.2" max="1" step="0.05" value="${state.radar.opacity}" />
      </label>
      <p class="hint">Opacity moved to Settings per request. Overlay stays compact.</p>`;
  } else if (state.settingsCategory === 'warnings') {
    content.innerHTML = `<h3>Warnings</h3><p class="hint">Each warning subtype has independent visibility + style.</p>${styleRows(['tornado_radar','tornado_observed','tornado_pds','tornado_emergency','severe_warning','flood_warning'])}`;
  } else if (state.settingsCategory === 'watches') {
    content.innerHTML = `<h3>Watches</h3>${styleRows(['watch_tornado','watch_severe'])}`;
  } else if (state.settingsCategory === 'advisories') {
    content.innerHTML = `<h3>Advisories</h3>${styleRows(['advisory_general'])}`;
  } else {
    content.innerHTML = `<h3>Appearance</h3><p class="hint">Theme mode and UI density are controlled here.</p>
      <button class="btn" id="themeToggleInside">Toggle Theme</button>`;
  }

  nav.querySelectorAll('[data-setting-category]').forEach(btn => btn.addEventListener('click', () => {
    state.settingsCategory = btn.dataset.settingCategory;
    renderSettings();
  }));

  const opacityInput = document.getElementById('radarOpacitySetting');
  if (opacityInput) opacityInput.addEventListener('input', e => {
    state.radar.opacity = Number(e.target.value);
    rebuildRadarLayer();
  });

  const insideToggle = document.getElementById('themeToggleInside');
  if (insideToggle) insideToggle.addEventListener('click', toggleTheme);

  content.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('input', onSettingAction);
    el.addEventListener('change', onSettingAction);
    el.addEventListener('click', onSettingAction);
  });
}

function onSettingAction(e) {
  const key = e.target.dataset.key;
  const action = e.target.dataset.action;
  if (!key || !action) return;
  if (action === 'toggle-visible') state.styles[key].visible = !state.styles[key].visible;
  if (action === 'set-color') state.styles[key].color = e.target.value;
  if (action === 'set-weight') state.styles[key].weight = Number(e.target.value);
  renderSettings();
  fetchNwsAlerts();
  renderLegend();
}

function bindGlobalControls() {
  document.getElementById('openSettingsBtn').addEventListener('click', openSettings);
  document.getElementById('closeSettingsBtn').addEventListener('click', closeSettings);
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('toggleRadarSites').addEventListener('change', e => e.target.checked ? map.addLayer(siteLayer) : map.removeLayer(siteLayer));
  document.getElementById('toggleSpcWatches').addEventListener('change', e => e.target.checked ? map.addLayer(spcWatchLayer) : map.removeLayer(spcWatchLayer));
  document.getElementById('toggleMcd').addEventListener('change', e => e.target.checked ? map.addLayer(mcdLayer) : map.removeLayer(mcdLayer));
}

function toggleTheme() {
  document.body.classList.toggle('light');
  state.theme = document.body.classList.contains('light') ? 'light' : 'dark';
}

function modelCode(selected) {
  if (selected === 'HRRR') return 'hrrr';
  return 'gfs_global';
}

async function fetchModelAtPoint(lat, lon) {
  const model = document.getElementById('modelSelect').value;
  const field = document.getElementById('modelFieldSelect').value;
  const mCode = modelCode(model);
  const modelCard = document.getElementById('modelCard');
  const soundingCard = document.getElementById('soundingCard');
  modelCard.textContent = 'Loading model data...';
  soundingCard.textContent = 'Loading sounding...';
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&models=${mCode}&hourly=temperature_2m,windspeed_10m,temperature_850hPa,temperature_500hPa,relative_humidity_700hPa,cape&forecast_days=1&timezone=UTC`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Model request failed');
    const j = await res.json();
    const h = j.hourly || {};
    const v = {
      temp2m: `${h.temperature_2m?.[0] ?? 'N/A'} °C`,
      wind10m: `${h.windspeed_10m?.[0] ?? 'N/A'} km/h`,
      cape: `${h.cape?.[0] ?? 'N/A'} J/kg`,
      rh700: `${h.relative_humidity_700hPa?.[0] ?? 'N/A'} %`
    }[field];
    modelCard.innerHTML = `<b>${model}</b> (${mCode})<br>Point: ${lat.toFixed(2)}, ${lon.toFixed(2)}<br>Field: <b>${v}</b>`;
    const profile = [
      ['1000mb', Number(h.temperature_2m?.[0] ?? 20)],
      ['850mb', Number(h.temperature_850hPa?.[0] ?? 10)],
      ['700mb', Number(h.temperature_850hPa?.[0] ?? 10) - 8],
      ['500mb', Number(h.temperature_500hPa?.[0] ?? -10)],
      ['300mb', Number(h.temperature_500hPa?.[0] ?? -10) - 20]
    ];
    soundingCard.innerHTML = `<b>Quick sounding</b><br>${profile.map(([p, t]) => `${p}: ${t.toFixed(1)}°C`).join('<br>')}`;
  } catch {
    modelCard.textContent = 'Model data unavailable.';
    soundingCard.textContent = 'Sounding unavailable.';
  }
}

map.on('click', e => fetchModelAtPoint(e.latlng.lat, e.latlng.lng));

populateSelectors();
bindOverlayControls();
bindGlobalControls();
addSiteMarkers();
rebuildRadarLayer();
renderLegend();
fetchNwsAlerts();
fetchSpc();
setInterval(fetchNwsAlerts, 180000);
setInterval(fetchSpc, 300000);
