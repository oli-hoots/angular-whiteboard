'use strict';
/**
  * Whiteboard Demo App
  *
  * @author Oliver Hooton <oliver.j.hooton@gmail.com>
  */

// Declare app level module which depends on filters, and services
angular.module('whiteboardApp', [
	'ngRoute',
	'wb.whiteboard', // include whiteboard
	'whiteboardApp.filters',
	'whiteboardApp.services',
	'whiteboardApp.directives',
	'whiteboardApp.controllers'
])
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/', {controller: 'homeController', templateUrl: 'partials/whiteboard.html'});
	$routeProvider.otherwise({redirectTo: '/'});
}]);