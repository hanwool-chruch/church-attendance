'use strict';

angular.module('myApp.main', [ 'ngRoute' ])

.config([ '$routeProvider', function($routeProvider) {
	$routeProvider.when('/main', {
		templateUrl : 'view/main/main.html',
		controller : 'MainCtrl'
	});
} ])

.controller('MainCtrl', [ '$scope', '$rootScope', '$location', function($scope, $rootScope, $location) {
	
	var init = function() {
		selectMenu(0); /* 메뉴 선택 */
	};

	init();
	
	$scope.gotoPage = function(page){
		alert();
		$location.path('/'+page);
	}
	
	$rootScope.title="마법같은 출석관리";
	$rootScope.title_icon = 'ion-ios-color-wand';
} ]);