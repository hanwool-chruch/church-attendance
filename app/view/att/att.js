'use strict';

angular.module('myApp.att', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/att', {
		templateUrl: 'view/att/att.html',
		controller: 'AttCtrl'
	});
}])

.factory('AttSvc', ['$http', function($http){
	
	return {
		getAttList : function(){
			return $http({ 
				cache: false,
				url: '/rest/att',
				data: {t:new Date().getMilliseconds()},
				method: 'GET'});
		},
		getDetail : function(id) {
			/*
			return $http({ 
				cache: false,
				url: '/rest/member/'+id,
				data: {t:new Date().getMilliseconds()},
				method: 'GET'});
			*/
		}
	};
}])

.controller('AttCtrl', [ '$scope', '$rootScope', 'AttSvc', 
                 function($scope ,  $rootScope ,  AttSvc) {
	
	$rootScope.title_icon = 'ion-person';
	$rootScope.backdrop = 'backdrop';
	
	var init = function () {
		selectMenu(2); /* 메뉴 선택 */
	};
	
	init();
	
	AttSvc.getAttList().success(function(data){
		$scope.attList = data;
		$rootScope.backdrop = undefined;
	});;
	
	$rootScope.title = '출석관리';
	$rootScope.title_icon = 'ion-checkmark-round';
	
}]);