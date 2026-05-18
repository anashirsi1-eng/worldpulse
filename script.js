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
  volcanoes: true,
  news: true
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

      <h2 style="
        color:${color};
        margin-bottom:10px;
      ">
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
    'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson'
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
      size = 34;
    }

    else if (magnitude >= 6) {
      size = 24;
    }

    else if (magnitude >= 5) {
      size = 16;
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
      wildfireCount < 15
    ) {

      if (Math.random() > 0.15) return;

      wildfireCount++;

      createMarker(
        lat,
        lon,
        4,
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
        Severe weather activity detected
        `,
        'High'
      );
    }

    // VOLCANOES
    if (
      category === 'Volcanoes' &&
      activeFilters.volcanoes &&
      volcanoCount < 10
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

async function loadGDELTNews() {

  if (!activeFilters.news) return;

  try {

    const response = await fetch(
      'https://api.gdeltproject.org/api/v2/doc/doc?query=earthquake OR war OR wildfire OR hurricane&mode=artlist&maxrecords=20&format=json'
    );

    const data = await response.json();

    if (!data.articles) return;

    data.articles.forEach(article => {

      if (!article.sourceCountry) return;

      const randomLat =
        (Math.random() * 140) - 70;

      const randomLon =
        (Math.random() * 360) - 180;

      createMarker(
        randomLat,
        randomLon,
        6,
        '#00d4ff',
        'Breaking News',
        `
        <strong>${article.title}</strong>
        <br><br>
        Source:
        ${article.domain}
        `,
        'Breaking'
      );

    });

  }

  catch (err) {
    console.log('GDELT failed', err);
  }

}

async function loadEverything() {

  clearMarkers();

  await loadEarthquakes();

  await loadEONETEvents();

  await loadGDELTNews();

}

window.toggleFilter = function(type) {

  activeFilters[type] = !activeFilters[type];

  loadEverything();

};

loadEverything();

setInterval(loadEverything, 300000);
