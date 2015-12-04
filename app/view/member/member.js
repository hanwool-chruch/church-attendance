'use strict';

angular.module('myApp.member', ['ngRoute', 'ngResource'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider
	
	.when('/member', {
		templateUrl: 'view/member/member.html',
		controller: 'MemberCtrl'
	})
	.when('/member/:memberId', {
		templateUrl: 'view/member/memberDetail.html',
		controller: 'MemberDetailCtrl'
	})
	;
}])

.factory('MemberSvc', ['$http', function($http){
	
	return {
		getMemberList : function(){
			return $http({ 
				cache: false,
				url: '/rest/member',
				data: {t:new Date().getMilliseconds()},
				method: 'GET'});
		},
		getDetail : function(id) {
			
			return $http({ 
				cache: false,
				url: '/rest/member/'+id,
				data: {t:new Date().getMilliseconds()},
				method: 'GET'});
		},
		save : function(member) {
			
			return $http.post('/rest/member', member);
		}
	};
}])

.factory('CodeSvc', ['$http', function($http){
	
	return {
		getCodeList : function(){
			return $http({ 
				cache: true,
				url: '/rest/codeList',
				data: {t:new Date().getMilliseconds()},
				method: 'GET'});
		}
	};
}])

.controller('MemberCtrl', ['$scope', '$rootScope', '$window', '$location', 'MemberSvc',
                  function ($scope ,  $rootScope ,  $window ,  $location ,  MemberSvc) {
	
	$rootScope.title = '대원관리';
	$rootScope.title_icon = 'ion-person';
	$rootScope.backdrop = 'backdrop';
	
	var init = function () {
		selectMenu(1); /* 메뉴 선택 */
	};
	
	init();
	
	MemberSvc.getMemberList().success(function(data){
		$scope.memberList = data;
		$rootScope.backdrop = undefined;
	});
	
	$scope.detail = function(memberId){
		$location.path('/member/'+memberId).search({});
	}
}])

.controller('MemberDetailCtrl', ['$scope', '$rootScope', '$window', '$routeParams', 'MemberSvc', '$location', 'CodeSvc', '$q',
                        function ($scope ,  $rootScope ,  $window ,  $routeParams ,  MemberSvc ,  $location ,  CodeSvc ,  $q) {
	
	$rootScope.title = '대원관리';
	$rootScope.title_icon = 'ion-person';
	$rootScope.backdrop = 'backdrop';
	
	var init = function () {
		selectMenu(1); /* 메뉴 선택 */
	};
	
	init();
	
	$q.all([MemberSvc.getDetail($routeParams.memberId), CodeSvc.getCodeList($routeParams.memberId)])
		
	.then(function(resultArray){
		
		$scope.member = resultArray[0].data;
		$scope.code = resultArray[1].data;
		
		if(!$scope.member) {
			$location.path('/member');
		}
		
		$rootScope.backdrop = undefined;
	});
	
	/* 대원 목록으로 이동 버튼*/
	$scope.gotoMemberList = function(){
		$location.path('/member');
	}
	
	/* 대원정보 저장 */
	$scope.save = function(){
		
		$rootScope.backdrop = 'backdrop';
		
		if($scope.member.memberId) {
			MemberSvc.save($scope.member).success(function(data){
				
				$rootScope.backdrop = undefined;
				
				$location.path('/member');
				$.notify('저장되었습니다.');
			});
		}
	}
}])

;