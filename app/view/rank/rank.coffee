angularModule = angular.module "myApp.rank", ["ngRoute"]

angularModule.config ["$routeProvider", ($routeProvider) ->
  $routeProvider.when "/rank",
    templateUrl: 'view/rank/rank.html',
    controller: 'RankCtrl'
]

angularModule.factory "RankSvc", ["$http", ($http) ->
# 출석순위 목록
  getRankList : ->
    $http.get('/rest/rank?t='+new Date())
]

angularModule.controller "RankCtrl", [ "$scope", "$rootScope", "RankSvc", ($scope ,  $rootScope ,  RankSvc) ->
  init = ->
    selectMenu(3) # 메뉴 선택
  init()

  # Backdrop 적용시 레이아웃 깨짐 방지 목업 div 엘리먼트 show
  $scope.mock = true

# 조회기간 구하기
  curDate = new Date()
  curYear = curDate.getFullYear()
  curMonth = (curDate.getMonth()+1)

  if(curMonth == 12)
    $scope.startDt = curYear + "-12-01"
    $scope.endDt = (curYear+1) + "-11-30"
  else
    $scope.startDt = (curYear-1) + "-12-01"
    $scope.endDt = (curYear) + "-11-30"

  $rootScope.backdrop = 'backdrop'

  RankSvc.getRankList().success (data) ->

    $scope.rankList = data
    prevAmCnt=0
    prevPmCnt=0
    prevSpCnt=0
    rankNo=1

    $scope.rankList.forEach (rank) ->

      if(rank.amCnt < prevAmCnt)
          ++rankNo
      else if(rank.pmCnt < prevPmCnt)
        ++rankNo
      else if(rank.spCnt < prevSpCnt)
        ++rankNo

      rank.rankNo = rankNo

      prevAmCnt = rank.amCnt
      prevPmCnt = rank.pmCnt
      prevSpCnt = rank.spCnt

    # Backdrop 적용시 레이아웃 깨짐 방지 목업 div 엘리먼트 show
    $scope.mock = false
    $rootScope.backdrop = undefined
]