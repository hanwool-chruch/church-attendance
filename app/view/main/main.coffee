angularModule = angular.module('myApp.main', [ 'ngRoute' ])

angularModule.config [ '$routeProvider', ($routeProvider) ->
  $routeProvider.when '/main',
    templateUrl : 'view/main/main.html',
    controller : 'MainCtrl'
]

angularModule.controller "MainCtrl", ->
  init = ->
    selectMenu(0); #메뉴 선택
  init()

  if(document)
    document.body.scrollTop = 0
