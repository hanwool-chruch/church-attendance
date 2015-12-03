'use strict';

angular.module('myApp.member', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider
	
	.when('/member', {
		templateUrl: 'view/member/member.html',
		controller: 'MemberCtrl'
	})
	.when('/member/:userId', {
		templateUrl: 'view/member/memberDetail.html',
		controller: 'MemberDetailCtrl'
	})
	;
}])

.factory('MemberSvc', ['$http', function($http){
	
	var memberList = {};
	
	return {
		getMemberList : function(){
			return $http({ 
				cache: false,
				url: '/rest/member',
				data: {t:new Date().getMilliseconds()},
				method: 'GET'});
		},
		getDetail : function(id) {
			console.log('대원 상세정보 보기, userId : ', id);

			var keys = [];
			for ( var key in memberList) {
				if (memberList.hasOwnProperty(key)) {
					keys.push(key);
				}
			}
			
			for(var i=0 ; i<keys.length ; i++) {
				
				var key = keys[i];
				var mList = memberList[key];
				
				for(var j=0 ; j<mList.length ; j++) {
					var m = mList[j];
					if(m.userId.toString() === id) {
						return m;
					}
				}
			}
			
			return null;
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
		console.log($scope.memberList);
	});
	
	$scope.detail = function(userId){
		$location.path('/member/'+userId).search({});
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
	
	$scope.member = MemberSvc.getDetail($routeParams.userId);
	
	if($scope.member === null) {
		/* 존재하지 않는 userId일 경우 대원목록 화면으로 이동 */
		$location.path('/member');
	}
	
	/* 대원 목록으로 이동 */
	$scope.gotoMemberList = function(){
		$location.path('/member');
	}
}])

;