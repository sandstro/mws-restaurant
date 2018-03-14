// Create database if service worker is supported.
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

function IndexController() {
  this._dbPromise = openDatabase();
  this._registerServiceWorker();
}

IndexController.prototype._registerServiceWorker = function() {
  if (!navigator.serviceWorker) return;

  var indexController = this;

  navigator.serviceWorker.register('/sw.js').then(function(reg) {
    if (!navigator.serviceWorker.controller) {
      return;
    }
  }).catch(function(error) {
    console.log('Registration failed with ' + error);
  });
};

IndexController.prototype._onDataReceived = function(data) {
  var restaurants = data;

  this._dbPromise.then(function(db) {
    if (!db) return;

    var tx = db.transaction('restaurants', 'readwrite');
    var store = tx.objectStore('restaurants');
    restaurants.forEach(function(restaurant) {
      store.put(restaurant);
    });

    // Only store 30 newest videos.
    store.openCursor(null, "prev").then(function(cursor) {
      return cursor.advance(30);
    }).then(function deleteRest(cursor) {
      if (!cursor) return;
      cursor.delete();
      return cursor.continue().then(deleteRest);
    });
  });

  // this._postsView.addPosts(messages);
};
