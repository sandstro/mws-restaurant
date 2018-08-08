"use strict";var _createClass=function(){function r(e,n){for(var t=0;t<n.length;t++){var r=n[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,n,t){return n&&r(e.prototype,n),t&&r(e,t),e}}();function _classCallCheck(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}var indexController=new IndexController(document.querySelector("body")),DBHelper=function(){function i(){_classCallCheck(this,i)}return _createClass(i,null,[{key:"fetchRestaurants",value:function(t){indexController._checkDataExists().then(function(e){0===e.length?fetch(i.DATABASE_URL+"/restaurants").then(function(e){if(e.ok)return e.json();throw new Error("Network response was not ok.")}).then(function(e){var n=e;indexController._onDataReceived(n),t(null,n)}).catch(function(e){var n="Request failed. Returned status of "+e.message;t(n,null)}):t(null,e)})}},{key:"fetchReviews",value:function(e){return indexController.fetchReviews(e)}},{key:"setFavorite",value:function(t,r){fetch(i.DATABASE_URL+"/restaurants/"+t+"/?is_favorite="+r,{method:"PUT"}).then(function(){indexController._dbPromise.then(function(e){var n=e.transaction("restaurants","readwrite").objectStore("restaurants");n.get(t).then(function(e){e.is_favorite=r,n.put(e)})})})}},{key:"postReview",value:function(e){var n={name:"temp",data:e,object_type:"review"};if(navigator.onLine){var t={name:e.name,rating:e.rating,comment:e.comment,restaurant_id:e.restaurant_id};fetch(i.DATABASE_URL+"/reviews",{method:"POST",body:JSON.stringify(t),headers:new Headers({"Content-Type":"application/json"})}).then(function(e){if(-1!==e.headers.get("content-type").indexOf("application/json"))return e.json()})}else i.synchronize(n)}},{key:"synchronize",value:function(e){localStorage.setItem("review",JSON.stringify(e.data)),window.addEventListener("online",function(){JSON.parse(localStorage.getItem("review"));Array.prototype.slice.call(document.querySelectorAll(".restaurant__review__offline__label")).forEach(function(e){return e.remove()}),"temp"===e.name&&i.postReview(e.data),localStorage.removeItem("review")})}},{key:"fetchRestaurantById",value:function(r,a){i.fetchRestaurants(function(e,n){if(e)a(e,null);else{var t=n.find(function(e){return e.id==r});t?a(null,t):a("Restaurant does not exist",null)}})}},{key:"fetchRestaurantByCuisine",value:function(r,a){i.fetchRestaurants(function(e,n){if(e)a(e,null);else{var t=n.filter(function(e){return e.cuisine_type==r});a(null,t)}})}},{key:"fetchRestaurantByNeighborhood",value:function(r,a){i.fetchRestaurants(function(e,n){if(e)a(e,null);else{var t=n.filter(function(e){return e.neighborhood==r});a(null,t)}})}},{key:"fetchRestaurantByCuisineAndNeighborhood",value:function(r,a,o){i.fetchRestaurants(function(e,n){if(e)o(e,null);else{var t=n;"all"!=r&&(t=t.filter(function(e){return e.cuisine_type==r})),"all"!=a&&(t=t.filter(function(e){return e.neighborhood==a})),o(null,t)}})}},{key:"fetchNeighborhoods",value:function(a){i.fetchRestaurants(function(e,t){if(e)a(e,null);else{var r=t.map(function(e,n){return t[n].neighborhood}),n=r.filter(function(e,n){return r.indexOf(e)==n});a(null,n)}})}},{key:"fetchCuisines",value:function(a){i.fetchRestaurants(function(e,t){if(e)a(e,null);else{var r=t.map(function(e,n){return t[n].cuisine_type}),n=r.filter(function(e,n){return r.indexOf(e)==n});a(null,n)}})}},{key:"urlForRestaurant",value:function(e){return"./restaurant.html?id="+e.id}},{key:"imageUrlForRestaurant",value:function(e){1<arguments.length&&void 0!==arguments[1]&&arguments[1];return e.hasOwnProperty("photograph")||(e.photograph="10"),"/img/"+e.photograph+".webp"}},{key:"mapMarkerForRestaurant",value:function(e,n){var t=new L.marker([e.latlng.lat,e.latlng.lng],{title:e.name,alt:e.name,url:i.urlForRestaurant(e)});return t.addTo(n),t}},{key:"DATABASE_URL",get:function(){return"http://localhost:1337"}}]),i}();
//# sourceMappingURL=dbhelper.js.map
