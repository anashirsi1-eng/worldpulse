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

function createMarker(lat, lon, size, color, title, info) {

  const marker = L.circleMarker([lat, lon], {
    radius: size,
    color: color,
    fillColor: color,
    fillOpacity: 0.7,
    weight: 2
  });

  marker.bindPopup(`
    <div style="min-width:200px; font-family:Arial;">
      <h2 style="color:${color}; margin-bottom:10px;">
        ${title}
      </h2>

      <p>${info}</p>
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

    if (!magnitude || magnitude < 4.5) return;

};
