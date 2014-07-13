'use strict';
/**
  * Oli's Whiteboard Test
  * jasmine specs for whiteboard service, controller and directive
  *
  * @author Oliver Hooton <oliver.j.hooton@gmail.com>
  */
 
 // service tests

describe('service', function() {

    var rootScope, scope, whiteboardService;

    beforeEach(function() {

        module('wb.whiteboard');

        inject(function ($rootScope, $controller, _wbService_) {

            rootScope = $rootScope;

            scope = rootScope.$new();

            whiteboardService = _wbService_;

        });
    });


	it('should initiate with pen as chosen tool', function() {
		expect(whiteboardService.options.chosenTool).toEqual('pen');
	});

	it('should initiate with black strokeStyle', function() {
		expect(whiteboardService.options.strokeStyle).toEqual('#000');
	});

    it('should only allow pen, line & rectangle tool', function() {
        whiteboardService.setTool('err');
        expect(whiteboardService.options.chosenTool).toNotEqual('err');
    });

    it('should set stroke width to number 1-10', function() {
        whiteboardService.setLineWidth(0);
        whiteboardService.setLineWidth(11);
        whiteboardService.setLineWidth('err');
        expect(whiteboardService.options.lineWidth).toNotEqual(0 || 11 || 'err');
    });
    
    xit('should remove all layers on reset', function() {
        whiteboardService.clearCanvas();
        expect(whiteboardService.drawnLayers.length).toEqual(0);
    });
});



// controller tests

describe('controller', function() {

    var rootScope, scope, WhiteboardController;

    var mockService = {
        options: { 
            chosenTool: 'pen',
            fillStyle:  '#F00',
            strokeStyle:'#000',
            lineWidth:  '2'
        },

        drawnLayers: []
    };

 
    beforeEach(function() {

        module('wb.whiteboard');

        inject(function ($rootScope, $controller) {
    
            rootScope = $rootScope;

            scope = rootScope.$new();

            WhiteboardController = $controller('WhiteboardController', { 
                $scope: scope,
                wbService: mockService
            });
        });
    });


    it('should have draw methods defined', function() {
        expect(scope.initDraw && scope.drawLayer && scope.redrawLayers && scope.endDraw).toBeDefined();
    });

    it('should add mouse coordinates on init draw', function() {

        var x1 = scope.clickX.length;
        var y1 = scope.clickY.length;

        scope.initDraw(1,1);

        var x2 = scope.clickX.length;
        var y2 = scope.clickY.length;

        var diffX = x2-x1;
        var diffY = y2-y1;

        expect(diffX && diffY).toEqual(1);
    });

    xit('should clear canvas, redraw layers, set new style options on draw', function() {
        var spyWipe     = spyOn(scope, 'wipe');
        var spyRedraw   = spyOn(scope, 'redrawLayers');
        var spyStyle    = spyOn(scope, 'setStyleOptions');

        scope.drawLayer;

        expect(spyWipe).toHaveBeenCalled();
        expect(spyRedraw).toHaveBeenCalled();
        expect(spyStyle).toHaveBeenCalled();
    });

    it('should have tool pen, line or rectangle', function() {
        var tool = mockService.options.chosenTool;
        var match = (tool == 'pen' | tool == 'line' | tool == 'rectangle') ? true : false;
        expect(match).toBe(true);
    })

    it('should reset currentX & currentY on endDraw', function() {
        scope.endDraw();
        expect(scope.currentX.length && scope.currentY.length).toBe(0);
    });

});


// directive tests

describe('directive', function() {

    var scope, elem, compiled, html;
      
    beforeEach(function() {

        module('wb.whiteboard');
    
        html = '<canvas wb-whiteboard></canvas>';
        inject(function($compile, $rootScope) {
  
            scope = $rootScope.$new();
      
            elem = angular.element(html);
      
            compiled = $compile(elem)(scope);
      
            scope.$digest();
        });

    });

    it('should have an isolated scope', function() {
        expect(elem.hasClass('ng-isolate-scope')).toBe(true);
    });

    it('should have a white background', function() {
        expect(elem.css('background-color')).toBe('rgb(255, 255, 255)');
    });

    it('should have a crosshair cursor', function() {
        expect(elem.css('cursor')).toBe('crosshair');
    });

});