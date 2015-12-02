'use strict';

angular.module('myApp.member', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/member', {
		templateUrl: 'view/member/member.html',
		controller: 'MemberCtrl'
	});
}])

.controller('MemberCtrl', ['$scope', '$rootScope', '$window', function ($scope, $rootScope, $window) {
	var init = function () {
		selectMenu(1); /* 메뉴 선택 */
	};
	
	init();
	
	$rootScope.title = '대원관리';
	$rootScope.title_icon = 'ion-person';
}]);