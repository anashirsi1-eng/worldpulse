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
    const place = quake.properties.place;

    const lat = coords[1];
    const lon = coords[0];

    const marker = L.circleMarker([lat, lon], {
      radius: magnitude * 2,
      color: 'red',
      fillColor: 'red',
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
