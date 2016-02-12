angularModule = angular.module "myApp.att", ["ngRoute"]

angularModule.config ["$routeProvider", ($routeProvider) ->
  $routeProvider
  .when "/att",
    templateUrl: "view/att/att.html"
    controller: "AttCtrl"
  .when "/att/regist",
    templateUrl: "view/att/attRegist.html",
    controller: "AttRegistCtrl"
  .when "/att/:practiceDt/:practiceCd",
    templateUrl: "view/att/attDetail.html",
    controller: "AttDetailCtrl"
]

angularModule.factory "AttSvc", ["$http", ($http) ->
# 연습목록
  getAttList: (page) -> $http.get("/rest/att/list/#{page}?t=" + new Date())
# 연습정보 등록
  save: (pDt, pCd, musicInfo, etcMsg) -> $http.post("/rest/att/#{pDt}/#{pCd}", {musicInfo: musicInfo, etcMsg: etcMsg})
# 연습정보
  remove: (pDt, pCd) -> $http.delete("/rest/att/#{pDt}/#{pCd}")
# 연습정보 상세(출석정보 포함)
  getDetail: (pDt, pCd) -> $http.get("/rest/att/#{pDt}/#{pCd}?t=" + new Date())
# 연습곡 수정
  saveMusicInfo: (pDt, pCd, musicInfo) -> $http.put("/rest/att/#{pDt}/#{pCd}/musicInfo", {musicInfo: musicInfo})
# 메모 수정
  saveEtcMsg: (pDt, pCd, etcMsg) -> $http.put("/rest/att/#{pDt}/#{pCd}/etcMsg", {etcMsg: etcMsg})
# 출석체크
  select: (pDt, pCd, memberId, attYn) ->
    switch attYn
      when "Y" then $http.post("/rest/att/#{pDt}/#{pCd}/deselect", {memberId: memberId})
      when "N" then $http.post("/rest/att/#{pDt}/#{pCd}/select", {memberId: memberId})
# 마감 처리
  lockAtt: (pDt, pCd) -> $http.put("/rest/att/#{pDt}/#{pCd}/lockAtt")
# 마감 해제 처리
  unlockAtt: (pDt, pCd) -> $http.put("/rest/att/#{pDt}/#{pCd}/unlockAtt")
]

angularModule.factory "socket", ($rootScope) ->
  socket = io.connect()

  on: (eventName, callback) ->
    socket.on eventName, ->
      args = arguments
      $rootScope.$apply ->
        callback.apply socket, args
  emit: (eventName, data, callback) ->
    socket.emit eventName, data, ->
      args = arguments
      $rootScope.$apply ->
        if callback
          callback.apply socket, args
  removeAllListeners: ->
    socket.removeAllListeners()

angularModule.controller "AttCtrl",
  ['$scope', '$rootScope', 'AttSvc', '$location', 'socket', '$route',
    ( $scope ,  $rootScope ,  AttSvc ,  $location ,  socket ,  $route ) ->
# socket - remove all listeners
      $scope.$on "$destroy", ->
        socket.removeAllListeners()

      # 소켓-연습정보 목록 입장
      socket.emit "hallJoin"

      # 연습정보가 변경되었을때, 페이지 리프레시
      socket.on "refreshPage", (data) ->
        $route.reload()
        $.notify data

      # Backdrop 적용시 레이아웃 깨짐 방지 목업 div 엘리먼트 show
      $scope.mock = true

      $rootScope.backdrop = 'backdrop'

      init = ->
        selectMenu(2) # 메뉴 선택

      init()

      p = 2

      # 더보기
      $scope.more = ->
        $rootScope.backdrop = 'backdrop'

        AttSvc.getAttList(p).success (data) ->
          if(data != null && data.length > 0)
            if(data.length == 50) $scope.needMoreButton = true
            else $scope.needMoreButton = false

            for i in data
              $scope.attList.push data[i]

            p++

          $rootScope.backdrop = undefined

      # 연습일정 추가
      $scope.regist = -> $location.path "/att/regist"

      AttSvc.getAttList(1).success (data) ->
        if(data.length == 50)
          $scope.needMoreButton = true
        else
          $scope.needMoreButton = false

        $scope.attList = data
        $scope.mock = false
        $rootScope.backdrop = undefined

      # 상세정보 보기
      $scope.detail = (att) -> $location.path "/att/#{att.practiceDt}/#{att.practiceCd}"
  ]

