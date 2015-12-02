'use strict';

angular.module('myApp.att', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/att', {
		templateUrl: 'view/att/att.html',
		controller: 'AttCtrl'
	});
}])

.controller('AttCtrl', [ '$scope', '$rootScope', function($scope, $rootScope) {
	var init = function () {
		selectMenu(2); /* 메뉴 선택 */
	};
	
	init();
	
	$rootScope.title = '출석관리';
	$rootScope.title_icon = 'ion-checkmark-round';
	
}]);