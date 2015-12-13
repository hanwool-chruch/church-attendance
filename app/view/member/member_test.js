'use strict';

describe('myApp.member module', function() {

	beforeEach(module('myApp.member'));

	describe('member controller', function() {

		it('should ....', inject(function($controller, $rootScope ,  $window ,  $location ,  MemberSvc) {
			// spec body
			var memberCtrl = $controller('MemberCtrl', {$scope: $rootScope.$new(), $rootScope: $rootScope, $window: $window, $location: $location, MemberSvc: MemberSvc});
			expect(memberCtrl).toBeDefined();
		}));

	});

	describe('member detail controller', function() {

		it('should ....', inject(function($controller, $rootScope ,  $window ,  $routeParams, MemberSvc, $location, CodeSvc, $q) {
			// spec body
			var memberDetailCtrl = $controller('MemberDetailCtrl', {$scope: $rootScope.$new(), $rootScope: $rootScope, $window: $window,  $routeParams: $routeParams, MemberSvc: MemberSvc, $location: $location, CodeSvc: CodeSvc, $q: $q});
			expect(memberDetailCtrl).toBeDefined();
		}));

	});

	describe('member regist controller', function() {

		it('should ....', inject(function($controller, $rootScope ,  $window , MemberSvc, $location, CodeSvc, $q) {
			// spec body
			var memberRegistCtrl = $controller('MemberRegistCtrl', {$scope: $rootScope.$new(), $rootScope: $rootScope, $window: $window, MemberSvc: MemberSvc, $location: $location, CodeSvc: CodeSvc, $q: $q});
			expect(memberRegistCtrl).toBeDefined();
		}));

	});
});