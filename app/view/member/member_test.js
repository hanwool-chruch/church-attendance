'use strict';

describe('myApp.member module', function() {

	beforeEach(module('myApp.member'));

	describe('member controller', function() {

		it('should ....', inject(function($controller) {
			// spec body
			var memberCtrl = $controller('MemberCtrl');
			expect(memberCtrl).toBeDefined();
		}));

	});
});