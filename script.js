const map = L.map('map', {
    );

  });

}

function loadWars() {

  if (!activeFilters.wars) return;

  const wars = [

    {
      lat: 49.0,
      lon: 32.0,
      size: 20,
      title: 'Ukraine Conflict',
      info: 'Large-scale active war zone.'
    },

    {
      lat: 31.5,
      lon: 34.5,
      size: 16,
      title: 'Israel-Gaza Conflict',
      info: 'Heavy military activity reported.'
    },

    {
      lat: 15.5,
      lon: 32.5,
      size: 14,
      title: 'Sudan Crisis',
      info: 'Humanitarian crisis and conflict.'
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
      'Thousands affected',
      'Critical'
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
