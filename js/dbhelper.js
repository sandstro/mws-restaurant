const indexController = new IndexController(document.querySelector('body'));

/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   */
  static get DATABASE_URL() {
    const port = 1337
    return `http://localhost:${port}`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    indexController._checkDataExists().then(restaurants => {
      if (restaurants.length === 0) {
        fetch(`${DBHelper.DATABASE_URL}/restaurants`).then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Network response was not ok.');
        }).then(json => {
          const restaurants = json;
          indexController._onDataReceived(restaurants);
          callback(null, restaurants);
        }).catch(err => {
          const error = (`Request failed. Returned status of ${err.message}`);
          callback(error, null);
        });
      } else {
        callback(null, restaurants);
      }
    });
  }

  /**
   * Proxy to IndexController.
   */
  static fetchReviews(restaurantId) {
    return indexController.fetchReviews(restaurantId);
  }

  /**
   * Send restaurant favorite status change to DB.
   */
  static setFavorite(restaurantId, isFavorite) {
    fetch(`${DBHelper.DATABASE_URL}/restaurants/${restaurantId}/?is_favorite=${isFavorite}`, {
      method: 'PUT',
    }).then(() => {
      indexController._dbPromise.then(db => {
        const tx = db.transaction('restaurants', 'readwrite');
        const store = tx.objectStore('restaurants');
        store.get(restaurantId).then(restaurant => {
          restaurant.is_favorite = isFavorite;
          store.put(restaurant);
        });
      });
    });
  }

  /**
   * Post review to DB.
   */
  static postReview(review) {
    const temp = {
      name: 'temp',
      data: review,
      object_type: 'review',
    };

    if (!navigator.onLine) {
      DBHelper.synchronize(temp); // Connection lost
      return;
    }

    const { name, rating, comment, restaurant_id } = review;
    const myReview = { name, rating, comment, restaurant_id };
    fetch(`${DBHelper.DATABASE_URL}/reviews`, {
      method: 'POST',
      body: JSON.stringify(myReview),
      headers: new Headers({
        'Content-Type': 'application/json',
      })
    }).then(resp => {
      if (resp.headers.get('content-type').indexOf('application/json') !== -1) return resp.json();
    });
  }

  /**
   * Use localStorage to set up background sync-ish functionality.
   * This idea came from the webcast for last stage3.
   */
  static synchronize(review) {
    localStorage.setItem('review', JSON.stringify(review.data));
    window.addEventListener('online', () => {
      const data = JSON.parse(localStorage.getItem('review'));
      const offlineLabels = Array.prototype.slice.call(document.querySelectorAll('.restaurant__review__offline__label'));
      console.log('offlineLabels', offlineLabels);
      offlineLabels.forEach(el => el.remove());
      if (review.name === 'temp') {
        DBHelper.postReview(review.data);
      }
      localStorage.removeItem('review');
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant.
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database.
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type.
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood.
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // Filter by cuisine.
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // Filter by neighborhood.
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants.
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods.
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants.
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines.
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant, wall = false) {
    // Use 10.jpg as a default imgae is photograph missing.
    if (!restaurant.hasOwnProperty('photograph')) {
      restaurant.photograph = '10';
    }
    return (`/img/${restaurant.photograph}.webp`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
