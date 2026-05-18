const map = L.map('map', {
  zoomControl: false
}).setView([20, 0], 2);

L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  }
).addTo(map);

const quakeLayer = L.layerGroup().addTo(map);

const redIcon = {
  color: '#ff3355',
  fillColor: '#ff3355',
  fillOpacity: 0.75
};

async function loadEarthquakes() {

  quakeLayer.clearLayers();

  const response = await fetch(
    'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
  );

  const data = await response.json();

  data.features.forEach(quake => {

    const coords = quake.geometry.coordinates;

    const magnitude = quake.properties.mag;
    const place = quake.properties.place;

    if (!magnitude || magnitude < 2.5) return;

    const lat = coords[1];
    const lon = coords[0];

    let size = 8;

    if (magnitude >= 5) {
      size = 18;
    } else if (magnitude >= 4) {
      size = 14;
    }

    const marker = L.circleMarker([lat, lon], {
      radius: size,
      ...redIcon
    });

    marker.bindPopup(`
      <div style="min-width:180px">
        <h3 style="margin-bottom:8px;color:#ff4d6d;">
          Earthquake
        </h3>

        <p><b>Location:</b> ${place}</p>
        <p><b>Magnitude:</b> ${magnitude}</p>
      </div>
    `);

    quakeLayer.addLayer(marker);

setInterval(loadEarthquakes, 300000);
