// Generated by CoffeeScript 1.10.0
(function() {
  var angularModule;

  angularModule = angular.module("myApp.part", ["ngRoute"]);
  
  angularModule.config([
    "$routeProvider", function($routeProvider) {
      return $routeProvider.when("/part", {
        templateUrl: 'view/part/part.html',
        controller: 'PartCtrl'
      });
    }
  ]);

  angularModule.factory("PartSvc", [
    "$http", function($http) {
    const PREFIX_API = "/api/part"
    const MEMBER_PREFIX_API = "/api/member"
      return {
        getPartList: $http.createGetRequestFn(PREFIX_API + "/list"),
        updatePartName: function(part_cd, part_name) {
          return $http.createPostRequestFn(PREFIX_API + "/part_name")({
            PART_NAME: part_name,
            PART_CD: part_cd
          });
        },
        updateTeacherName: function(part_cd, teacher_name) {
          return $http.createPostRequestFn(PREFIX_API + "/teacher_name")({
            TEACHER_NAME: teacher_name,
            PART_CD: part_cd
          });
        },
        createPart: function(part_name, teacher_name, orderby_no) {
          return $http.createPutRequestFn(PREFIX_API)({
            TEACHER_NAME: teacher_name,
            PART_NAME: part_name, 
            ORDERBY_NO: orderby_no
          });
        },
        deletePart: function(part_cd) {
          return $http.createDeleteRequestFn(PREFIX_API)(part_cd);
        },       
        updatePart: function (member_id, part_cd) {
          return $http.createPostRequestFn(MEMBER_PREFIX_API + "/part")({
            MEMBER_ID: member_id,
            PART_CD: part_cd
          });
        },
      };
    }
  ]);

  angularModule.controller("PartCtrl", [
    "$scope", "$rootScope", "$location", "PartSvc","MemberSvc","CodeSvc", "$q", function($scope, $rootScope, $location, PartSvc, MemberSvc, CodeSvc, $q) {
    var events = []
    
    $scope.newPart = {
      PART_NAME : "",
      PART_TEACHER : ""
    }

    $scope.change = function(type, part, value) {

      if(type == "part_name") 
        return PartSvc.updatePartName(part, value).success(() => $rootScope.backdrop = void 0)
      
      if(type == "teacher_name") 
        return PartSvc.updateTeacherName(part, value).success(() => $rootScope.backdrop = void 0)
    };

    $scope.change_member = function (type, member_id, part_cd) {
      if (type == "part")
        return MemberSvc.updatePart(member_id, part_cd).success(() => $rootScope.backdrop = void 0)
    };

    $scope.detail = function (memberId) {
      return $location.path("/member/view/" + memberId)
    };


    $scope.create = function(part_name, teacher_name) {   
      return PartSvc.createPart(part_name, teacher_name, $scope.partList.length).success((part) => {
        $scope.partList.push(part)
        $scope.newPart = {
          PART_NAME : "",
          PART_TEACHER : ""
        }
        $rootScope.backdrop = void 0
      })
    };

    $scope.delete = function(part_cd) {
      return PartSvc.deletePart(part_cd).success((part) => {
        const idx = $scope.partList.findIndex((part) => {return part.PART_CD === part_cd}) // findIndex = find + indexOf
        if (idx > -1) $scope.partList.splice(idx, 1)
      })
    }

		return $q.all([
      CodeSvc.getCodeList(), 
      MemberSvc.needPartList(), 
      MemberSvc.needMoreInformationList(), 
    ]).then((resultArray) => {
      code = resultArray[0].data;
      $scope.partList = code.partList    
      
      index = 0;
      dataList = []

      dataTypes = [
        "반평성 필요",
        "추가 입력 필요"
      ]

      dataTypes.map(function (dataType) {

        data = {};
        data.title = dataType;
        list = resultArray[index + 1].data;

        data.list = list.map(function (member) {
          let moreInfomationText = ""
          if (index==0) member.needType = 'part';
          if (index==1) {
            member.needType = 'more';
            if(member.GENDER_CD == 3) moreInfomationText += "성별 "
            if(member.BIRTHDAY == '') moreInfomationText += "생일 "
            if(member.PHONE_NO == '' && member.MOTHER_PHONE == '' && member.FATHER_PHONE == '') moreInfomationText += "휴대폰 "
            member.more = (moreInfomationText += " 입력필요 ")
          }

          return member;
        });
        dataList[index] = data;
        index++;
      });

      $scope.dataList = dataList
      $scope.code = code;

			return $rootScope.backdrop = void 0;
		});
    }
  ]);

}).call(this);


