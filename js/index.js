/**
 * Create database if service worker is supported.
 */
function openDatabase() {
  if (!navigator.serviceWorker) {
    return Promise.resolve();
  }

  return idb.open('restaurant', 1, function(upgradeDb) {
    var store = upgradeDb.createObjectStore('restaurants', {
      keyPath: 'id'
    });
  });
}

function IndexController(container) {
  this._container = container;
  this._dbPromise = openDatabase();
  this._showCachedMessages();
}

/**
 * Put data to IndexedDB whenever live data is fetched and received.
 */
IndexController.prototype._onDataReceived = function(data) {
  var restaurants = data;

  this._dbPromise.then(function(db) {
    if (!db) return;

    var tx = db.transaction('restaurants', 'readwrite');
    var store = tx.objectStore('restaurants');
    restaurants.forEach(function(restaurant) {
      store.put(restaurant);
    });

    // Only store 12 newest restaurants.
    store.openCursor(null, "prev").then(function(cursor) {
      return cursor.advance(12);
    }).then(function deleteRest(cursor) {
      if (!cursor) return;
      cursor.delete();
      return cursor.continue().then(deleteRest);
    });
  });
};

/**
 * Run at initialization, show cached content before fetching new data.
 */
IndexController.prototype._showCachedMessages = function() {
  var indexController = this;

  return this._dbPromise.then(function(db) {
    // If we're already showing restaurant(s), eg shift-refresh
    // or the very first load, there's no point fetching
    // posts from IDB
    if (!db || indexController.showingData()) return;

    var store = db.transaction('restaurants').objectStore('restaurants');
    return store.getAll().then(function(restaurants) {
      if (indexController._container.classList.contains('inside')) {
        indexController.addRestaurant(restaurants.find(r => r.id == getParameterByName('id')));
      } else {
        indexController.addRestaurants(restaurants);
      }
    });
  });
};

/**
 * Check if data in the DOM.
 */
IndexController.prototype.showingData = function() {
  return (
    !!this._container.querySelector('.restaurant') ||
    (!!this._container.querySelector('#breadcrumb') &&
    this._container.querySelector('#breadcrumb').children.length === 2)
  );
};

/**
 * Check if data in IndexedDB and return restaurants.
 */
IndexController.prototype._checkDataExists = function() {
  return this._dbPromise.then(function(db) {
    var store = db.transaction('restaurants').objectStore('restaurants');
    return store.getAll().then(function(restaurants) {
      return restaurants;
    });
  });
};


/**
 * Add restaurants from cache.
 */
IndexController.prototype.addRestaurants = function(restaurants) {
  resetRestaurants(restaurants);
  fillRestaurantsHTML(restaurants);
};

/**
 * Add restaurant from cache.
 */
IndexController.prototype.addRestaurant = function(restaurant) {
  if (restaurant) {
    fillBreadcrumb(restaurant);
    fillRestaurantHTML(restaurant);
  }
};
