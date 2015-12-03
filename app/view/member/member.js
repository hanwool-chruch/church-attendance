'use strict';

angular.module('myApp.member', ['ngRoute'])

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
	
	var memberList = null;
	
	return {
		getMemberList : function(){
			return $http({ 
				cache: false,
				url: '/rest/member',
				data: {t:new Date().getMilliseconds()},
				method: 'GET'});
		},
		getDetail : function(id) {
			
			console.log('getDetail : ', id);
			
			return $http({ 
				cache: false,
				url: '/rest/member/'+id,
				data: {t:new Date().getMilliseconds()},
				method: 'GET'});
		}
	};
}])

.controller('MemberCtrl', ['$scope', '$rootScope', '$window', '$location', 'MemberSvc',
                  function ($scope ,  $rootScope ,  $window ,  $location ,  MemberSvc) {
	
	$rootScope.title = '대원관리';
	$rootScope.title_icon = 'ion-person';
	
	var init = function () {
		selectMenu(1); /* 메뉴 선택 */
	};
	
	init();
	
	MemberSvc.getMemberList().success(function(data){
		$scope.memberList = data;
	});
	
	$scope.detail = function(memberId){
		$location.path('/member/'+memberId).search({});
	}
	
}])

.controller('MemberDetailCtrl', ['$scope', '$rootScope', '$window', '$routeParams', 'MemberSvc', '$location',
                        function ($scope ,  $rootScope ,  $window ,  $routeParams ,  MemberSvc ,  $location) {
	
	$rootScope.title = '대원관리';
	$rootScope.title_icon = 'ion-person';
	
	var init = function () {
		selectMenu(1); /* 메뉴 선택 */
	};
	
	init();
	
	console.log('memberId : ', $routeParams.memberId);
	
	MemberSvc.getDetail($routeParams.memberId).success(function(data){
		
		if(!data) {
			/* 존재하지 않는 memberid일 경우 대원목록 화면으로 이동 */
			$location.path('/member');
		} else {
			$scope.member = data[0];
		}
	});
	
	/* 대원 목록으로 이동 버튼*/
	$scope.gotoMemberList = function(){
		$location.path('/member');
	}
}])

;