angularModule.controller "AttRegistCtrl",
  ['$scope', '$rootScope', 'AttSvc', '$location', 'CodeSvc', '$q', 'socket',
    ( $scope ,  $rootScope ,  AttSvc ,  $location ,  CodeSvc ,  $q ,  socket ) ->

# socket - remove all listeners
      $scope.$on "$destroy", -> socket.removeAllListeners()
      $rootScope.backdrop = 'backdrop'

      init = -> selectMenu(2) # 메뉴 선택
      init()

      $ ->
        moment.locale "ko",
          week:
            dow: 1

        $('#datetimepicker').datetimepicker
          format: "L"
        .on "dp.change", (e) ->
          $scope.$apply ->
            $scope.att.practiceDt = moment(e.date).format "YYYY-MM-DD"

      # 코드리스트 불러오기
      $q.all([CodeSvc.getCodeList()]).then (resultArray) ->
        $scope.code = resultArray[0].data
        $rootScope.backdrop = undefined
        $scope.att = new Object()
        idx = 0
        if(moment().days() == 0 && new Date().getHours() <= 12)
          idx = 0 # 오전연습
        else if(moment().days() == 0 && new Date().getHours() > 12)
          idx = 1 # 오후연습
        else
          idx = 2 # 특별연습

        $scope.att.practiceCd = $scope.code.practiceList[idx].PRACTICE_CD
        $scope.att.practiceNm = $scope.code.practiceList[idx].PRACTICE_NM

        $scope.att.practiceDt = moment().format("YYYY-MM-DD")

        $rootScope.backdrop = undefined

        # 연습일정 목록으로 이동 버튼*/
        $scope.gotoAttList = -> $location.path('/att')

        # 저장 버튼
        $scope.save = (pDt, pCd, musicInfo, etcMsg) ->
          if($scope.attForm.$invalid)
            $.notify "날짜를 형식(YYYY-MM-DD)에 맞게 선택/입력해주세요."
          else
            $rootScope.backdrop = 'backdrop'
            AttSvc.save(pDt, pCd, musicInfo, etcMsg).success (data) ->
              if(data.result == 'success')
                socket.emit('addAtt') # 소켓-연습정보 추가 알림
                $location.path('/att')
              else if(data.result == 'dup')
                $.notify('이미 생성된 연습정보가 있습니다.')
                $location.path('/att')

              $rootScope.backdrop = undefined
  ]

