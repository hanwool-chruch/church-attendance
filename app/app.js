// Generated by CoffeeScript 1.10.0
(function () {
  var angularModule, modules;

  modules = [
    "myApp.main",
    "myApp.member",
    "myApp.attendance",
    "myApp.rank",
    "myApp.calendar",
    "myApp.info",
    "myApp.part",
    "ngAnimate",
    "ngRoute",
    "ngResource",
    "ngCookies"
  ];

  angularModule = angular.module("myApp", modules).config(config).run(run);


  config.$inject = ['$routeProvider'];
  function config($routeProvider) {
    $routeProvider
      .when('/login', {
        controller: 'LoginController',
        templateUrl: 'view/login/login.view.html',
        controllerAs: 'vm'
      })

      .otherwise({ redirectTo: '/login' });
  }

  run.$inject = ['$rootScope', '$location', '$cookies', '$http'];


  function run($rootScope, $location, $cookies, $http) {
    $rootScope.globals = $cookies.getObject('globals') || {};

    if ($rootScope.globals.currentUser) {
      $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata;
      //$location.path('/main');
    }

    $http.createGetRequestFn = (url) => {
      http = $http;

      return function (id) {
        let get_url = url

        if (id != undefined)
          get_url = get_url + "/" + id

        return http({
          cache: false,
          url: get_url,
          data: {
            t: new Date().getMilliseconds()
          },
          method: "GET"
        });
      }
    }

    $http.createPostRequestFn = (url, data) => {
      http = $http;

      return function (body) {
        let post_url = url
        let now = { t: new Date().getMilliseconds() };

        if (body == undefined)
          body = {};

        return http({
          cache: false,
          url: post_url,
          data: Object.assign(now, body),
          method: "POST"
        });
      }
    }

    $http.createPutRequestFn = (url, data) => {
      http = $http;

      return function (body) {
        let post_url = url
        let now = { t: new Date().getMilliseconds() };

        if (body == undefined)
          body = {};

        return http({
          cache: false,
          url: post_url,
          data: Object.assign(now, body),
          method: "PUT"
        });
      }
    }

    $http.createDeleteRequestFn = (url) => {
      http = $http;

      return function (id) {
        let get_url = url

        if (id != undefined)
          get_url = get_url + "/" + id

        return http({
          cache: false,
          url: get_url,
          data: {
            t: new Date().getMilliseconds()
          },
          method: "DELETE"
        });
      }
    }

    $rootScope.$on('$locationChangeStart', function (event, next, current) {
      // redirect to login page if not logged in and trying to access a restricted page
      var restrictedPage = $.inArray($location.path(), ['/login', '/register']) === -1;
      var loggedIn = $rootScope.globals.currentUser;
      if (restrictedPage && !loggedIn) {
        $location.path('/login');
      }
    });

    $rootScope.$on("$routeChangeStart", function () {
      $rootScope.backdrop = void 0;
      if (document) {
        return document.body.scrollTop = 52;
      }
    });
  }

  angularModule.config([
    "$resourceProvider", function ($resourceProvider) {
      return $resourceProvider.defaults.stripTrailingSlashes = false;
    }
  ]);

  window.selectMenu = function (i) {
    $("#navbar li").removeClass("active");
    return $("#navbar li:eq(" + i + ")").addClass("active");
  };

  $(function () {
    $("#navbar li").click(function () {
      $("#navbar li").removeClass("active");
      return $(this).addClass("active");
    });
    return $(".navbar-brand").click(function () {
      if ($("#navbar").hasClass("in")) {
        $(".navbar-toggle:visible").click();
      }
      $("#navbar li").removeClass("active");
      return selectMenu(0);
    });
  });

  $(document).on("click", "#navbar[class='navbar-collapse collapse in'] li", function () {
    return $(".navbar-toggle:visible").click();
  });

}).call(this);