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

.factory('MemberSvc', ['$http', function($scope, $http){
	
	var memberList = {
	                  'sop':[
	                  	        {userId:1, name:'이영하', part: '소프라노', cPosition:'집사', position:'찬양대원', phone:'010-1111-1111', status:'활동중', memo:'메모입니다.'},
	                  	        {userId:2, name:'홍종순', part: '소프라노', cPosition:'집사', position:'찬양대원', phone:'010-1111-1111', status:'활동중', memo:'메모입니다.'}
	        	             ]
	                  ,
	                  'alto':[
	        	       	        {userId:3, name:'송민아', part: '알토', cPosition:'집사', position:'찬양대원', phone:'010-1111-1111', status:'활동중', memo:'메모입니다.'},
	        	    	        {userId:4, name:'조은주', part: '알토', cPosition:'회계', position:'찬양대원', phone:'010-1111-1111', status:'활동중', memo:'메모입니다.'}
	        	    	      ]
	                  
	};
	
	return {
		getMemberList : function(){
			return memberList;
		},
		getDetail : function(id) {
			console.log('대원 상세정보 보기, userId : ', id);
			return memberList.sop[0];
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
	
	$scope.memberList = MemberSvc.getMemberList();
	
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
	
	/* 대원 목록으로 이동 */
	$scope.gotoMemberList = function(){
		$location.path('/member');
	}
}])

;