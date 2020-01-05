(function () {
  var angularModule;
  const ATTRIBUTE_RULE = [
    { max: 100, min: 81, color: "#007bff" },
    { max: 80, min: 61, color: "#28a745" },
    { max: 60, min: 41, color: "#ffc107" },
    { max: 40, min: 0, color: "#dc3545" }
  ];

  angularModule = angular.module("myApp.member", ["ngRoute", "ngResource", "ngFileUpload"]);

  angularModule.config([
    "$routeProvider", function ($routeProvider) {
      return $routeProvider.when("/member", {
        templateUrl: "view/member/member.html",
        controller: "MemberCtrl"
      }).when("/member/view/:memberId", {
        templateUrl: "view/member/memberDetail.html",
        controller: "MemberDetailCtrl"
      }).when("/member/regist", {
        templateUrl: "view/member/memberDetail.html",
        controller: "MemberRegistCtrl"
      }).when("/member_kind", {
        templateUrl: "view/member/memberKind.html",
        controller: "memberKindCtrl"
      });
    }
  ]);

  angularModule.factory("MemberSvc", [
    "$http", function ($http) {

      const PREFIX_API = "/api/member"
      return {
        getMemberList: $http.createGetRequestFn(PREFIX_API + "/list/withpart"),
        getLongAbsenteeList: $http.createGetRequestFn(PREFIX_API + "/list/longAbsentee"),
        getLatestAbsenteeList: $http.createGetRequestFn(PREFIX_API + "/list/latestAbsentee"),
        getBaptismList: $http.createGetRequestFn(PREFIX_API + "/list/baptism"),
        getNameSortedMemberList: $http.createGetRequestFn(PREFIX_API + "/list/sortedName"),
        getBirthDayMemberList: $http.createGetRequestFn(PREFIX_API + "/list/birthday"),
        needPartList: $http.createGetRequestFn(PREFIX_API + "/list/need/part"),
        needMoreInformationList: $http.createGetRequestFn(PREFIX_API + "/list/need/more"),
        getAttributeRatio: $http.createGetRequestFn(PREFIX_API + "/list/attributeRatio"),
        getTeacherList: $http.createGetRequestFn(PREFIX_API + "/list/teacher"),
        getAttendances: $http.createGetRequestFn(PREFIX_API + "/attendance"),
        getDetail: $http.createGetRequestFn(PREFIX_API),
        downLoadExcel: $http.createGetRequestFn(PREFIX_API + "/downLoad/Excel"),
        updatePart: function (member_id, part_cd) {
          return $http.createPostRequestFn(PREFIX_API + "/part")({
            MEMBER_ID: member_id,
            PART_CD: part_cd
          });
        },        
        deleteMember: function (id) {
          return $http.delete("/api/member/" + id);
        },
        save: function (method, member) {
          switch (method) {
            case "insert":
              return $http.post("/api/member", member)
              break;
            case "update":
              return $http.put("/api/member", member)
              break;
          }

        }
      };
    }
  ]);

  angularModule.factory("CodeSvc", [
    "$http", function ($http) {
      const PREFIX_API = "/api/code"
      return {
        getCodeList: $http.createGetRequestFn(PREFIX_API + "/"),
      };
    }
  ]);

  angularModule.controller("MemberCtrl", [
    "$scope", "$rootScope", "$window", "$location", "MemberSvc", "CodeSvc", "$q", function ($scope, $rootScope, $window, $location, MemberSvc, CodeSvc, $q) {
      var init;
      $rootScope.backdrop = "backdrop";
      init = function () {
        return selectMenu(1);
      };
      init();

      $q.all([MemberSvc.getMemberList()])
        .then(function (result) {
          partList = result[0].data
          $scope.partList = partList
          return $rootScope.backdrop = void 0
        });

      $scope.detail = function (memberId) {
        return $location.path("/member/view/" + memberId)
      };

      return $scope.regist = function () {
        return $location.path("/member/regist");
      };
    }
  ]);

  angularModule.controller("memberKindCtrl", [
    "$scope", "$rootScope", "$window", "$location", "MemberSvc", "CodeSvc", "$q", function ($scope, $rootScope, $window, $location, MemberSvc, CodeSvc, $q) {
      var init;
      $rootScope.backdrop = "backdrop";
      init = function () {
        return selectMenu(2);
      };
      init();

      dataTypes = [
        "이번달 생일자",
        "출석율 순",
        "장기 결석자",
        "최근 결석자",
        "세례 대상자",
        "학생 명단",
        "선생님 명단"
      ]

      $q.all([
        CodeSvc.getCodeList(),
        MemberSvc.getBirthDayMemberList(),
        MemberSvc.getAttributeRatio(),
        MemberSvc.getLatestAbsenteeList(),
        MemberSvc.getLongAbsenteeList(),
        MemberSvc.getBaptismList(),
        MemberSvc.getNameSortedMemberList(),
        MemberSvc.getTeacherList()
      ])
        .then(function (resultArray) {

          dataList = [];
          code = resultArray[0].data;
          index = 0;

          dataTypes.map(function (dataType) {

            data = {};
            data.title = dataType;
            list = resultArray[index + 1].data;

            data.list = list.map(function (member) {
              member.isAttendence = false
              if (index==1){
                ATTRIBUTE_RULE.map(function(rule) {	
                  if(member.att_ratio <= rule.max && member.att_ratio >= rule.min){
                    member.color = rule.color
                  }
                  member.BIRTHDAY =  member.att_ratio + "% (" + member.att_count + "/"+  member.weeks + ")"
                  member.isAttendence = true
                })
              }
              else if (index == 4){
                code.baptismList.forEach(function (code) {
                  if (member.BAPTISM_CD == code.CODE_ID)
                    member.BIRTHDAY = code.NAME;
                })
              }
              return member;
            });
            dataList[index] = data;
            index++;
          });

          $scope.dataList = dataList;
          $scope.code = code;

          return $rootScope.backdrop = void 0;
        });

      $scope.detail = function (memberId) {
        return $location.path("/member/view/" + memberId).search({});
      };

      $scope.downLoadExcel = function() {
        console.log("ASDAS")
        return MemberSvc.downLoadExcel().success(function(data) {
          return $.notify("저장되었습니다.");
        });
      };

      return $scope.regist = function () {
        return $location.path("/member/regist");
      };
    }
  ]);

  angularModule.controller("MemberDetailCtrl", [
    "$scope", "$rootScope", "$window", "$routeParams", "MemberSvc", "$location", "CodeSvc", "$q", "Upload", function ($scope, $rootScope, $window, $routeParams, MemberSvc, $location, CodeSvc, $q, Upload) {

      $rootScope.backdrop = "backdrop";

      $q.all([MemberSvc.getDetail($routeParams.memberId), MemberSvc.getAttendances($routeParams.memberId), CodeSvc.getCodeList()])
        .then(function (resultArray) {

          member = resultArray[0].data;
          $scope.attMonthList = getAttMonthList(member.attMonthList);

          var newArray = []          
          resultArray[1].data.map(function (attendnce) {
            mouth = parseInt(attendnce.WORSHIP_DT.substr(0, 2));
            if (newArray[mouth] == undefined) {
              newArray[mouth] = {};
              newArray[mouth].name = mouth + " 월";
            }
          })

          $scope.code = resultArray[2].data;

          $scope.code.partList.forEach(function (part) {
            if (member.PART_CD == part.PART_CD)
              member.PART_NAME = part.PART_NAME;
          })

          $scope.code.baptismList.forEach(function (code) {
            if (member.BAPTISM_CD == code.CODE_ID)
              member.BAPTISM_NAME = code.NAME;
          })

          $scope.code.genderList.forEach(function (code) {
            if (member.GENDER_CD == code.CODE_ID)
              member.GENDER_NAME = code.NAME;
          })

          $scope.code.statusList.forEach(function (code) {
            if (member.STATUS_CD == code.CODE_ID)
              member.STATUS_NAME = code.NAME;
          })

          $scope.enableDelete = 0
          $scope.studentView = 0

          if ($rootScope && $rootScope.globals && $rootScope.globals.currentUser && $rootScope.globals.currentUser.authtype == "admin") {
            $scope.enableDelete = 1
          }
          if ($rootScope && $rootScope.globals && $rootScope.globals.currentUser) {
            $scope.part_type = $rootScope.globals.currentUser.username;
          }

          member.PHOTO_URL = (member.PHOTO == 0) ? "blank.png" : member.PHOTO + "?" + (+new Date());
          if(member.MEMBER_TYPE == 1)
            $scope.studentView = 1

          $("#BIRTHDAY").datetimepicker({ format: 'YYYY-MM-DD' }).data('DateTimePicker').date(new Date(2002, 6, 1));
          $("#BIRTHDAY").on("dp.change", function () {
            $scope.member.BIRTHDAY = $("#BIRTHDAY").val();
          });

          $scope.member = member;

          if (!$scope.member) {
            $location.path("/member");
          }

          return $rootScope.backdrop = void 0;
        });


      $scope.resize = resize;
      $scope.gotoMemberList = function () {
        return $location.path("/member");
      };

      // upload on file select or drop
      $scope.upload = function (file) {
        Upload.upload({
          url: '/api/member/uploadPhoto/' + $routeParams.memberId,
          data: { file: file }
        }).then(function (resp) {
          console.log('Success upload images')
          console.log(resp.data);
          document.getElementById('member_photo').src = "/photo/resize/" + resp.data + "?" + (+new Date())
          $scope.member.PHOTO = resp.data;
          console.log($scope.member.PHOTO);

        }, function (resp) {
          console.log('Error status: ' + resp.status);
        }, function (evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          console.log('progress: ' + progressPercentage + '% ');
        });
      };

      $scope.delete = function () {
        return MemberSvc.deleteMember($routeParams.memberId).success(function (data) {
          console.log(data);
          $rootScope.backdrop = void 0;
          $.notify("삭제되었습니다.");
          return $location.path("/member");
           
        });
      }

      $scope.save = function () {

        $rootScope.backdrop = "backdrop";
        console.log("update")
        return MemberSvc.save("update", $scope.member).success(function (data) {
          $rootScope.backdrop = void 0;
          $.notify("저장되었습니다.");
          return $location.path("/member");
        });

      };
    }
  ]);

  angularModule.controller("MemberRegistCtrl", [
    "$scope", "$rootScope", "$window", "MemberSvc", "$location", "CodeSvc", "$q", function ($scope, $rootScope, $window, MemberSvc, $location, CodeSvc, $q) {

      $rootScope.backdrop = "backdrop";
      var init = function () {
        return selectMenu(1);
      };
      init();
      $q.all([CodeSvc.getCodeList()]).then(function (resultArray) {
        $scope.code = resultArray[0].data;

        $rootScope.backdrop = void 0;
        $scope.member = new Object();
        $scope.member.GENDER_CD = 1;
        $scope.member.GENDER_NAME = "남";
        $scope.studentView = 1
      });

      $("#BIRTHDAY").datetimepicker({ format: 'YYYY-MM-DD' }).data('DateTimePicker').date(new Date(2002, 6, 1));
      $("#BIRTHDAY").on("dp.change", function () {
        $scope.member.BIRTHDAY = $("#BIRTHDAY").val();
      });

      $scope.resize = resize;
      $scope.gotoMemberList = function () {
        return $location.path("/member");
      };
      return $scope.save = function () {
        if ($scope.memberForm.$invalid) {
          return $.notify("이름 / 성별 / 소속반 / 출석여부를 입력해주세요.");
        } else {
          $rootScope.backdrop = "backdrop";
          console.log("insert")
          return MemberSvc.save("insert", $scope.member).success(function (data) {
            $rootScope.backdrop = void 0;
            $location.path("/member");
            return $.notify("저장되었습니다.");
          });
        }
      };
    }
  ]);


  function resize(obj) {
    var sTextarea = obj.currentTarget
    var bsize = 120

    var csize = (sTextarea.scrollHeight >= bsize) ? sTextarea.scrollHeight + "px" : bsize + "px";
    sTextarea.style.height = bsize + "px";
    sTextarea.style.height = csize;
  }

  window.getAttMonthList = function (list) {
    var elm, j, len, month, o, preMonth, result;
    if (!list || list.length === 0) {
      return null;
    }
    result = [];
    preMonth = "";
    o = null;
    for (j = 0, len = list.length; j < len; j++) {
      elm = list[j];
      month = elm.month;
      if (month !== preMonth || o === null) {
        o = {
          month: month,
          data: []
        };
        result.push(o);
      }
      o.data.push(list[i]);
      preMonth = month;
    }
    return result;
  };

}).call(this);
