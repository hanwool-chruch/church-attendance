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
		save : function(pDt, pCd, musicInfo, etcMsg) {
			return $http.post('/rest/att/'+pDt+'/'+pCd, {musicInfo:musicInfo, etcMsg:etcMsg});
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
		},
		removeAllListeners: function() {
			socket.removeAllListeners();
		}
	};
})
.controller('AttCtrl', [ '$scope', '$rootScope', 'AttSvc', '$location', 'socket', '$route',
                 function($scope ,  $rootScope ,  AttSvc ,  $location ,  socket ,  $route) {
	
	
	/* socket - remove all listeners */
	$scope.$on('$destroy', function (event) {
		socket.removeAllListeners();
	});

	/* 소켓-연습정보 목록 입장 */
	socket.emit('hallJoin');
	
	/* 연습정보가 변경되었을때, 페이지 리프레시 */
	socket.on('refreshPage', function(data) {
		$.notify(data);
		$route.reload();
	});
	
	/* Backdrop 적용시 레이아웃 깨짐 방지 목업 div 엘리먼트 show */
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
	
	/* socket - remove all listeners */
	$scope.$on('$destroy', function (event) {
		socket.removeAllListeners();
	});
	
	$rootScope.title = '출석관리';
	$rootScope.title_icon = 'ion-checkmark-round';
	$rootScope.backdrop = 'backdrop';
	
	var init = function() {
		selectMenu(2); /* 메뉴 선택 */
	};
	
	init();
	
	/**
	$(function () {
		$('#datetimepicker').datetimepicker({
			format: 'L',
			locale: 'ko'
		});
    });
    **/

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
	$scope.save = function(pDt, pCd, musicInfo, etcMsg) {

		if($scope.attForm.$invalid) {
			$.notify('날짜를 형식(YYYY-MM-DD)에 맞게 선택/입력해주세요.');
		} else {
			
			$rootScope.backdrop = 'backdrop';
			
			AttSvc.save(pDt, pCd, musicInfo, etcMsg).success(function(data) {
				
				console.log(pDt);
				console.log(pCd);
				console.log(musicInfo);
				console.log(etcMsg);
				
				if(data.result === 'success') {
					/* 소켓-연습정보 추가 알림 */
					socket.emit('addAtt');
					$location.path('/att');
				} else if(data.result === 'dup') {
					$.notify('이미 생성된 연습정보가 있습니다.');
					$location.path('/att');
				}
				
				$rootScope.backdrop = undefined;
				
				
				
			});
		}
	}
}])

.controller('AttDetailCtrl', [ '$scope', '$rootScope', 'AttSvc', '$location', 'CodeSvc', '$q', '$routeParams', 'socket', '$route',
                       function($scope ,  $rootScope ,  AttSvc ,  $location ,  CodeSvc ,  $q ,  $routeParams ,  socket ,  $route) {
	
	/* socket - remove all listeners */
	$scope.$on('$destroy', function (event) {
		socket.removeAllListeners();
	});
	
	/* 소켓-연습 상세정보 입장 */
	socket.emit('join', $routeParams.practiceDt + $routeParams.practiceCd);
	
	/* 연습곡 정보 갱신 */
	socket.on('replaceMusicInfo', function(data) {
		$scope.att.musicInfo = data;
		$.notify('연습곡 정보가 갱신되었습니다.');
	});
	
	/* 연습정보가 변경되었을때, 페이지 리프레시 */
	socket.on('refreshPage', function(data) {
		$.notify(data);
		$route.reload();
	});
	
	/* 연습곡 정보 갱신 */
	socket.on('replaceEtcMsg', function(data) {
		$scope.att.etcMsg = data;
		$.notify('메모가 갱신되었습니다.');
	});
	
	/* 출석체크 */
	socket.on('select', function(data) {
		$scope.sList .concat(
				$scope.aList).concat(
				$scope.tList).concat(
				$scope.bList).concat(
				$scope.eList).concat(
				$scope.hList).concat(
				$scope.xList).forEach(function(m){
					if(m.memberId === data.memberId) {
						m.attYn = data.attYn==='Y'?'N':'Y';
						return false;
					}
				});
	});
	
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
			title: "<i class='ion-android-alert'></i> 삭제 확인",
			buttons: {
				danger: {
					label: "삭제",
					className: "btn-danger",
					callback: function() {
						$rootScope.backdrop = 'backdrop';
						
						AttSvc.remove(pDt, pCd).success(function(data) {
							
							$rootScope.backdrop = undefined;
							
							$location.path('/att');
							
							/* 소켓-연습정보 삭제 알림 */
							socket.emit('removeAtt');
						});
					}
				},
				main: {
					label: "취소",
					className: "btn-default",
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
				/* 소켓-연습곡 갱신 알림 */
				socket.emit('refreshMusicInfo', musicInfo);
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
				/* 소켓-메모 갱신 알림 */
				socket.emit('refreshEtcMsg', etcMsg);
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
			message: "연습정보 및 출석정보를 정말로 마감 하시겠습니까? 마감된 연습정보는 수정하실 수 없습니다.",
			title: "<i class='ion-android-alert'></i> 마감 확인",
			buttons: {
				danger: {
					label: "마감",
					className: "btn-success",
					callback: function() {
						$rootScope.backdrop = 'backdrop';
						
						AttSvc.lockAtt(pDt, pCd).success(function(data) {
							
							$rootScope.backdrop = undefined;
							
							/* 소켓-마감 알림 */
							socket.emit('closeAtt');
						});
					}
				},
				main: {
					label: "취소",
					className: "btn-default",
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
			title: "<i class='ion-android-alert'></i> 마감 해제 확인",
			buttons: {
				danger: {
					label: "마감 해제",
					className: "btn-success",
					callback: function() {
						$rootScope.backdrop = 'backdrop';
						
						AttSvc.unlockAtt(pDt, pCd).success(function(data) {
							
							$rootScope.backdrop = undefined;
							
							/* 소켓-마감 해제 알림 */
							socket.emit('uncloseAtt');
						});
					}
				},
				main: {
					label: "취소",
					className: "btn-default",
					callback: function() {
					
					}
				}
			}
		});
	}
	
	/* 출석체크/해제 */
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
			
			AttSvc.select(pDt, pCd, memberId, attYn).success(function(data) {
				
				if(data.result === 'success') {
				
					var params = new Object();
					params.pDt = pDt;
					params.pCd = pCd;
					params.memberId = memberId;
					params.attYn = attYn;
					
					socket.emit('select', params);
					
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