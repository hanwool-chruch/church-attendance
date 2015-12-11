'use strict';

angular.module('myApp.member', ['ngRoute', 'ngResource'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider
	
	.when('/member', {
		templateUrl: 'view/member/member.html',
		controller: 'MemberCtrl'
	})
	.when('/member/view/:memberId', {
		templateUrl: 'view/member/memberDetail.html',
		controller: 'MemberDetailCtrl'
	})
	.when('/member/regist', {
		templateUrl: 'view/member/memberDetail.html',
		controller: 'MemberRegistCtrl'
	})
	;
}])

.factory('MemberSvc', ['$http', function($http) {
	
	return {
		getMemberList : function() {
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
		save : function(method, member) {
			
			switch (method) {
			    case 'insert':
			    	console.log('insert');
			    	return $http.post('/rest/member', member);
			        break;
			    case 'update':
			    	console.log('update');
			    	return $http.put('/rest/member', member);
			        break;
			}
			
			return $http.post('/rest/member', member);
		}
	};
}])

.factory('CodeSvc', ['$http', function($http) {
	
	return {
		getCodeList : function() {
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
	
	$rootScope.backdrop = 'backdrop';
	
	var init = function () {
		selectMenu(1); /* 메뉴 선택 */
	};
	
	init();
	
	MemberSvc.getMemberList().success(function(data) {
		$scope.memberList = data;
		$rootScope.backdrop = undefined;
	});
	
	$scope.detail = function(memberId) {
		$location.path('/member/view/'+memberId).search({});
	}
	
	$scope.regist = function() {
		$location.path('/member/regist');
	}
}])

.controller('MemberDetailCtrl', ['$scope', '$rootScope', '$window', '$routeParams', 'MemberSvc', '$location', 'CodeSvc', '$q',
                        function ($scope ,  $rootScope ,  $window ,  $routeParams ,  MemberSvc ,  $location ,  CodeSvc ,  $q) {
	
	$rootScope.backdrop = 'backdrop';
	
	var init = function () {
		selectMenu(1); /* 메뉴 선택 */
	};
	
	init();
	
	$q.all([MemberSvc.getDetail($routeParams.memberId), CodeSvc.getCodeList()])
		
	.then(function(resultArray) {
		
		$scope.member = resultArray[0].data;
		$scope.code = resultArray[1].data;
		
		if(!$scope.member) {
			$location.path('/member');
		}
		
		$rootScope.backdrop = undefined;
	});
	
	/* 대원 목록으로 이동 버튼*/
	$scope.gotoMemberList = function() {
		$location.path('/member');
	}
	
	/* 대원정보 저장 */
	$scope.save = function() {
			
		if($scope.memberForm.$invalid) {
			$.notify('이름 혹은 핸드폰 전화번호를 형식에 맞게 입력해주세요.');
		} else {
			
			$rootScope.backdrop = 'backdrop';
			
			MemberSvc.save('update', $scope.member).success(function(data) {
				
				$rootScope.backdrop = undefined;
				
				$location.path('/member');
				$.notify('저장되었습니다.');
			});
		}
	}
}])
.controller('MemberRegistCtrl', ['$scope', '$rootScope', '$window', 'MemberSvc', '$location', 'CodeSvc', '$q',
                        function ($scope ,  $rootScope ,  $window ,  MemberSvc ,  $location ,  CodeSvc ,  $q) {
	
	$rootScope.backdrop = 'backdrop';
	
	var init = function () {
		selectMenu(1); /* 메뉴 선택 */
	};
	
	init();
	
	$q.all([CodeSvc.getCodeList()])
		
	.then(function(resultArray) {
		$scope.code = resultArray[0].data;
		$rootScope.backdrop = undefined;
		
		$scope.member = new Object();
		
		$scope.member.cPositionCd = $scope.code.cPositionList[0].C_POSITION_CD;
		$scope.member.cPositionNm = $scope.code.cPositionList[0].C_POSITION_NM;
		$scope.member.positionCd = $scope.code.positionList[$scope.code.positionList.length-1].POSITION_CD;
		$scope.member.positionNm = $scope.code.positionList[$scope.code.positionList.length-1].POSITION_NM;
		$scope.member.statusNm = $scope.code.statusList[0].STATUS_NM;
		$scope.member.statusCd = $scope.code.statusList[0].STATUS_CD;
		$scope.member.partNm = $scope.code.partList[0].PART_NM;
		$scope.member.partCd = $scope.code.partList[0].PART_CD;
	});
	
	/* 대원 목록으로 이동 버튼*/
	$scope.gotoMemberList = function() {
		$location.path('/member');
	}
	
	/* 대원정보 저장 */
	$scope.save = function() {
			
		if($scope.memberForm.$invalid) {
			$.notify('이름 혹은 핸드폰 전화번호를 형식에 맞게 입력해주세요.');
		} else {
			
			$rootScope.backdrop = 'backdrop';
			
			MemberSvc.save('insert', $scope.member).success(function(data) {
				
				$rootScope.backdrop = undefined;
				
				$location.path('/member');
				$.notify('저장되었습니다.');
			});
		}
	}
}])

;