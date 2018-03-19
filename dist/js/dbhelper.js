"use strict";var _createClass=function(){function r(n,e){for(var t=0;t<e.length;t++){var r=e[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(n,r.key,r)}}return function(n,e,t){return e&&r(n.prototype,e),t&&r(n,t),n}}();function _classCallCheck(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}var indexController=new IndexController(document.querySelector("body")),DBHelper=function(){function o(){_classCallCheck(this,o)}return _createClass(o,null,[{key:"fetchRestaurants",value:function(t){fetch(o.DATABASE_URL).then(function(n){if(n.ok)return n.json();throw new Error("Network response was not ok.")}).then(function(n){var e=n;indexController._onDataReceived(e),t(null,e)}).catch(function(n){var e="Request failed. Returned status of "+n.message;t(e,null)})}},{key:"fetchRestaurantById",value:function(r,u){o.fetchRestaurants(function(n,e){if(n)u(n,null);else{var t=e.find(function(n){return n.id==r});t?u(null,t):u("Restaurant does not exist",null)}})}},{key:"fetchRestaurantByCuisine",value:function(r,u){o.fetchRestaurants(function(n,e){if(n)u(n,null);else{var t=e.filter(function(n){return n.cuisine_type==r});u(null,t)}})}},{key:"fetchRestaurantByNeighborhood",value:function(r,u){o.fetchRestaurants(function(n,e){if(n)u(n,null);else{var t=e.filter(function(n){return n.neighborhood==r});u(null,t)}})}},{key:"fetchRestaurantByCuisineAndNeighborhood",value:function(r,u,a){o.fetchRestaurants(function(n,e){if(n)a(n,null);else{var t=e;"all"!=r&&(t=t.filter(function(n){return n.cuisine_type==r})),"all"!=u&&(t=t.filter(function(n){return n.neighborhood==u})),a(null,t)}})}},{key:"fetchNeighborhoods",value:function(u){o.fetchRestaurants(function(n,t){if(n)u(n,null);else{var r=t.map(function(n,e){return t[e].neighborhood}),e=r.filter(function(n,e){return r.indexOf(n)==e});u(null,e)}})}},{key:"fetchCuisines",value:function(u){o.fetchRestaurants(function(n,t){if(n)u(n,null);else{var r=t.map(function(n,e){return t[e].cuisine_type}),e=r.filter(function(n,e){return r.indexOf(n)==e});u(null,e)}})}},{key:"urlForRestaurant",value:function(n){return"./restaurant.html?id="+n.id}},{key:"imageUrlForRestaurant",value:function(n){return 1<arguments.length&&void 0!==arguments[1]&&arguments[1]?"/img/wall/"+n.photograph:"/img/"+n.photograph}},{key:"mapMarkerForRestaurant",value:function(n,e){return new google.maps.Marker({position:n.latlng,title:n.name,url:o.urlForRestaurant(n),map:e,animation:google.maps.Animation.DROP})}},{key:"DATABASE_URL",get:function(){return"http://localhost:1337/restaurants"}}]),o}();
//# sourceMappingURL=dbhelper.js.map
