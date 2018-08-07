let restaurants,
  neighborhoods,
  cuisines;
let map;
let markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
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
window.initMap = () => {
  let setTitle = () => document.querySelector('#map iframe').setAttribute('title', 'Restaurants on Google Maps');
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
  self.map.addListener('tilesloaded', setTitle);
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
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}
