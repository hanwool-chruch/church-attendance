'use strict';

angular.module('myApp.att', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/att', {
		templateUrl: 'view/att/att.html',
		controller: 'AttCtrl'
	});
	
	$routeProvider.when('/att/regist', {
		templateUrl: 'view/att/attRegist.html',
		controller: 'AttRegistCtrl'
	});
}])

.factory('AttSvc', ['$http','$rootScope', 
            function($http , $rootScope) {
	
	return {
		getAttList : function(page) {
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

.controller('AttCtrl', [ '$scope', '$rootScope', 'AttSvc', '$location', 
                 function($scope ,  $rootScope ,  AttSvc ,  $location) {
	
	$scope.mock = true;
	
	$rootScope.title = '출석관리';
	$rootScope.title_icon = 'ion-checkmark-round';
	$rootScope.backdrop = 'backdrop';
	
	var init = function() {
		selectMenu(2); /* 메뉴 선택 */
	};
	
	init();
	
	var p=2;
	
	/* 더보기 */
	$scope.more = function() {
		$rootScope.backdrop = 'backdrop';
		AttSvc.getAttList(p).success(function(data) {
			
			if(data != null && data.length > 0) {
				for (var i in data) {$scope.attList.push(data[i]);}
				p++;
			}
			
			$rootScope.backdrop = undefined;
		});
	}
	
	/* 연습일정 추가 */
	$scope.regist = function() {
		$location.path('/att/regist');
	}
		
	AttSvc.getAttList(1).success(function(data) {
		$scope.attList = data;
		$scope.mock = false;
		$rootScope.backdrop = undefined;
	});
	
	
	
}])

.controller('AttRegistCtrl', [ '$scope', '$rootScope', 'AttSvc', '$location', 'CodeSvc', '$q',
                       function($scope ,  $rootScope ,  AttSvc ,  $location ,  CodeSvc ,  $q) {
	
	$rootScope.title = '출석관리';
	$rootScope.title_icon = 'ion-checkmark-round';
	$rootScope.backdrop = 'backdrop';
	
	var init = function() {
		selectMenu(2); /* 메뉴 선택 */
	};
	
	init();

	/* 코드리스트 불러오기 */
	$q.all([CodeSvc.getCodeList()])
	
	.then(function(resultArray) {
		$scope.code = resultArray[0].data;
		$rootScope.backdrop = undefined;
		
		$scope.att = new Object();
		
		var idx = 0; /* 오전연습 */
		var date = new Date();
		var hours = date.getHours();
		console.log(hours);
		if(date.toString().indexOf('Sun') != -1) {
			if(hours > 12) {
				/* 오후연습 */
				idx = 1;
			}
		} else {
			/* 특별연습 */
			idx = 2;
		}
		
		$scope.att.practiceCd = $scope.code.practiceList[idx].PRACTICE_CD;
		$scope.att.practiceNm = $scope.code.practiceList[idx].PRACTICE_NM;
		
		$rootScope.backdrop = undefined;
	});
}])
;