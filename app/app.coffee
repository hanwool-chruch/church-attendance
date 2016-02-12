modules = [
   "myApp.main"
  ,"myApp.member"
  ,"myApp.att"
  ,"myApp.rank"
  ,"myApp.info"
  ,"ngAnimate"
  ,"ngRoute"
  ,"ngResource"
 #,"ngVersion"
 #,"ngLogin"
 #,"ngDoc"
]

angularModule = angular.module "myApp", modules

angularModule.run ($rootScope) ->
  $rootScope.$on "$routeChangeStart", ->
    $rootScope.backdrop = undefined;
    if document
      document.body.scrollTop = 52

angularModule.config ["$resourceProvider", ($resourceProvider) ->$resourceProvider.defaults.stripTrailingSlashes = false]

angularModule.config ["$routeProvider", ($routeProvider) ->$routeProvider.otherwise redirectTo: "/main"]

window.selectMenu = (i) ->
  $("#navbar li").removeClass "active"
  $("#navbar li:eq("+i+")").addClass "active"

# jQuery 준비 핸들러
$ ->
  # 선택된 메뉴 활성화
  $("#navbar li").click ->
    $("#navbar li").removeClass "active"
    $(this).addClass "active"

  # 브랜드 선택시 홈 메뉴 활성화
  $(".navbar-brand").click ->

    if $("#navbar").hasClass("in")
      $(".navbar-toggle:visible").click()

    $("#navbar li").removeClass "active"
    selectMenu 0

# 메뉴 선택 후 메뉴접기 동작(모바일 모드에서만 동작하게 함)
$( document ).on "click", "#navbar[class='navbar-collapse collapse in'] li", ->
  $(".navbar-toggle:visible").click()