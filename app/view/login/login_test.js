'use strict';

describe('myApp.login module', function() {

	beforeEach(module('myApp.login'));

	describe('login controller', function() {

		it('should ....', inject(function($controller, $rootScope) {

			// spec body
			var loginCtrl = $controller('LoginCtrl', {$scope: $rootScope.$new(), $rootScope: $rootScope});
			expect(loginCtrl).toBeDefined();
		}));

	});
});