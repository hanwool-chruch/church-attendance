'use strict';

describe('myApp.att module', function() {

	beforeEach(module('myApp.att'));

	describe('att controller', function() {

		it('should ....', inject(function($controller, $rootScope, AttSvc, $location, socket, $route) {
			// spec body
			var attCtrl = $controller('AttCtrl', {$scope: $rootScope.$new(), $rootScope: $rootScope, AttSvc: AttSvc, $location: $location, socket: socket, $route: $route});
			expect(attCtrl).toBeDefined();
		}));

	});

	describe('att regist controller', function() {

		beforeEach(module('myApp.member'));

		it('should ....', inject(function($controller, $rootScope, AttSvc, $location, CodeSvc, $q, socket) {
			// spec body
			var attRegistCtrl = $controller('AttRegistCtrl', {$scope: $rootScope.$new(), $rootScope: $rootScope, AttSvc: AttSvc, $location: $location, CodeSvc: CodeSvc, $q: $q, socket: socket});
			expect(attRegistCtrl).toBeDefined();
		}));

	});

	describe('att detail controller', function() {

		beforeEach(module('myApp.member'));

		it('should ....', inject(function($controller, $rootScope, AttSvc, $location, CodeSvc, $q, $routeParams, socket, $route) {
			// spec body
			var attDetailCtrl = $controller('AttDetailCtrl', {$scope: $rootScope.$new(), $rootScope: $rootScope, AttSvc: AttSvc, $location: $location, CodeSvc: CodeSvc, $q: $q, $routeParams: $routeParams, socket: socket, $route: $route});
			expect(attDetailCtrl).toBeDefined();
		}));

	});
});