'use strict';

angular.module('myApp.info.info-directive', [])

/* 앱 제목 디렉티브 */
.directive('appTitle', ['title', function(title) {
	return function(scope, elm, attrs) {
		elm.text(title);
	};
}])

/* 앱 저작권 디렉티브 */
.directive('appCopyright', ['copyright', function(copyright) {
	return function(scope, elm, attrs) {
		elm.text(copyright);
	};
}])

/* 환영 메세지 디렉티브 */
.directive('appWelcomeMessage', ['welcomeMessage', function(welcomeMessage) {	
	return function(scope, elm, attrs) {
		elm.html(welcomeMessage);
	};
}])

/* 메뉴명 디렉티브 */
.directive('appMenu', ['menu', function(menu) {
	return function(scope, elm, attrs) {
		if(attrs.appIcon) {
			elm.html('<i class="'+attrs.appIcon+'"></i> ' + menu[attrs.appMenu]);
		} else {
			elm.text(menu[attrs.appMenu]);
		}
	};
}])
;