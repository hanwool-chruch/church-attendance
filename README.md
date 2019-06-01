
# 교회 교육부서 출석 관리 웹프로그램

이 프로젝트는 HTML5의 웹소켓을 이용하여 동시에 여러명이 출석체크를 진행할 수 있도록 설계되었습니다. Node.js, jQuery, AngularJS, Bootstrap 등의 프로그램들을 이용하였고, SPA(Single Page Application) 입니다.

## 데모
[http://jesus4u.co.kr/](http://jesus4u.co.kr/)

## 설치
### 프로젝트 내려받기
```
> git clone https://github.com/sangwoongLee/church-attendance.git
> cd church-attendance
```

### Mysql 테이블 생성
직접 준비한 mysql에 접속해서 `테이블 생성 스크립트` 실행
```
[생성 파일위치]
church-attendance/db/mysql/create_database.sql
```

### Mysql 접속정보 설정
```
[설정파일 위치]
/choirzion-demo/server/routes/index.js
```
```javascript
[접속정보 설정 예]
 var db_config = {
	host     : 'us-cdbr-iron-east-03.cleardb.net',
	user     : 'b884ba11ab5f27',
	password : '42d453a9',
	database: "heroku_08834d64f8b1271"
};
```

### 의존 라이브러리 설치
```
npm install
```

### 어플리케이션 실행
```
npm start
```
### 어플리케이션 접속
```
http://localhost:8000/
```

## Contact

For more information on choirzion-demo please email me.
email : litty17@naver.com

#### This project Forked the repo - https://github.com/yhzion/choirzion-demo.git  …
