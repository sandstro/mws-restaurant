"use strict";var restaurants=void 0,neighborhoods=void 0,cuisines=void 0,map=void 0,markers=[];document.addEventListener("DOMContentLoaded",function(e){fetchNeighborhoods(),fetchCuisines()});var fetchNeighborhoods=function(){DBHelper.fetchNeighborhoods(function(e,t){e?console.error(e):(self.neighborhoods=t,fillNeighborhoodsHTML())})},fillNeighborhoodsHTML=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.neighborhoods,n=document.getElementById("neighborhoods-select");e.forEach(function(e){var t=document.createElement("option");t.innerHTML=e,t.value=e,n.append(t)})},fetchCuisines=function(){DBHelper.fetchCuisines(function(e,t){e?console.error(e):(self.cuisines=t,fillCuisinesHTML())})},fillCuisinesHTML=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.cuisines,n=document.getElementById("cuisines-select");e.forEach(function(e){var t=document.createElement("option");t.innerHTML=e,t.value=e,n.append(t)})};window.initMap=function(){self.map=new google.maps.Map(document.getElementById("map"),{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1}),updateRestaurants(),self.map.addListener("tilesloaded",function(){return document.querySelector("#map iframe").setAttribute("title","Restaurants on Google Maps")})};var updateRestaurants=function(){var e=document.getElementById("cuisines-select"),t=document.getElementById("neighborhoods-select"),n=e.selectedIndex,a=t.selectedIndex,r=e[n].value,s=t[a].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(r,s,function(e,t){e?console.error(e):(resetRestaurants(t),fillRestaurantsHTML())})},resetRestaurants=function(e){self.restaurants=[],document.getElementById("restaurants-list").innerHTML="",self.markers&&self.markers.forEach(function(e){return e.setMap(null)}),self.markers=[],self.restaurants=e},fillRestaurantsHTML=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurants,t=document.getElementById("restaurants-list");e.forEach(function(e){t.append(createRestaurantHTML(e))}),addMarkersToMap()},createRestaurantHTML=function(n){var e=function(e,t){t?(e.classList.add("restaurant__favorite--true"),e.setAttribute("aria-label","unset restaurant as favorite")):(e.classList.remove("restaurant__favorite--true"),e.setAttribute("aria-label","set restaurant as favorite"))},t=document.createElement("li");t.className="restaurant";var a=document.createElement("div");a.className="restaurant__wrapper";var r=document.createElement("img");r.className="restaurant__image",r.alt="An image of "+n.name+" in "+n.neighborhood,"IntersectionObserver"in window&&new IntersectionObserver(function(e,t){e.forEach(function(e){0<e.intersectionRatio&&(e.target.src=DBHelper.imageUrlForRestaurant(n,!0),t.unobserve(e.target))})},{threshold:.2}).observe(r),a.append(r);var s=document.createElement("button");s.className="restaurant__favorite",s.innerHTML="&#9825",s.onclick=function(){n.is_favorite=!n.is_favorite,DBHelper.setFavorite(n.id,n.is_favorite),e(s,n.is_favorite)},e(s,n.is_favorite);var o=document.createElement("h2");o.className="restaurant__title",o.innerHTML=n.name,o.append(s),a.append(o);var i=document.createElement("p");i.className="restaurant__paragraph",i.innerHTML=n.neighborhood,a.append(i);var l=document.createElement("p");l.className="restaurant__paragraph",l.innerHTML=n.address,a.append(l);var u=document.createElement("a");return u.className="restaurant__link",u.innerHTML="View Details",u.href=DBHelper.urlForRestaurant(n),a.append(u),t.append(a),t},addMarkersToMap=function(){(0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurants).forEach(function(e){var t=DBHelper.mapMarkerForRestaurant(e,self.map);google.maps.event.addListener(t,"click",function(){window.location.href=t.url}),self.markers.push(t)})};
//# sourceMappingURL=main.js.map
