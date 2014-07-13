'use strict';

/* Controllers */

angular.module('whiteboardApp.controllers', [])
	.controller('homeController', ['$scope', 'wbService', function($scope, wbService) {

		/**
		  *	method calls on whiteboard service called from view
		  */
		$scope.swapTool = function() {
			wbService.setTool($scope.tool);
		}

		$scope.setStrokeStyle = function() {
			wbService.setStrokeStyle($scope.strokeColor);
		}

		$scope.setLineWidth = function() {
			wbService.setLineWidth($scope.lineWidth);
		}

		$scope.clearCanvas = function() {
			wbService.clearCanvas();
		}

	}]);

