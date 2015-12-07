'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
	'myApp.main',
	'myApp.member',
	'myApp.att',
	'myApp.rank',
	'myApp.doc',
	'myApp.login',
	'myApp.version',
	'ngAnimate',
	'ngRoute',
	'ngResource'
]).
run(function($rootScope, $location, $websocket) {
	$rootScope.$on( "$routeChangeStart", function(event, next, current) {
		
		$rootScope.backdrop = undefined;
		
		if(document) {
			document.body.scrollTop = 52;
		}
	});
	
	var ws = $websocket.$new('ws://localhost:12345');
	
	ws.$on('$open', function () {
		console.log('Oh my gosh, websocket is really open! Fukken awesome!');

		ws.$emit('ping', 'hi listening websocket server'); // send a message to the websocket server

		var data = {
			level: 1,
			text: 'ngWebsocket rocks!',
			array: ['one', 'two', 'three'],
			nested: {
				level: 2,
				deeper: [{
					hell: 'yeah'
				}, {
					so: 'good'
				}]
			}
		};

		ws.$emit('pong', data);
	});

	ws.$on('pong', function (data) {
		console.log('The websocket server has sent the following data:');
		console.log(data);

		ws.$close();
	});

	ws.$on('$close', function () {
		console.log('Noooooooooou, I want to have more fun with ngWebsocket, damn it!');
	});
})
.config(['$resourceProvider', function($resourceProvider) {
	$resourceProvider.defaults.stripTrailingSlashes = false;
}])
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.otherwise({redirectTo: '/main'});
}]);

function selectMenu(i) {
	$('#navbar li').removeClass('active');
	$('#navbar li:eq('+i+')').addClass('active');
}

$(function() {
	
	/* 선택된 메뉴 활성화  */
	$('#navbar li').click(function() {
		$('#navbar li').removeClass('active');
		$(this).addClass('active');
	});
	
	/* 브랜드 선택시 홈 메뉴 활성화  */
	$('.navbar-brand').click(function() {
		
		if($('#navbar').hasClass('in')) {
			$('.navbar-toggle:visible').click();
		}
		
		$('#navbar li').removeClass('active');
		selectMenu(0);
	});
});

/* 메뉴 선택 후 메뉴접기 동작(모바일 모드에서만 동작하게 함) */
$( document ).on( "click", "#navbar[class='navbar-collapse collapse in'] li", function( e ) {
	$('.navbar-toggle:visible').click();
});