/**
 * Create database if service worker is supported.
 */
function openDatabase() {
  if (!navigator.serviceWorker) {
    return Promise.resolve();
  }

  return idb.open('restaurant', 2, function(upgradeDb) {
    switch(upgradeDb.oldVersion) {
      case 0:
        upgradeDb.createObjectStore('restaurants', {
          keyPath: 'id'
        });
      case 1:
        upgradeDb.createObjectStore('reviews', {
          keyPath: 'id'
        }).createIndex('restaurant', 'restaurant_id');
    }
  });
}

function IndexController(container) {
  this.DATABASE_URL = 'http://localhost:1337';
  this._container = container;
  this._dbPromise = openDatabase();
}

IndexController.prototype.fetchReviews = function(restaurantId) {
  return fetch(`${this.DATABASE_URL}/reviews/?restaurant_id=${restaurantId}`)
    .then(resp => resp.json())
    .then(reviews => {
      this._dbPromise.then(db => {
        if (!db) return;
        const tx = db.transaction('reviews', 'readwrite');
        const store = tx.objectStore('reviews');

        if (Array.isArray(reviews)) {
          reviews.forEach(review => {
            store.put(review);
          });
        } else {
          store.put(reviews);
        }
      });
      return Promise.resolve(reviews);
    }).catch(error => {
      return this.getObjectFromStore(restaurantId)
        .then(reviewsInStore => {
          return Promise.resolve(reviewsInStore);
        });
    });
};

IndexController.prototype.getObjectFromStore = function(restaurantId) {
  return this._dbPromise.then(db => {
    if (!db) return;
    const store = db.transaction('reviews').objectStore('reviews');
    const index = store.index('restaurant');
    return index.getAll(restaurantId);
  });
};

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
