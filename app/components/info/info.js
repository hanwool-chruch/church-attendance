'use strict';

angular.module('myApp.info', [
	'myApp.info.info-directive'
])

/* 앱 이름 */
.constant('title', '성가대 출석부')

/* 앱 저작권내용 */
.constant('copyright', 'Copyright © 2016 @yhzion All right reserved.')

/* 환영 메세지 */
.constant('welcomeMessage', '이제 종이 출석부의 고통해서 벗어나세요. <strong>여러명과 동시</strong>에 스마트폰으로 <strong>실시간 출석체크</strong>가 가능합니다. <br/>손쉬운 출석관리, 지금 다같이 시작해보세요.')

/* 메뉴명 */
.constant('menu', {
	main   : '마법같은 성가대 출석관리',
	member : '대원관리',
	att    : '출석관리',
	rank   : '출석순위',
	doc    : '회의록',
	login  : '로그인'
})
;