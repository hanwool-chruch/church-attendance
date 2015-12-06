'use strict';

angular.module('myApp.att', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/att', {
		templateUrl: 'view/att/att.html',
		controller: 'AttCtrl'
	})
	.when('/att/regist', {
		templateUrl: 'view/att/attRegist.html',
		controller: 'AttRegistCtrl'
	})
	.when('/att/:practiceDt/:practiceCd', {
		templateUrl: 'view/att/attDetail.html',
		controller: 'AttDetailCtrl'
	})
	;
}])

.factory('AttSvc', ['$http','$rootScope', 
            function($http , $rootScope) {
	
	return {
		/* 연습정보 목록 */
		getAttList : function(page) {
			return $http.get('/rest/att/list/'+page + '?t='+new Date());
		},
		/* 연습정보 등록 */
		save : function(att) {
			return $http.post('/rest/att', att);
		},
		/* 연습정보  */
		remove : function(pDt,pCd) {
			return $http.delete('/rest/att/'+pDt+'/'+pCd);
		},
		/* 연습정보 상세(출석정보 포함) */
		getDetail : function(pDt, pCd) {
			return $http.get('/rest/att/'+pDt+'/'+pCd + '?t='+new Date());
		},
		/* 연습곡 수정 */
		saveMusicInfo : function(pDt, pCd, musicInfo) {
			return $http.put('/rest/att/'+pDt+'/'+pCd+'/musicInfo',{ musicInfo : musicInfo });
		},
		/* 메모 수정 */
		saveEtcMsg : function(pDt, pCd, etcMsg) {
			
			return $http.put('/rest/att/'+pDt+'/'+pCd+'/etcMsg',{ etcMsg : etcMsg });
		},
		/* 출석체크 */
		select : function(pDt, pCd, memberId, attYn) {
			switch(attYn) {
				case 'Y':
					return $http.post('/rest/att/'+pDt+'/'+pCd+'/deselect',{ memberId : memberId });
					break;
				case 'N':
					return $http.post('/rest/att/'+pDt+'/'+pCd+'/select',{ memberId : memberId });
					break;
				default:
					break;
			}
		},
		/* 마감 처리 */
		lockAtt: function(pDt, pCd) {
			return $http.put('/rest/att/'+pDt+'/'+pCd+'/lockAtt');
		},
		/* 마감 해제 처리 */
		unlockAtt: function(pDt, pCd) {
			return $http.put('/rest/att/'+pDt+'/'+pCd+'/unlockAtt');
		}
	};
}])
.factory('socket', function ($rootScope) {
	
	var socket = io.connect();
	
	return {
		on: function (eventName, callback) {
			socket.on(eventName, function () {  
				var args = arguments;
				$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			});
		},
		emit: function (eventName, data, callback) {
			socket.emit(eventName, data, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			})
		}
	};
})
.controller('AttCtrl', [ '$scope', '$rootScope', 'AttSvc', '$location', 'socket',
                 function($scope ,  $rootScope ,  AttSvc ,  $location ,  socket) {
	
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
	
	/* 상세정보 보기 */
	$scope.detail = function(att) {
		$location.path('/att/'+att.practiceDt+'/'+att.practiceCd);
	}
	
}])

.controller('AttRegistCtrl', [ '$scope', '$rootScope', 'AttSvc', '$location', 'CodeSvc', '$q', 'socket',
                       function($scope ,  $rootScope ,  AttSvc ,  $location ,  CodeSvc ,  $q ,  socket) {
	
	$rootScope.title = '출석관리';
	$rootScope.title_icon = 'ion-checkmark-round';
	$rootScope.backdrop = 'backdrop';
	
	var init = function() {
		selectMenu(2); /* 메뉴 선택 */
	};
	
	init();
	
	/* 날짜선택 플러그인 적용 */
	$(function () {
		$('#datetimepicker').datetimepicker({
			format: 'L',
			locale: 'ko'
		});
    });

	/* 코드리스트 불러오기 */
	$q.all([CodeSvc.getCodeList()])
	
	.then(function(resultArray) {
		$scope.code = resultArray[0].data;
		$rootScope.backdrop = undefined;
		
		$scope.att = new Object();
		
		var idx = 0;
		if(moment().days() == 0 && new Date().getHours() <= 12) idx = 0; /* 오전연습 */
		else if(moment().days() == 0 && new Date().getHours() > 12) idx = 1; /* 오후연습 */
		else idx = 2; /* 특별연습 */
		$scope.att.practiceCd = $scope.code.practiceList[idx].PRACTICE_CD;
		$scope.att.practiceNm = $scope.code.practiceList[idx].PRACTICE_NM;
		
		$scope.att.practiceDt = moment().format("YYYY-MM-DD");
		
		$rootScope.backdrop = undefined;
	});
	
	/* 연습일정 목록으로 이동 버튼*/
	$scope.gotoAttList = function() {
		$location.path('/att');
	}
	
	/* 저장 버튼*/
	$scope.save = function() {
		if($scope.attForm.$invalid) {
			$.notify('날짜를 형식(YYYY-MM-DD)에 맞게 선택/입력해주세요.');
		} else {
			
			$rootScope.backdrop = 'backdrop';
			
			AttSvc.save($scope.att).success(function(data) {
				
				$rootScope.backdrop = undefined;
				
				$location.path('/att');
				$.notify('저장되었습니다.');
			});
		}
	}
}])

