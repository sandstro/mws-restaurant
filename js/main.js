let restaurants,
  neighborhoods,
  cuisines;
let newMap;
let markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
let fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
let fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
let fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
let fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
const initMap = () => {
  self.newMap = L.map('map', {
    center: [40.722216, -73.987501],
    zoom: 12,
    scrollWheelZoom: false
  });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
  mapboxToken: 'pk.eyJ1Ijoic2FuZHN0cm8iLCJhIjoiY2prbDRobHQ2MDg5bjNxdGg5Y2R2ZzN6ZSJ9.bqghcRTSbnJXRMIpBR371A',
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  id: 'mapbox.streets'
  }).addTo(self.newMap);
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
let updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
let resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(m => m.setMap(null));
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
let fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
let createRestaurantHTML = (restaurant) => {
  let intersectionObserver;

  const changeHandler = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.intersectionRatio > 0) {
        entry.target.src = DBHelper.imageUrlForRestaurant(restaurant, true);
        observer.unobserve(entry.target);
      }
    });
  };

  const toggleFavoriteStatus = (target, isFavorite) => {
    if (!isFavorite) {
      target.classList.remove('restaurant__favorite--true');
      target.setAttribute('aria-label', 'set restaurant as favorite')
    } else {
      target.classList.add('restaurant__favorite--true');
      target.setAttribute('aria-label', 'unset restaurant as favorite')
    }
  }

  const li = document.createElement('li');
  li.className = 'restaurant';

  const wrapper = document.createElement('div');
  wrapper.className = 'restaurant__wrapper';

  const image = document.createElement('img');
  image.className = 'restaurant__image';
  image.alt = `An image of ${restaurant.name} in ${restaurant.neighborhood}`;

  if ('IntersectionObserver' in window) {
    intersectionObserver = new IntersectionObserver(changeHandler, { threshold: 0.2 });
    intersectionObserver.observe(image);
  }

  wrapper.append(image);

  const like = document.createElement('button')
  like.className = 'restaurant__favorite';
  like.innerHTML = '&#9825';
  like.onclick = () => {
    restaurant.is_favorite = !restaurant.is_favorite; // Toggle.
    DBHelper.setFavorite(restaurant.id, restaurant.is_favorite);
    toggleFavoriteStatus(like, restaurant.is_favorite); // Apply change to DOM.
  };
  toggleFavoriteStatus(like, restaurant.is_favorite); // Init DOM for favorite status.

  const name = document.createElement('h2');
  name.className = 'restaurant__title';
  name.innerHTML = restaurant.name;
  name.append(like);
  wrapper.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.className = 'restaurant__paragraph';
  neighborhood.innerHTML = restaurant.neighborhood;
  wrapper.append(neighborhood);

  const address = document.createElement('p');
  address.className = 'restaurant__paragraph';
  address.innerHTML = restaurant.address;
  wrapper.append(address);

  const more = document.createElement('a');
  more.className = 'restaurant__link';
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  wrapper.append(more)

  li.append(wrapper);
  return li;
}

/**
 * Add markers for current restaurants to the map.
 */
let addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on('click', handleClick);

    function handleClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });
}
