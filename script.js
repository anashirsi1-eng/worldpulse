const map = L.map('map', {
  zoomControl: false
}).setView([20, 0], 2);

L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  }
).addTo(map);

const alerts = [
  {
    title: "Tornado Warning",
    location: "Nashville",
    coords: [36.1627, -86.7816],
    color: "red"
  },
  {
    title: "Wildfire",
    location: "California",
    coords: [34.0522, -118.2437],
    color: "orange"
  },
  {
    title: "Earthquake",
    location: "Japan",
    coords: [35.6762, 139.6503],
    color: "yellow"
  }
];

alerts.forEach(alert => {
  const marker = L.circleMarker(alert.coords, {
    radius: 10,
    color: alert.color,
    fillColor: alert.color,
    fillOpacity: 0.8
  }).addTo(map);

  marker.bindPopup(`
    <b>${alert.title}</b><br>
    ${alert.location}
  `);
});
