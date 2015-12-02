'use strict';

angular.module('myApp.doc', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/doc', {
		templateUrl: 'view/doc/doc.html',
		controller: 'DocCtrl'
	});
}])

.controller('DocCtrl', [ '$scope', '$rootScope', function($scope, $rootScope) {
	var init = function () {
		selectMenu(4); /* 메뉴 선택 */
	};
	
	init();
	
	$rootScope.title = '회의록';
	$rootScope.title_icon = 'ion-easel';
	
}]);