module.exports = function(config){
	config.set({

		basePath : './',

		files : [
			'app/bower_components/angular/angular.js',
			'app/bower_components/angular-route/angular-route.js',
			'app/bower_components/angular-resource/angular-resource.js',
			'app/bower_components/angular-mocks/angular-mocks.js',
			'app/bower_components/angular-animate/angular-animate.js',
			'app/bower_components/angular-socket-io/socket.js',
			'app/bower_components/socket.io-client/socket.io.js',
			'app/bower_components/angular-socket-io/mock/socket-io.js',
			'app/bower_components/moment/min/moment.min.js',
			'app/bower_components/moment/locale/ko.js',
			'app/bower_components/jquery/dist/jquery.js',
			'app/bower_components/bootstrap/dist/js/bootstrap.min.js',
			'app/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
			'app/bower_components/bootbox/bootbox.js',
			'app/app.js',
			'app/components/**/*.js',
			'app/view*/**/*.js'
		],

		autoWatch : true,

		frameworks: ['jasmine'],

		browsers : ['Chrome'],

		plugins : [
						'karma-chrome-launcher',
						'karma-firefox-launcher',
						'karma-jasmine',
						'karma-junit-reporter'
						],

		junitReporter : {
			outputFile: 'test_out/unit.xml',
			suite: 'unit'
		}

	});
};