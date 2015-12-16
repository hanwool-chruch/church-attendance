'use strict';

describe('myApp.main module', function() {

	beforeEach(module('myApp.main'));

	describe('main controller', function() {

		var scope, rootScope, location;

		it('should ....', inject(function($rootScope, $location, $controller) {

			scope = $rootScope.$new();
			rootScope = $rootScope;
			location = $location;

			// spec body
			var mainCtrl = $controller('MainCtrl', {$scope : scope, $rootScope : rootScope, $location : location});
			expect(mainCtrl).toBeDefined();
		}));
	});
});