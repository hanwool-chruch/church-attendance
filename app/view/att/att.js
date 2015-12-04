'use strict';

angular.module('myApp.att', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/att', {
		templateUrl: 'view/att/att.html',
		controller: 'AttCtrl'
	});
}])

.factory('AttSvc', ['$http','$rootScope', 
            function($http , $rootScope){
	
	return {
		getAttList : function(page){
			return $http.get('/rest/attList/'+page);
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
	
	$scope.mock = true;
	
	$rootScope.title = '출석관리';
	$rootScope.title_icon = 'ion-checkmark-round';
	$rootScope.backdrop = 'backdrop';
	
	var init = function () {
		selectMenu(2); /* 메뉴 선택 */
	};
	
	init();
	
	var p=2;
	
	$scope.more = function(){
		$rootScope.backdrop = 'backdrop';
		AttSvc.getAttList(p).success(function(data){
			
			if(data != null && data.length > 0) {
				for (var i in data) {$scope.attList.push(data[i]);}
				p++;
			}
			
			$rootScope.backdrop = undefined;
		});
	}
	
	
		
	AttSvc.getAttList(1).success(function(data){
		$scope.attList = data;
		$scope.mock = false;
		$rootScope.backdrop = undefined;
	});
	
	
	
}]);