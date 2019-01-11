angularModule = angular.module "myApp.member", ["ngRoute", "ngResource"]

angularModule.config ["$routeProvider", ($routeProvider) ->
  $routeProvider.when "/member",
    templateUrl: "view/member/member.html",
    controller: "MemberCtrl"
  .when "/member/view/:memberId",
    templateUrl: "view/member/memberDetail.html",
    controller: "MemberDetailCtrl"
  .when "/member/regist",
    templateUrl: "view/member/memberDetail.html",
    controller: "MemberRegistCtrl"
]

angularModule.factory "MemberSvc", ["$http", ($http) ->

  getMemberList : -> $http
    cache: false,
    url: "/rest/member",
    data:
      t:new Date().getMilliseconds(),
    method: "GET"

  getDetail : (id) -> $http
    cache: false,
    url: "/rest/member/"+id,
    data:
      t:new Date().getMilliseconds(),
    method: "GET"

  save : (method, member) ->

    switch method
      when "insert" then $http.post "/rest/member", member
      when "update" then $http.put "/rest/member", member

    $http.post("/rest/member", member)
]

angularModule.factory "CodeSvc", ["$http", ($http) ->
  getCodeList : -> $http
    cache: true,
    url: "/rest/codeList",
    data:
      t:new Date().getMilliseconds(),
    method: "GET"
]

angularModule.controller "MemberCtrl", ["$scope", "$rootScope", "$window", "$location", "MemberSvc", ($scope ,  $rootScope ,  $window ,  $location ,  MemberSvc) ->
  $rootScope.backdrop = "backdrop"
  init = -> selectMenu(1) # 메뉴 선택
  init()

  MemberSvc.getMemberList().success (data) ->
    $scope.memberList = data
    $rootScope.backdrop = undefined

  $scope.detail = (memberId) ->
    $location.path("/member/view/"+memberId).search({})

  $scope.regist = -> $location.path("/member/regist")
]

angularModule.controller "MemberDetailCtrl", ["$scope", "$rootScope", "$window", "$routeParams", "MemberSvc", "$location", "CodeSvc", "$q", ($scope ,  $rootScope ,  $window ,  $routeParams ,  MemberSvc ,  $location ,  CodeSvc ,  $q) ->

  $rootScope.backdrop = "backdrop"

  init = -> selectMenu(1) # 메뉴 선택
  init()

  $q.all([MemberSvc.getDetail($routeParams.memberId), CodeSvc.getCodeList()]).then (resultArray) ->
    $scope.member = resultArray[0].data.member
    $scope.attMonthList = getAttMonthList(resultArray[0].data.attMonthList)
    $scope.code = resultArray[1].data

    if(!$scope.member)
      $location.path "/member"

    $rootScope.backdrop = undefined

  # 대원 목록으로 이동 버튼
  $scope.gotoMemberList = -> $location.path("/member")

  # 대원정보 저장
  $scope.save = ->

    if($scope.memberForm.$invalid)
      $.notify "이름 혹은 핸드폰 전화번호를 형식에 맞게 입력해주세요."
    else
      $rootScope.backdrop = "backdrop"
      MemberSvc.save("update", $scope.member).success (data) ->
        $rootScope.backdrop = undefined
        $location.path("/member")
        $.notify "저장되었습니다."
]

angularModule.controller "MemberRegistCtrl", ["$scope", "$rootScope", "$window", "MemberSvc", "$location", "CodeSvc", "$q", ($scope ,  $rootScope ,  $window ,  MemberSvc ,  $location ,  CodeSvc ,  $q) ->

  $rootScope.backdrop = "backdrop"
  init = -> selectMenu(1) # 메뉴 선택
  init()

  $q.all([CodeSvc.getCodeList()]).then (resultArray) ->
    $scope.code = resultArray[0].data
    $rootScope.backdrop = undefined

    $scope.member = new Object()

    $scope.member.cPositionCd = $scope.code.cPositionList[0].C_POSITION_CD
    $scope.member.cPositionNm = $scope.code.cPositionList[0].C_POSITION_NM
    $scope.member.positionCd = $scope.code.positionList[$scope.code.positionList.length-1].POSITION_CD
    $scope.member.positionNm = $scope.code.positionList[$scope.code.positionList.length-1].POSITION_NM
    $scope.member.statusNm = $scope.code.statusList[0].STATUS_NM
    $scope.member.statusCd = $scope.code.statusList[0].STATUS_CD
    $scope.member.partNm = $scope.code.partList[0].PART_NM
    $scope.member.partCd = $scope.code.partList[0].PART_CD

  # 대원 목록으로 이동 버튼
  $scope.gotoMemberList = -> $location.path("/member")

  # 대원정보 저장
  $scope.save = ->
    if($scope.memberForm.$invalid)
      $.notify "이름 혹은 핸드폰 전화번호를 형식에 맞게 입력해주세요."
    else
      $rootScope.backdrop = "backdrop"
      MemberSvc.save("insert", $scope.member).success (data) ->
        $rootScope.backdrop = undefined
        $location.path("/member")
        $.notify "저장되었습니다."
]

window.getAttMonthList = (list) ->
  if(!list || list.length == 0)
    return null

  result = []

  preMonth = ""
  o = null

  for elm in list
    month = elm.month

    if(month != preMonth || o == null)
      o = { month : month, data : []}
      result.push o

    o.data.push(list[i])

    preMonth = month

  return result

