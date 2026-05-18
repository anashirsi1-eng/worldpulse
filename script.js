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
    <div style="min-width:240px; color:white;">
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

    let size = 12;

    if (magnitude >= 7) {
      size = 34;
    }

    else if (magnitude >= 6) {
      size = 24;
    }

    else if (magnitude >= 5) {
      size = 18;
    }

    createMarker(
      lat,
      lon,
      size,
      '#ff3355',
      'Earthquake',
      `
      ${quake.properties.place}
      <br><br>
      Magnitude: ${magnitude}
      `,
      magnitude >= 7 ? 'Extreme' : 'High'
    );

  });

}

async function loadEONETEvents() {

  const response = await fetch(
    'https://eonet.gsfc.nasa.gov/api/v3/events'
  );

  const data = await response.json();

  let wildfireCount = 0;
  let stormCount = 0;
  let volcanoCount = 0;

  data.events.forEach(event => {

    if (!event.geometry || !event.geometry.length) return;

    const latest = event.geometry[event.geometry.length - 1];

    if (!latest.coordinates) return;

    const lon = latest.coordinates[0];
    const lat = latest.coordinates[1];

    const category = event.categories[0].title;

    // WILDFIRES
    if (
      category === 'Wildfires' &&
      activeFilters.wildfires &&
      wildfireCount < 35
    ) {

      wildfireCount++;

      createMarker(
        lat,
        lon,
        5,
        '#ff9800',
        'Wildfire',
        `
        ${event.title}
        <br><br>
        Active wildfire zone detected
        `,
        'Moderate'
      );
    }

    // STORMS
    if (
      category === 'Severe Storms' &&
      activeFilters.storms &&
      stormCount < 15
    ) {

      stormCount++;

      createMarker(
        lat,
        lon,
        12,
        '#9b6dff',
        'Storm System',
        `
        ${event.title}
        <br><br>
        Major storm activity detected
        `,
        'High'
      );
    }

    // VOLCANOES
    if (
      category === 'Volcanoes' &&
      activeFilters.volcanoes &&
      volcanoCount < 12
    ) {

      volcanoCount++;

      createMarker(
        lat,
        lon,
        10,
        '#700000',
        'Volcanic Activity',
        `
        ${event.title}
        <br><br>
        Elevated volcanic activity
        `,
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

window.toggleFilter = function(type) {

  activeFilters[type] = !activeFilters[type];

  loadEverything();

};

loadEverything();

setInterval(loadEverything, 300000);
