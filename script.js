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

const ticker =
  document.getElementById('ticker');

const eventCounter =
  document.getElementById('eventCount');

let totalEvents = 0;

const activeFilters = {
  earthquakes: true,
  wildfires: true,
  storms: true,
  volcanoes: true,
  news: true
};

function updateCounter() {

  eventCounter.textContent =
    totalEvents;

}

function clearMarkers() {

  markers.clearLayers();

  totalEvents = 0;

}

function updateTicker(text) {

  ticker.innerHTML = text;

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

  totalEvents++;

  updateCounter();

  const marker =
    L.circleMarker(
      [lat, lon],
      {
        radius: size,
        color: color,
        fillColor: color,
        fillOpacity: 0.55,
        weight: 2
      }
    );

  marker.bindPopup(`

  <div style="
    min-width:240px;
    color:white;
    font-family:Arial;
    line-height:1.6;
  ">

    <h2 style="
      color:${color};
      margin-bottom:10px;
      font-size:22px;
    ">
      ${title}
    </h2>

    <div style="
      font-size:15px;
      color:rgba(255,255,255,0.9);
    ">
      ${info}
    </div>

    <br>

    <div style="
      font-weight:bold;
      color:white;
    ">
      Severity:
      ${severity}
    </div>

  </div>

  `);

  markers.addLayer(marker);

}

async function loadEarthquakes() {

  if (!activeFilters.earthquakes)
    return;

  try {

    const response =
      await fetch(
        'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson'
      );

    const data =
      await response.json();

    data.features.forEach(quake => {

      const mag =
        quake.properties.mag;

      if (!mag) return;

      const coords =
        quake.geometry.coordinates;

      const lat =
        coords[1];

      const lon =
        coords[0];

      let size = 10;

      if (mag >= 7)
        size = 30;

      else if (mag >= 6)
        size = 22;

      else if (mag >= 5)
        size = 16;

      createMarker(
        lat,
        lon,
        size,
        '#ff3355',
        'Earthquake',
        `
        <strong>
          ${quake.properties.place}
        </strong>

        <br><br>

        Magnitude:
        ${mag}

        <br>

        Time:
        ${new Date(
          quake.properties.time
        ).toLocaleString()}
        `,
        mag >= 7
          ? 'Extreme'
          : 'High'
      );

    });

  }

  catch(err) {

    console.log(
      'Earthquake API failed',
      err
    );

  }

}

async function loadEONET() {

  try {

    const response =
      await fetch(
        'https://eonet.gsfc.nasa.gov/api/v3/events'
      );

    const data =
      await response.json();

    let wildfireCount = 0;

    data.events.forEach(event => {

      if (
        !event.geometry ||
        !event.geometry.length
      ) return;

      const latest =
        event.geometry[
          event.geometry.length - 1
        ];

      const lat =
        latest.coordinates[1];

      const lon =
        latest.coordinates[0];

      const category =
        event.categories[0].title;

      // WILDFIRES
      if (
        category === 'Wildfires' &&
        activeFilters.wildfires &&
        wildfireCount < 20
      ) {

        if (Math.random() > 0.15)
          return;

        wildfireCount++;

        createMarker(
          lat,
          lon,
          5,
          '#ff9800',
          'Wildfire',
          `
          <strong>
            ${event.title}
          </strong>

          <br><br>

          NASA EONET
          wildfire detection
          `,
          'Moderate'
        );

      }

      // STORMS
      if (
        category === 'Severe Storms' &&
        activeFilters.storms
      ) {

        createMarker(
          lat,
          lon,
          14,
          '#9b6dff',
          'Storm System',
          `
          <strong>
            ${event.title}
          </strong>

          <br><br>

          Severe weather
          activity detected
          `,
          'High'
        );

      }

      // VOLCANOES
      if (
        category === 'Volcanoes' &&
        activeFilters.volcanoes
      ) {

        createMarker(
          lat,
          lon,
          12,
          '#700000',
          'Volcanic Activity',
          `
          <strong>
            ${event.title}
          </strong>

          <br><br>

          Elevated volcanic
          activity detected
          `,
          'High'
        );

      }

    });

  }

  catch(err) {

    console.log(
      'NASA API failed',
      err
    );

  }

}

async function loadBreakingNews() {

  if (!activeFilters.news)
    return;

  try {

    const response =
      await fetch(
'https://api.gdeltproject.org/api/v2/doc/doc?query=earthquake%20OR%20war%20OR%20wildfire%20OR%20hurricane%20OR%20explosion&mode=artlist&maxrecords=20&format=json'
      );

    const data =
      await response.json();

    if (!data.articles)
      return;

    let headlines = [];

    data.articles.forEach(article => {

      const lat =
        (Math.random() * 140)
        - 70;

      const lon =
        (Math.random() * 360)
        - 180;

      headlines.push(
        article.title
      );

      createMarker(
        lat,
        lon,
        7,
        '#00d4ff',
        'Breaking News',
        `
        <strong>
          ${article.title}
        </strong>

        <br><br>

        Source:
        ${article.domain}

        <br><br>

        <a href="${article.url}"
           target="_blank">
           Read Article
        </a>
        `,
        'Breaking'
      );

    });

    updateTicker(
      headlines
        .slice(0, 8)
        .join(' • ')
    );

  }

  catch(err) {

    console.log(
      'GDELT API failed',
      err
    );

  }

}

async function loadEverything() {

  clearMarkers();

  await loadEarthquakes();

  await loadEONET();

  await loadBreakingNews();

}

window.toggleFilter =
  function(type) {

    activeFilters[type] =
      !activeFilters[type];

    loadEverything();

};

loadEverything();

setInterval(
  loadEverything,
  180000
);
