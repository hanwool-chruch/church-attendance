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
	
	
	var init = function () {
		selectMenu(2); /* 메뉴 선택 */
	};
	
	init();
	
	var page = 1;
	$scope.attList = [];
	
	var moreLoad = function() {
		
		AttSvc.getAttList(page).success(function(data){
			
			if ($scope.attList.length === 0) {
				$scope.attList = data;
			}
			else for (var i in data) $scope.attList.push(data[i]);

			if (data.length !== 0) {
				++page;
			}
		});
	}
	
	moreLoad();
	
	$(window).scroll(
		
		function() {
			if ($(window).scrollTop() >= $(document).height() - $(window).height() - 80) {
				$rootScope.backdrop = 'backdrop';
				moreLoad();	
				$rootScope.backdrop = undefined;
			}
		}
	);
	
	$rootScope.title = '출석관리';
	$rootScope.title_icon = 'ion-checkmark-round';
	
}]);