'use strict';

describe('myApp.rank module', function() {

	beforeEach(module('myApp.rank'));

	describe('rank controller', function() {

		it('should ....', inject(function($controller, $rootScope, RankSvc) {
			// spec body
			var rankCtrl = $controller('RankCtrl', {$scope: $rootScope.$new(), $rootScope: $rootScope ,  RankSvc: RankSvc});
			expect(rankCtrl).toBeDefined();
		}));

	});
});