.controller('AttDetailCtrl', [ '$scope', '$rootScope', 'AttSvc', '$location', 'CodeSvc', '$q', '$routeParams', 'socket', '$route',
                       function($scope ,  $rootScope ,  AttSvc ,  $location ,  CodeSvc ,  $q ,  $routeParams ,  socket ,  $route) {
	
	$rootScope.title = '출석관리';
	$rootScope.title_icon = 'ion-checkmark-round';
	$rootScope.backdrop = 'backdrop';
	
	var init = function() {
		selectMenu(2); /* 메뉴 선택 */
	};
	
	init();
	
	$q.all([CodeSvc.getCodeList(), AttSvc.getDetail($routeParams.practiceDt, $routeParams.practiceCd)])
	
	.then(function(resultArray) {
		$scope.code = resultArray[0].data;
		
		$scope.att = resultArray[1].data.attInfo;
		$scope.sList = resultArray[1].data.s;
		$scope.aList = resultArray[1].data.a;
		$scope.tList = resultArray[1].data.t;
		$scope.bList = resultArray[1].data.b;
		$scope.eList = resultArray[1].data.e;
		$scope.hList = resultArray[1].data.h;
		$scope.xList = resultArray[1].data.x;
		
		$rootScope.backdrop = undefined;
	});
	
	/* 연습일정 목록으로 이동 버튼*/
	$scope.gotoAttList = function() {
		$location.path('/att');
	}
	
	/* 연습일정 삭제 */
	$scope.remove = function(pDt, pCd) {
		
		bootbox.dialog({
			message: "연습정보 및 출석정보를 정말로 삭제하시겠습니까?",
			title: "삭제 확인",
			buttons: {
				danger: {
					label: "삭제",
					className: "btn-danger",
					callback: function() {
						$rootScope.backdrop = 'backdrop';
						
						AttSvc.remove(pDt, pCd).success(function(data) {
							
							$rootScope.backdrop = undefined;
							
							$location.path('/att');
							$.notify('연습일정이 삭제되었습니다.');
						});
					}
				},
				main: {
					label: "취소",
					className: "btn-primary",
					callback: function() {
					
					}
				}
			}
		});
	}
	
	/* 연습곡 저장 */
	$scope.saveMusicInfo = function(pDt, pCd, musicInfo) {
		
		$rootScope.backdrop = 'backdrop';
		
		console.log('연습곡 저장');
		AttSvc.saveMusicInfo(pDt, pCd, musicInfo).success(function(data) {
			
			if(data.result == 'success') {
				$.notify('연습곡이 저장되었습니다.');
			} else {
				$.notify('저장에 실패하였습니다.');
			}
			
			$rootScope.backdrop = undefined;
		});
	}
	
	/* 메모 저장 */
	$scope.saveEtcMsg = function(pDt, pCd, etcMsg) {
		
		$rootScope.backdrop = 'backdrop';
		
		console.log(etcMsg);
		AttSvc.saveEtcMsg(pDt, pCd, etcMsg).success(function(data) {
			
			if(data.result == 'success') {
				$.notify('메모가 저장되었습니다.');
			} else {
				$.notify('저장에 실패하였습니다.');
			}
			
			$rootScope.backdrop = undefined;
		});
	}
	
	/* 마감 */
	$scope.lockAtt = function(pDt, pCd) {
		console.log('연습정보 마감');
		
		bootbox.dialog({
			message: "연습정보 및 출석정보를 정말로 마감 하시겠습니까?",
			title: "마감 확인",
			buttons: {
				danger: {
					label: "마감",
					className: "btn-danger",
					callback: function() {
						$rootScope.backdrop = 'backdrop';
						
						AttSvc.lockAtt(pDt, pCd).success(function(data) {
							
							$rootScope.backdrop = undefined;
							
							$route.reload();
							$.notify('연습일정이 마감 되었습니다. 마감해제 전에 연습정보를 수정하실 수 없습니다.');
						});
					}
				},
				main: {
					label: "취소",
					className: "btn-primary",
					callback: function() {
					
					}
				}
			}
		});
	}
	
	/* 마감 해제 */
	$scope.unlockAtt = function(pDt, pCd) {
		console.log('연습정보 마감 해제');

		bootbox.dialog({
			message: "연습정보 및 출석정보를 정말로 마감 해제 하시겠습니까?",
			title: "마감 해제 확인",
			buttons: {
				danger: {
					label: "마감 해제",
					className: "btn-danger",
					callback: function() {
						$rootScope.backdrop = 'backdrop';
						
						AttSvc.unlockAtt(pDt, pCd).success(function(data) {
							
							$rootScope.backdrop = undefined;
							
							$route.reload();
							$.notify('연습일정이 마감 해제 되었습니다. 이제 연습정보를 수정하실 수 있습니다.');
						});
					}
				},
				main: {
					label: "취소",
					className: "btn-primary",
					callback: function() {
					
					}
				}
			}
		});
	}
	
	/* 출석체크 */
	$scope.select = function(pDt, pCd, memberId, lockYn, attYn, partCd) {
		
		console.log('pDt : ', pDt);
		console.log('pCd : ', pCd);
		console.log('memberId : ', memberId);
		console.log('lockYn : ', lockYn);
		console.log('attYn : ', attYn);
		console.log('partCd : ', partCd);
		
		if(lockYn === 'N') {
			
			$rootScope.backdrop = 'backdrop';
			
			console.log('출석체크');
			
			//출석 정보 INSERT 후 콜백안에 넣을 코드
			//select : function(pDt, pCd, memberId, attYn) {
			
			AttSvc.select(pDt, pCd, memberId, attYn).success(function(data) {
				
				if(data.result === 'success') {
				
					switch(partCd) {
						case 'S':
							$scope.sList.forEach(function(m){
								if(m.memberId === memberId) {
									if(m.attYn === 'Y') m.attYn = 'N';
									else if(m.attYn === 'N') m.attYn = 'Y';
								}
							});
							break;
						case 'A':
							$scope.aList.forEach(function(m){
								if(m.memberId === memberId) {
									if(m.attYn === 'Y') m.attYn = 'N';
									else if(m.attYn === 'N') m.attYn = 'Y';
								}
							});
							break;
						case 'T':
							$scope.tList.forEach(function(m){
								if(m.memberId === memberId) {
									if(m.attYn === 'Y') m.attYn = 'N';
									else if(m.attYn === 'N') m.attYn = 'Y';
								}
							});
							break;
						case 'B':
							$scope.bList.forEach(function(m){
								if(m.memberId === memberId) {
									if(m.attYn === 'Y') m.attYn = 'N';
									else if(m.attYn === 'N') m.attYn = 'Y';
								}
							});
							break;
						case 'E':
							$scope.eList.forEach(function(m){
								if(m.memberId === memberId) {
									if(m.attYn === 'Y') m.attYn = 'N';
									else if(m.attYn === 'N') m.attYn = 'Y';
								}
							});
							break;
						case 'H':
							$scope.hList.forEach(function(m){
								if(m.memberId === memberId) {
									if(m.attYn === 'Y') m.attYn = 'N';
									else if(m.attYn === 'N') m.attYn = 'Y';
								}
							});
							break;
						case 'X':
							$scope.xList.forEach(function(m){
								if(m.memberId === memberId) {
									if(m.attYn === 'Y') m.attYn = 'N';
									else if(m.attYn === 'N') m.attYn = 'Y';
								}
							});
							break;
						default:
							break;
					}
				} else {
					$.notify('서버 오류가 발생하였습니다. 잠시 후 다시 시도 해주시기바랍니다.');
				}
				
				$rootScope.backdrop = undefined;
			});
		} else {
			console.log('마감된 정보는 출석체크 하지 않음');
		}
	}
}])
;