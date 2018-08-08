let restaurant;
let newMap;

document.addEventListener('DOMContentLoaded', (event) => {
  initRestaurantMap();
});

/**
 * Initialize Google map, called from HTML.
 */
window.initRestaurantMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
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
      fillBreadcrumb(restaurant);
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
let fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // Restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // No id found in URL.
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage.
 */
let fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.alt = `An image of ${restaurant.name} in ${restaurant.neighborhood}`;
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // Fill operating hours.
  if (restaurant.operating_hours && !nodeHasContent('#restaurant-hours')) {
    fillRestaurantHoursHTML(restaurant.operating_hours);
  }

  // Fill reviews.
  DBHelper.fetchReviews(restaurant.id).then(results => {
    fillReviewsHTML(results);
  });
}

/**
 * Handle submit when generating new review.
 */
const handleSubmit = () => {
  event.preventDefault(); // prevent default submit from reloading page
  const restaurantId = getParameterByName('id');
  const name = document.querySelector('input[name="name"]').value;
  const rating = document.querySelector('select[name="rating"] option:checked').value;
  const comment = document.querySelector('textarea[name="comment"]').value;
  const review = {
    createdAt: new Date(),
    restaurant_id: parseInt(restaurantId),
    rating: parseInt(rating),
    name,
    comment,
  };
  DBHelper.postReview(review);
  fillSubmittedReviewHTML(review);
  document.querySelector('form').reset(); // reset form to mimic submit
};

/**
 * Fill submitted review HTML.
 */
fillSubmittedReviewHTML = review => {
  const noReviews = document.querySelector('.reviews--none');
  if (noReviews) noReviews.remove();
  const container = document.querySelector('#reviews-container');
  const ul = document.querySelector('#reviews-list');
  ul.insertBefore(createReviewHTML(review), ul.firstChild);
  container.appendChild(ul);
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
let fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.tabIndex = 0;
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.tabIndex = 0;
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
let fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.id = 'reviews__heading'
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.className = 'reviews--none';
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
let createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;

  if (!navigator.onLine) {
    const status = document.createElement('div');
    status.className = 'restaurant__review__offline__label';
    status.style.background = '#f00';
    status.style.color = '#fff';
    status.style.paddingLeft = '1em';
    status.innerHTML = 'Connection lost!';
    li.appendChild(status);
  }

  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.createdAt);
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments || review.comment;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu.
 */
let fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  if (breadcrumb.children.length === 1) {
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
  }
}

/**
 * Get a parameter by name from page URL.
 */
let getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Check if node contains data.
 */
let nodeHasContent = (node) => {
  return document.querySelector(node).children.length > 0;
}
