'use strict';

angular.module('myApp.rank', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/rank', {
		templateUrl: 'view/rank/rank.html',
		controller: 'RankCtrl'
	});
}])
.factory('RankSvc', ['$http','$rootScope', 
            function($http , $rootScope) {
	
	return {
		/* 출석순위 목록 */
		getRankList : function() {
			return $http.get('/rest/rank?t='+new Date());
		}
	};
}])
.controller('RankCtrl', [ '$scope', '$rootScope', 'RankSvc',
                  function($scope ,  $rootScope ,  RankSvc) {
	var init = function () {
		selectMenu(3); /* 메뉴 선택 */
	};
	
	init();

	/* Backdrop 적용시 레이아웃 깨짐 방지 목업 div 엘리먼트 show */
	$scope.mock = true;
	
	$rootScope.title = '출석순위';
	$rootScope.title_icon = 'ion-trophy';

	// 조회기간 구하기
	// ===============
	var curDate = new Date();
	var curYear = curDate.getFullYear();
	var curMonth = (curDate.getMonth()+1);
	
	if(curMonth == 12) {
		$scope.startDt = curYear + "-12-01";
		$scope.endDt = (curYear+1) + "-11-30";
	} else {
		$scope.startDt = (curYear-1) + "-12-01";
		$scope.endDt = (curYear) + "-11-30";
	} //조회기간 구하기 끝
	
	$rootScope.backdrop = 'backdrop';
	
	RankSvc.getRankList().success(function(data){
		$scope.rankList = data;
		
		var prevAmCnt=0, prevPmCnt=0, prevSpCnt=0, rankNo=1;
		$scope.rankList.forEach(function(rank){

			if(rank.amCnt < prevAmCnt) {
				++rankNo;
			} else if(rank.pmCnt < prevPmCnt) {
				++rankNo;
			} else if(rank.spCnt < prevSpCnt) {
				++rankNo;
			}
			
			rank.rankNo = rankNo; 

			prevAmCnt = rank.amCnt;
			prevPmCnt = rank.pmCnt;
			prevSpCnt = rank.spCnt;
		});
		
		/* Backdrop 적용시 레이아웃 깨짐 방지 목업 div 엘리먼트 show */
		$scope.mock = false;
		$rootScope.backdrop = undefined;
	});
	
}]);