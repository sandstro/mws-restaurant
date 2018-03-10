'use strict';

(function () {
  if (!navigator.serviceWorker) return;

  navigator.serviceWorker.register('/sw.js').then(function (reg) {
    if (!navigator.serviceWorker.controller) {
      return;
    }
  }).catch(function (error) {
    console.log('Registration failed with ' + error);
  });
})();
//# sourceMappingURL=index.js.map
