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
run(function($rootScope, $location, socket) {
	
	$rootScope.$on( "$routeChangeStart", function(event, next, current) {
		
		$rootScope.backdrop = undefined;
		
		if(document) {
			document.body.scrollTop = 52;
		}
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