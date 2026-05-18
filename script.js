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
  wars: true,
  wildfires: true,
  hurricanes: true
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
  casualties,
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
    <div style="min-width:230px;">

      <h2 style="
        color:${color};
        margin-bottom:10px;
      ">
        ${title}
      </h2>

      <div style="margin-bottom:12px;">
        ${info}
      </div>

      <div style="margin-bottom:8px;">
        <strong>Casualties:</strong>
        ${casualties}
      </div>

      <div>
        <strong>Severity:</strong>
        ${severity}
      </div>

    </div>
  `);

  marker.on('mouseover', function () {
    this.openPopup();
  });

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

    if (!magnitude || magnitude < 4.5) return;

    const coords = quake.geometry.coordinates;

    const lat = coords[1];
    const lon = coords[0];

    let size = 10;

    if (magnitude >= 7) {
      size = 28;
    } else if (magnitude >= 6) {
      size = 20;
    } else if (magnitude >= 5) {
      size = 15;
    }

    createMarker(
      lat,
      lon,
      size,
      '#ff3355',
      'Earthquake',
      `${quake.properties.place}<br><br>Magnitude: ${magnitude}`,
      'Data pending',
      magnitude >= 7 ? 'Extreme' : 'High'
    );

  });

}

function loadWars() {

  if (!activeFilters.wars) return;

  const wars = [

    {
      lat: 49,
      lon: 32,
      size: 20,
      title: 'Ukraine Conflict',
      info: 'Large-scale active war zone.',
      casualties: 'Thousands affected',
      severity: 'Critical'
    },

    {
      lat: 31.5,
      lon: 34.5,
      size: 16,
      title: 'Israel-Gaza Conflict',
      info: 'Heavy military activity reported.',
      casualties: 'High civilian risk',
      severity: 'Critical'
    },

    {
      lat: 15.5,
      lon: 32.5,
      size: 14,
      title: 'Sudan Crisis',
      info: 'Humanitarian conflict ongoing.',
      casualties: 'Mass displacement',
      severity: 'High'
    }

  ];

  wars.forEach(war => {

    createMarker(
      war.lat,
      war.lon,
      war.size,
      '#8b0000',
      war.title,
      war.info,
      war.casualties,
      war.severity
    );

  });

}

function loadWildfires() {

  if (!activeFilters.wildfires) return;

  const fires = [

    {
      lat: 34.2,
      lon: -118.4,
      size: 10,
      name: 'California Wildfire'
    },

    {
      lat: -33.8,
      lon: 151.2,
      size: 9,
      name: 'Australia Bushfire'
    }

  ];

  fires.forEach(fire => {

    createMarker(
      fire.lat,
      fire.lon,
      fire.size,
      '#ff8800',
      'Wildfire',
      fire.name,
      'Evacuations underway',
      'High'
    );

  });

}

function loadHurricanes() {

  if (!activeFilters.hurricanes) return;

  const storms = [

    {
      lat: 24,
      lon: -71,
      size: 24,
      name: 'Atlantic Hurricane System'
    }

  ];

  storms.forEach(storm => {

    createMarker(
      storm.lat,
      storm.lon,
      storm.size,
      '#8b5cf6',
      'Hurricane',
      storm.name,
      'Coastal danger zones active',
      'Extreme'
    );

  });

}

async function loadEverything() {

  clearMarkers();

  await loadEarthquakes();

  loadWars();

  loadWildfires();

  loadHurricanes();

}

loadEverything();

setInterval(loadEverything, 300000);

window.toggleFilter = function(type) {

  activeFilters[type] = !activeFilters[type];

  loadEverything();

};
