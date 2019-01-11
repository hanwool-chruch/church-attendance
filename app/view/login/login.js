'use strict';

angular.module('myApp.login', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/login', {
		templateUrl: 'view/login/login.html',
		controller: 'LoginCtrl'
	});
}])

.controller('LoginCtrl', [ '$scope', '$rootScope', function($scope, $rootScope) {
	var init = function () {
		selectMenu(5); /* 메뉴 선택 */
	};
	

}]);