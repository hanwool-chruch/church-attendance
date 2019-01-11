'use strict';

describe('myApp.doc module', function() {

	beforeEach(module('myApp.doc'));

	describe('doc controller', function() {

		it('should ....', inject(function($controller, $rootScope, DocSvc, $sce) {
			// spec body
			var docCtrl = $controller('DocCtrl', {$scope: $rootScope.$new(), $rootScope: $rootScope, DocSvc: DocSvc, $sce: $sce});
			expect(docCtrl).toBeDefined();
		}));

	});

	describe('doc detail controller', function() {

		it('should ....', inject(function($controller, $rootScope, DocSvc, $sce) {
			// spec body
			var docDetailCtrl = $controller('DocDetailCtrl', {$scope: $rootScope.$new(), $rootScope: $rootScope, DocSvc: DocSvc, $sce: $sce});
			expect(docDetailCtrl).toBeDefined();
		}));

	});
});