angularModule.controller "AttDetailCtrl",
  ['$scope', '$rootScope', 'AttSvc', '$location', 'CodeSvc', '$q', '$routeParams', 'socket',
    ( $scope ,  $rootScope ,  AttSvc ,  $location ,  CodeSvc ,  $q ,  $routeParams ,  socket ) ->

      $rootScope.backdrop = 'backdrop'

      init = -> selectMenu(2) # 메뉴 선택
      init()

      # socket - remove all listeners
      $scope.$on '$destroy', ->
        socket.removeAllListeners()

      # 소켓-연습 상세정보 입장
      socket.emit "join", $routeParams.practiceDt + $routeParams.practiceCd

      # 연습곡 정보 갱신
      socket.on "replaceMusicInfo", (data) ->
        $scope.att.musicInfo = data
        $.notify "연습곡 정보가 갱신되었습니다."

      # 연습정보 목록으로 이동
      socket.on "backToList", ->
        $.notify "연습정보가 삭제되었습니다."
        $location.path "/att"

      # 연습정보가 변경되었을때, 페이지 리프레시
      socket.on "refreshPage", (data) ->
        $rootScope.backdrop = "backdrop"
        $.notify(data)
        attDataLoad()

      # 연습곡 정보 갱신
      socket.on "replaceEtcMsg", (data) ->
        $scope.att.etcMsg = data
        $.notify "메모가 갱신되었습니다."

      # 출석체크
      socket.on "select", (data) ->
        $scope.sList.concat(
          $scope.aList).concat(
          $scope.tList).concat(
          $scope.bList).concat(
          $scope.eList).concat(
          $scope.hList).concat(
          $scope.xList).forEach (m) -> if(m.memberId == data.memberId)
            if(data.attYn == 'Y')
              m.attYn = "N"
            else
              m.attYn = "Y"
            return false

      attDataLoad = ->
        $q.all [CodeSvc.getCodeList(), AttSvc.getDetail $routeParams.practiceDt, $routeParams.practiceCd]
        .then (resultArray) ->
          $scope.code = resultArray[0].data

          $scope.att = resultArray[1].data.attInfo
          $scope.sList = resultArray[1].data.s
          $scope.aList = resultArray[1].data.a
          $scope.tList = resultArray[1].data.t
          $scope.bList = resultArray[1].data.b
          $scope.eList = resultArray[1].data.e
          $scope.hList = resultArray[1].data.h
          $scope.xList = resultArray[1].data.x

          if(!$scope.att)
            $.notify "존재하지 않는 연습정보입니다."
            $location.path "/att"

          $rootScope.backdrop = undefined

      attDataLoad()

      # 연습일정 목록으로 이동 버튼
      $scope.gotoAttList = -> $location.path "/att"

      # 연습일정 삭제
      $scope.remove = (pDt, pCd) ->
        bootbox.dialog
          message: "연습정보 및 출석정보를 정말로 삭제하시겠습니까?",
          title: "<i class='ion-android-alert'></i> 삭제 확인",
          buttons:
            danger:
              label: "삭제",
              className: "btn-danger",
              callback: ->
                $rootScope.backdrop = 'backdrop'
                AttSvc.remove(pDt, pCd).success (data) ->
                  $rootScope.backdrop = undefined
                  $location.path "/att"

                  # 소켓-연습정보 삭제 알림
                  socket.emit "removeAtt"
            main:
              label: "취소",
              className: "btn-default",
              callback: ->

        return true

      # 연습곡 저장
      $scope.saveMusicInfo = (pDt, pCd, musicInfo) ->
        $rootScope.backdrop = 'backdrop'
        AttSvc.saveMusicInfo(pDt, pCd, musicInfo).success (data) ->
          if(data.result == 'success')
            socket.emit "refreshMusicInfo", musicInfo
          else
            $.notify "'저장에 실패하였습니다."

          $rootScope.backdrop = undefined

      # 메모 저장
      $scope.saveEtcMsg = (pDt, pCd, etcMsg) ->
        $rootScope.backdrop = 'backdrop'
        AttSvc.saveEtcMsg(pDt, pCd, etcMsg).success (data) ->
          if(data.result == 'success')
            socket.emit "refreshEtcMsg", etcMsg
          else
            $.notify "저장에 실패하였습니다."

          $rootScope.backdrop = undefined

      # 마감
      $scope.lockAtt = (pDt, pCd) ->
        bootbox.dialog
          message: "연습정보 및 출석정보를 정말로 마감 하시겠습니까? 마감된 연습정보는 수정하실 수 없습니다.",
          title: "<i class='ion-android-alert'></i> 마감 확인",
          buttons:
            danger:
              label: "마감",
              className: "btn-success",
              callback: ->
                $rootScope.backdrop = 'backdrop'
                AttSvc.lockAtt(pDt, pCd).success (data) ->
                  $rootScope.backdrop = undefined
                  # 소켓-마감 알림
                  socket.emit "closeAtt"
            main:
              label: "취소",
              className: "btn-default",
              callback: ->

        return true

      # 마감 해제
      $scope.unlockAtt = (pDt, pCd) ->
        bootbox.dialog
          message: "연습정보 및 출석정보를 정말로 마감 해제 하시겠습니까?",
          title: "<i class='ion-android-alert'></i> 마감 해제 확인",
          buttons:
            danger:
              label: "마감 해제",
              className: "btn-success",
              callback: ->
                $rootScope.backdrop = 'backdrop'
                AttSvc.unlockAtt(pDt, pCd).success (data) ->
                  $rootScope.backdrop = undefined
                  # 소켓-마감 해제 알림
                  socket.emit "uncloseAtt"
            main:
              label: "취소",
              className: "btn-default",
              callback: ->

        return true

      # 출석체크/해제
      $scope.select = (pDt, pCd, memberId, lockYn, attYn, partCd) ->
        if(lockYn == 'N')
          $rootScope.backdrop = 'backdrop'
          AttSvc.select(pDt, pCd, memberId, attYn).success (data) ->
            if(data.result == 'success')
              params = new Object()
              params.pDt = pDt
              params.pCd = pCd
              params.memberId = memberId
              params.attYn = attYn

              socket.emit "select", params
            else
              $.notify('서버 오류가 발생하였습니다. 잠시 후 다시 시도 해주시기바랍니다.')

            $rootScope.backdrop = undefined
  ]