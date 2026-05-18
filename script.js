const map = L.map('map', {
  zoomControl: false,
  worldCopyJump: true
}).setView([20, 0], 2);

L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  }
).addTo(map);

const markers = L.layerGroup().addTo(map);

const activeFilters = {
  earthquakes: true,
  wildfires: true,
  storms: true,
  volcanoes: true
};

function clearMarkers() {
  markers.clearLayers();
}

function createMarker(
  lat,
  lon,
  size,
  color,
  title,
  info,
  severity
) {

  const marker = L.circleMarker([lat, lon], {
    radius: size,
    color: color,
    fillColor: color,
    fillOpacity: 0.7,
    weight: 2
  });

  marker.bindPopup(`
    <div style="min-width:240px;">

      <h2 style="color:${color}; margin-bottom:10px;">
        ${title}
      </h2>

      <div style="margin-bottom:10px;">
        ${info}
      </div>

      <div>
        <strong>Severity:</strong>
        ${severity}
      </div>

    </div>
  `);

  markers.addLayer(marker);
}

async function loadEarthquakes() {

  if (!activeFilters.earthquakes) return;

  const response = await fetch(
    'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson'
  );

  const data = await response.json();

  data.features.forEach(quake => {

    const magnitude = quake.properties.mag;

    if (!magnitude) return;

    const coords = quake.geometry.coordinates;

    const lat = coords[1];
    const lon = coords[0];

    let size = 10;

    if (magnitude >= 7) {
      size = 28;
    }

    else if (magnitude >= 6) {
      size = 20;
    }

    else {
      size = 14;
    }

    createMarker(
      lat,
      lon,
      size,
      '#ff3355',
      'Earthquake',
      `${quake.properties.place}<br><br>Magnitude: ${magnitude}`,
      magnitude >= 7 ? 'Extreme' : 'High'
    );

  });

}

async function loadEONETEvents() {

  const response = await fetch(
    'https://eonet.gsfc.nasa.gov/api/v3/events'
  );

  const data = await response.json();

  data.events.forEach(event => {

    if (!event.geometry || !event.geometry.length) return;

    const latest = event.geometry[event.geometry.length - 1];

    if (!latest.coordinates) return;

    const lon = latest.coordinates[0];
    const lat = latest.coordinates[1];

    const category = event.categories[0].title;

    if (
      category === 'Wildfires' &&
      activeFilters.wildfires
    ) {

      createMarker(
        lat,
        lon,
        10,
        '#ff8800',
        'Wildfire',
        event.title,
        'High'
      );

    }

    if (
      category === 'Severe Storms' &&
      activeFilters.storms
    ) {

      createMarker(
        lat,
        lon,
        16,
        '#8b5cf6',
        'Storm System',
        event.title,
        'Extreme'
      );

    }

    if (
      category === 'Volcanoes' &&
      activeFilters.volcanoes
    ) {

      createMarker(
        lat,
        lon,
        12,
        '#5b0000',
        'Volcano',
        event.title,
        'High'
      );

    }

  });

}

async function loadEverything() {

  clearMarkers();

  await loadEarthquakes();

  await loadEONETEvents();

}

loadEverything();

setInterval(loadEverything, 300000);

window.toggleFilter = function(type) {

  activeFilters[type] = !activeFilters[type];

  loadEverything();

};
