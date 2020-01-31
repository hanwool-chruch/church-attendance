// Generated by CoffeeScript 1.10.0
(function() {
  var angularModule;

  angularModule = angular.module("myApp.attendance", ["ngRoute"]);

  angularModule.config([
    "$routeProvider", function($routeProvider) {
      return $routeProvider.when("/attendance", {
        templateUrl: "view/attendance/list.html",
        controller: "AttCtrl"
      }).when("/attendance/:practiceDt", {
        templateUrl: "view/attendance/detail.html",
        controller: "AttDetailCtrl"
      });
    }
  ]);

  angularModule.factory("AttSvc", [
    "$http", function($http) {
      const PREFIX_API = "/api/attendance"
      return {
        getAttList: $http.createGetRequestFn(PREFIX_API + "/list"),
        getDetail: $http.createGetRequestFn(PREFIX_API + "/detail"),
        saveTitle: function(WORSHIP_DT, title) {
          return $http.createPostRequestFn(PREFIX_API + "/title")({
            TITLE: title,
            WORSHIP_DT: WORSHIP_DT
          });
        },
        saveMessage: function(WORSHIP_DT, massage) {
          return $http.createPostRequestFn(PREFIX_API + "/massage")({
            MESSAGE: massage,
            WORSHIP_DT: WORSHIP_DT
          });
        },
				saveReport: function(WORSHIP_DT, PART_CD, report) {
          return $http.createPostRequestFn(PREFIX_API + "/report")({
            REPORT: report,
            WORSHIP_DT: WORSHIP_DT,
            PART_CD: PART_CD
          });
        },
        select: function(WORSHIP_DT, MEMBER_ID, attYn) {
	         switch (attYn) {
            case "Y":
              return $http.createPostRequestFn(PREFIX_API + "/deselect")({
                WORSHIP_DT: WORSHIP_DT,
                MEMBER_ID: MEMBER_ID
              });
            case "N":
              return $http.createPostRequestFn(PREFIX_API + "/select")({
                WORSHIP_DT: WORSHIP_DT,
                MEMBER_ID: MEMBER_ID
              });
          }
        }
      };
    }
  ]);

  angularModule.factory("socket", function($rootScope) {
    var socket;
    socket = io.connect();
    return {
      on: function(eventName, callback) {
        return socket.on(eventName, function() {
          var args;
          args = arguments;
          return $rootScope.$apply(function() {
            return callback.apply(socket, args);
          });
        });
      },
      emit: function(eventName, data, callback) {
        return socket.emit(eventName, data, function() {
          var args;
          args = arguments;
          return $rootScope.$apply(function() {
            if (callback) {
              return callback.apply(socket, args);
            }
          });
        });
      },
      removeAllListeners: function() {
        return socket.removeAllListeners();
      }
    };
  });
	
  angularModule.controller("AttCtrl", [
    "$scope", "$rootScope", "AttSvc", "$location", "CodeSvc", "socket", "$route", function($scope, $rootScope, AttSvc, $location, CodeSvc, socket, $route) {
      var init, p;

	    $scope.$on("$destroy", function() {
        return socket.removeAllListeners();
      });
      socket.emit("hallJoin");
      socket.on("refreshPage", function(data) {
        $route.reload();
        return $.notify(data);
      });
      $scope.mock = true;
      $rootScope.backdrop = "backdrop";
      init = function() {
        return selectMenu(3);
      };
      init();
      p = 2;
      AttSvc.getAttList().success(function(worships) {
        $scope.worships = worships;
				CodeSvc.getCodeList().success(function(result) {
          $scope.code = result;        
					$scope.partList = $scope.code.partList;
					return $rootScope.backdrop = void 0;
				})

     });
      return $scope.detail = function(worship) {
        return $location.path("/attendance/" + worship.WORSHIP_DT);
      };
    }
  ]);

  angularModule.controller("AttDetailCtrl", [
    "$scope", "$rootScope", "AttSvc", "$location", "CodeSvc", "$q", "$routeParams", "socket", function($scope, $rootScope, AttSvc, $location, CodeSvc, $q, $routeParams, socket) {
      var attDataLoad, init;
      $rootScope.backdrop = "backdrop";
      init = function() {
        return selectMenu(3);
      };
      init();
      $scope.$on("$destroy", function() {
        return socket.removeAllListeners();
      });
      socket.emit("join", $routeParams.practiceDt + $routeParams.practiceCd);
      socket.on("refreshWorshipTitle", function(data) {
        $scope.worship.TITLE = data;
        return $.notify("예배 정보가 갱신되었습니다.");
      });
      socket.on("refreshWorshipMessage", function(data) {
        $scope.worship.MESSAGE = data;
        return $.notify("공지 사항이 등록되었습니다.");
      });
      socket.on("refreshPage", function(data) {
        $rootScope.backdrop = "backdrop";
        return attDataLoad();
      });
      socket.on("refreshReport", function(data) {
        //TODO
        //$scope.worship.MESSAGE = data;
        return $.notify("교사 보고서가 갱신되었습니다.");
      });
      socket.on("select", function(data) {
        return $scope.partList.forEach(function(part) {
					part.memberList.forEach(function(m){
						if (m.MEMBER_ID === data.MEMBER_ID) {
						  (data.attYn === "Y") ? m.attYn = "N" : m.attYn = "Y";						
						}
					});
				});		
      });

      attDataLoad = function() {
        return $q.all([CodeSvc.getCodeList(), AttSvc.getDetail($routeParams.practiceDt)]).then(function(resultArray) {
        $scope.code = resultArray[0].data;
        $scope.worship = resultArray[1].data.worship;
				memberwithPartList = resultArray[1].data.memberList;

        $scope.partList = memberwithPartList;

        if (!$scope.worship) {
            $.notify("존재하지 않는 정보입니다.");
            $location.path("/attendance");
          }
          return $rootScope.backdrop = void 0;
        });
      };

      attDataLoad();
      $scope.gotoAttList = function() {
        return $location.path("/attendance");
      };

      $scope.saveTitle = function(WORSHIP_DT, title) {
        $rootScope.backdrop = "backdrop";
        return AttSvc.saveTitle(WORSHIP_DT, title).success(function(data) {        
          let result = (data == undefined || typeof {} != typeof data) ? 0 : data[0];
          (result) ? socket.emit("refreshWorshipTitle", title) : $.notify("저장에 실패하였습니다.");

          return $rootScope.backdrop = void 0;
        });
      };
      $scope.saveMessage = function(WORSHIP_DT, message) {
        $rootScope.backdrop = "backdrop";
        return AttSvc.saveMessage(WORSHIP_DT, message).success(function(data) {
          let result = (data == undefined || typeof {} != typeof data) ? 0 : data[0];
          (result) ? socket.emit("refreshWorshipMessage", message) : $.notify("저장에 실패하였습니다.");

          return $rootScope.backdrop = void 0;
        });
      };
      $scope.saveReport = function(WORSHIP_DT, PART_CD, report) {
        $rootScope.backdrop = "backdrop";
        return AttSvc.saveReport(WORSHIP_DT, PART_CD, report).success(function(result) {
          (result) ? socket.emit("refreshReport") : $.notify("저장에 실패하였습니다.");
          return $rootScope.backdrop = void 0;
        });
      };

      $scope.select = function(WORSHIP_DT, MEMBER_ID, attYn) {

        $rootScope.backdrop = "backdrop";

        return AttSvc.select(WORSHIP_DT, MEMBER_ID, attYn).success(function(data) {
          let params = new Object();
          params.WORSHIP_DT = WORSHIP_DT;
          params.MEMBER_ID = MEMBER_ID;
    
          params.attYn = attYn;
          socket.emit("select", params);
        return $rootScope.backdrop = void 0;
        });

      };
    }
  ]);

}).call(this);