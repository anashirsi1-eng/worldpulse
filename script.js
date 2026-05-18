const map = L.map('map', {
  zoomControl: false
}).setView([20, 0], 2);

L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  }
).addTo(map);

async function loadEarthquakes() {

  const response = await fetch(
    'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
  );

  const data = await response.json();

  data.features.forEach(quake => {

    const coords = quake.geometry.coordinates;

    const magnitude = quake.properties.mag;

    if (!magnitude || magnitude < 2.5) return;

    const place = quake.properties.place;

    const lat = coords[1];
    const lon = coords[0];

    let color = '#ff3355';

    if (magnitude >= 5) {
      color = '#ff0000';
    } else if (magnitude >= 4) {
      color = '#ff8800';
    }

    const marker = L.circleMarker([lat, lon], {
      radius: magnitude * 2,
      color: color,
      fillColor: color,
      fillOpacity: 0.7
    }).addTo(map);

    marker.bindPopup(`
      <b>Earthquake</b><br>
      ${place}<br>
      Magnitude: ${magnitude}
    `);

  });

}

loadEarthquakes();
