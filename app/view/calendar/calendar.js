// Generated by CoffeeScript 1.10.0
(function() {
  var angularModule;

  angularModule = angular.module("myApp.calendar", ["ngRoute"]);

  angularModule.config([
    "$routeProvider", function($routeProvider) {
      return $routeProvider.when("/calendar", {
        templateUrl: 'view/calendar/calendar.html',
        controller: 'CalendarCtrl'
      });
    }
  ]);

  angularModule.factory("CalendarSvc", [
    "$http", function($http) {
      return {
        getEventList: function() {
          return $http.get('/rest/calendar');
        }
      };
    }
  ]);

  angularModule.controller("CalendarCtrl", [
    "$scope", "$rootScope", "CalendarSvc", function($scope, $rootScope, CalendarSvc) {
		var events = [];

			

		return CalendarSvc.getEventList().success(function(event_list) {		
			
			event_list.member.map(function(event){
				event.color = '#257e4a';
				event.start = "2019-" + event.start.substr(5);
				events.push(event);			
			})

			event_list.worship.map(function(event){
				event.color = '#ff9f89';

				if(event.title=="")
					event.title = "주일예배"
				//event.start = "2019-" + event.start.substr(5);
				events.push(event);			
			})

			$('#calendar').fullCalendar({
				header: {
					left: 'prev,next today',
					center: 'title',
					right: 'month,basicWeek'
				},
				aspectRatio: 1,
				weekends: true,
				fixedWeekCount: false,
				businessHours: false, // display business hours
				defaultDate: new Date(),
				navLinks: false, // can click day/week names to navigate views
				editable: true,
				eventLimit: true, // allow "more" link when too many events
				events: events
			});

			return $rootScope.backdrop = void 0;
		});
    }
  ]);

}).call(this);
