'use strict';

angular.module('myApp.rank', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/rank', {
		templateUrl: 'view/rank/rank.html',
		controller: 'RankCtrl'
	});
}])

.controller('RankCtrl', [ '$scope', '$rootScope', function($scope, $rootScope) {
	var init = function () {
		selectMenu(3); /* 메뉴 선택 */
	};
	
	init();
	
	$rootScope.title = '출석순위';
	$rootScope.title_icon = 'ion-trophy';
}]);