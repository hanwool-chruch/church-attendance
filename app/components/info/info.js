'use strict';

angular.module('myApp.info', [
	'myApp.info.info-directive'
])

/* 앱 이름 */
.value('title', '성가대 출석부')

/* 앱 저작권내용 */
.value('copyright', 'Copyright © 2016 @yhzion All right reserved.')

/* 환영 메세지 */
.value('welcomeMessage', '여러명과 동시에 실시간으로 출석체크가 가능합니다. 손쉬운 출석관리, 지금 시작해보세요.')

/* 메뉴명 */
.value('menu', {
	main   : '마법같은 출석관리',
	member : '대원관리',
	att    : '출석관리',
	rank   : '출석순위',
	doc    : '회의록',
	login  : '로그인'
})
;