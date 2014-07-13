'use strict';
/**
  * Oli's Whiteboard
  * standalone whiteboard that allows you to draw paths or shapes in various colors 
  *
  * @author Oliver Hooton <oliver.j.hooton@gmail.com>
  */

angular.module('wb.whiteboard', [])

	/**
	  * whiteboard service
	  * opens up whiteboards properties and methods to controller
	  */
 	.service('wbService', function($rootScope) {

 		// init service object to be returned
 		var service = {};

 		// options, sets defaults
 		service.options = {	
			chosenTool: 'pen',
			fillStyle: 	'#F00',
			strokeStyle:'#000',
			lineWidth: 	'2'
		}

		// array to keep track of layers drawn since last reset
		service.drawnLayers = [];


		// basic methods to interract with the whiteboard from an outside controller
		service.setTool = function(toolName) {
			if (toolName == 'pen' || toolName == 'line' || toolName == 'rectangle') {
				service.options.chosenTool = toolName;
			}		
		}

		service.setStrokeStyle = function(hex) {
			service.options.strokeStyle = hex;
		}

		service.setLineWidth = function(s) {
			if (s>0 && s<11) {
				service.options.lineWidth = s;
			}
		}

		service.clearCanvas = function() {
			// reset layers
			service.drawnLayers = [];
			
			// broadcast reset event to controller which will interact with the directive
			$rootScope.$broadcast('reset');
		}

		return service;
 	})


	// the whiteboard controller! handles the logic and creates bridge between service and directive
	// injects whiteboard service (wbService) as a dependancy
	.controller('WhiteboardController', ['$scope', 'wbService', function($scope, wbService) {

		// array store coordinates for mouse clicks. added to on initDraw()
		$scope.clickX = [];
		$scope.clickY = [];

		// arrays to contain mouse coordinates on mousemove
		$scope.currentX = [];
		$scope.currentY = [];

		// hold info for current layer, reset for each new path/shape
		$scope.currentLayer = {};

		
		/**
		  * init draw
		  * called on mousedown, adds mouse coordinates to clickX, clickY arrays
		  *
		  * @param {int}x mouse x coordinate
		  * @param {int}y mouse y coordinate
		  */
		$scope.initDraw = function(x, y) {
			$scope.clickX.push(x);
			$scope.clickY.push(y);
		}

		/**
		  * draws new layer/shape on canvas
		  * calculates dimensions of shapes based on mouse coords
		  * calls draw on directive methods
		  *
		  * @param {int}x mouse x coordinate
		  * @param {int}y mouse y coordinate
		  */
		$scope.drawLayer = function(x, y) {

			// push current mouse coords to service
			$scope.currentX.push(x);
			$scope.currentY.push(y);

			// redraw all previous layers
			$scope.wipe();
			$scope.redrawLayers();

			// begin new current layer object
			$scope.currentLayer = {};
			$scope.currentLayer.type 		 = wbService.options.chosenTool;
			$scope.currentLayer.lineWidth 	 = wbService.options.lineWidth;
			$scope.currentLayer.fillStyle 	 = wbService.options.fillStyle;
			$scope.currentLayer.strokeStyle  = wbService.options.strokeStyle;

			// set line width, stroke color etc.
			$scope.setStyleOptions($scope.currentLayer.lineWidth, $scope.currentLayer.strokeStyle, $scope.currentLayer.fillStyle);


			// if pen
			if (wbService.options.chosenTool == 'pen') {

				// initiate blank arrays to store data points
				if (!$scope.currentLayer.x) {
					$scope.currentLayer.x = [];
					$scope.currentLayer.y = [];
				}

				// loop through each mouse coordinate since drawing began
				for(var i=0; i<$scope.currentX.length; i++) {		
			
					// if not first point on path
			    	if ($scope.currentX[i] && i) {
			    		// push point from path to current layer coordinates array
			      		$scope.currentLayer.x.push($scope.currentX[i-1]);
			      		$scope.currentLayer.y.push($scope.currentY[i-1]);
			     	} else {
			     		// push new coordinates 1px top left
			     		$scope.currentLayer.x.push($scope.currentX[i]-1);
			      		$scope.currentLayer.y.push($scope.currentY[i]-1);
			     	}
					// push new coordinates for lineTo
					$scope.currentLayer.x.push($scope.currentX[i]);
					$scope.currentLayer.y.push($scope.currentY[i]);

			     	// draw line with new coordinates (2 pairs of coords for each line)
			     	$scope.drawLine($scope.currentLayer.x[2*i], $scope.currentLayer.y[2*i], $scope.currentLayer.x[(2*i)+1], $scope.currentLayer.y[(2*i)+1]);
			 	}

			// if line
			} else if (wbService.options.chosenTool == 'line') {
				// calculate line coords
				$scope.currentLayer.startX  = $scope.clickX[$scope.clickX.length-1];
				$scope.currentLayer.startY  = $scope.clickY[$scope.clickY.length-1];
				$scope.currentLayer.endX	= $scope.currentX[$scope.currentX.length-1];
				$scope.currentLayer.endY 	= $scope.currentY[$scope.currentY.length-1];

				// draw line
				$scope.drawLine($scope.currentLayer.startX, $scope.currentLayer.startY, $scope.currentLayer.endX, $scope.currentLayer.endY);

			// if rectangle
			} else if (wbService.options.chosenTool == 'rectangle') {
				// calculate coords, width & height of rectangle
				$scope.currentLayer.x = $scope.clickX[$scope.clickX.length-1];
				$scope.currentLayer.y = $scope.clickY[$scope.clickY.length-1];
				$scope.currentLayer.w = $scope.currentX[$scope.currentX.length-1] - $scope.clickX[$scope.clickX.length-1];
				$scope.currentLayer.h = $scope.currentY[$scope.currentY.length-1] - $scope.clickY[$scope.clickY.length-1];
				
				// draw rectangle
				$scope.drawRectangle($scope.currentLayer.x, $scope.currentLayer.y, $scope.currentLayer.w, $scope.currentLayer.h);
			}
		}

		
		/**
		  * redraw layers
		  * called on every draw to redraw layers drawn previously (or since last reset)
		  */
		$scope.redrawLayers = function() {


			// loop through array of layers to redraw each one
			for (var i=0; i<wbService.drawnLayers.length; i++) {
				var layer = this.layer = wbService.drawnLayers[i];

				// set context general styles
				$scope.setStyleOptions(layer.lineWidth, layer.strokeStyle, layer.fillStyle);

				// redraw layer by calling draw methods on directive
				switch (layer.type) {
					case 'pen':			for (var j=0; j<(layer.x.length); j++) { // loop each point on layers coordinate array
											$scope.drawLine(layer.x[2*j], layer.y[2*j], layer.x[(2*j)+1], layer.y[(2*j)+1]); // 2*j since 2 points added for each x & y on draw
										}
										break;
					case 'line': 		$scope.drawLine(layer.startX, layer.startY, layer.endX, layer.endY);
										break;
					case 'rectangle':  	$scope.drawRectangle(layer.x, layer.y, layer.w, layer.h);
										break;
					default: 			break;
				}
			}
		}

		// called on mouseup
		$scope.endDraw = function() {
			// add new layer to service
			wbService.drawnLayers.push($scope.currentLayer);

			// reset to ensure new fresh layer next time
			$scope.currentX = [];
			$scope.currentY = [];
		}

		// reset whiteboard to blank state
		$scope.$on('reset', function() {
	  		$scope.wipe();
			$scope.currentLayer = {};
		});
	}])


	/**
	  * whiteboard directive, handles mouse events and drawing on canvas
	  */
	.directive('wbWhiteboard', function() {

		// define object to be returned
		var directiveDefinitionObject = {};

		// isolate scope
		directiveDefinitionObject.scope = {};

		// restrict to wb-whiteboard attribute
		directiveDefinitionObject.restrict = 'A';

		// set controller
		directiveDefinitionObject.controller = 'WhiteboardController';

		/**
		  * link function to be returned after compile
		  */
		var link = function(scope, element) {
	
			// var to store canvas context
			var context;

			
			// bind mouse events to methods defined in controller

			// initialise draw on mouse down
			element.bind('mousedown', function(event) {
				scope.initDraw(event.offsetX, event.offsetY);
				scope.drawing = true;
			});

			// if drawing, being drawing new layer, passing mouse coords
			element.bind('mousemove', function(event) {
				if (scope.drawing) scope.drawLayer(event.offsetX, event.offsetY);
			});

			// end draw on mouseup
			element.bind('mouseup', function(event) {
				scope.endDraw();
				scope.drawing = false;
			});

			// end draw if mouse leaves the canvas
			element.bind('mouseout', function(event) {
				scope.endDraw();
				scope.drawing = false;
			});



			// get canvas context
			var init = function() {
				context = element[0].getContext('2d');
			}

			// methods for styling and drawing on the canvas

			// clean whiteboard
			scope.wipe = function() {
				context.clearRect(0, 0, context.canvas.width, context.canvas.height);
			}

			/**
			  * set line width & colours
			  *
			  * @param lineWidth int
			  * @param strokeStyle hex string
			  * @param fillStyle hex string
			  */
			scope.setStyleOptions = function (lineWidth, strokeStyle, fillStyle) {
				context.lineWidth 	= lineWidth;
				context.strokeStyle = strokeStyle;
				context.fillStyle 	= fillStyle;
			}

			/**
			  * draw rectangle
			  *
			  * @param {int}lineWidth thickness of line in pixels
			  * @param {string}strokeStyle hexadecimal line color
			  * @param {string}fillStyle hexadecimal fill color
			  */
			scope.drawRectangle = function(x, y, w, h) {
				context.beginPath();
				context.rect(x, y, w, h);
				context.stroke();
			}

			/**
			  * draw line - also used for drawing with pen
			  *
			  * @param {int}startX
			  * @param {int}startY
			  * @param {int}endX
			  * @param {int}endY
			  */
			scope.drawLine = function(startX, startY, endX, endY) {
				context.beginPath();
				context.moveTo(startX, startY);
				context.lineTo(endX, endY);
				context.closePath();
				context.stroke();
			}

			init();
		} // end link object


		// compile called once
		directiveDefinitionObject.compile = function(element) {

			// set basic styles to <canvas>
			element.css('background-color', '#FFF');
			element.css('cursor', 'crosshair');

			// return link function defined earlier
			return link;
		}

		// return directive definition object
		return directiveDefinitionObject;
	});