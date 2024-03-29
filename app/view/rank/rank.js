// Generated by CoffeeScript 1.10.0
(function() {
  var angularModule;

  angularModule = angular.module("myApp.rank", ["ngRoute"]);

  angularModule.config([
    "$routeProvider", function($routeProvider) {
      return $routeProvider.when("/rank", {
        templateUrl: 'view/rank/rank.html',
        controller: 'RankCtrl'
      });
    }
  ]);

  angularModule.factory("RankSvc", [
    "$http", function($http) {
      const PREFIX_API = "/api/rank"
      return {
        getRankList: $http.createGetRequestFn(PREFIX_API + "/list"),
      };
    }
  ]);

var config_pie = {
		type: 'pie',
		data: {
			datasets: [{
				data: [],
				backgroundColor: [					
					'#f67019',
					'#4dc9f6',
					'#00a950',
				],
				borderWidth: 1,
				label: '재적'
			},
			{
				data: [],
				backgroundColor: [					
					'#f67019',
					'#4dc9f6',
					'#00a950',
				],
				borderWidth: 1,
				label: '출석'
			}],
			labels: [
				'여자',
				'남자',
				'모름',
			]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			legend: {
					display: true,
					labels: {
							fontColor: 'rgb(255, 99, 132)'
					}
       },
			title: {
            display: true,
            text: '성별비 (큰원:제적기준. 작은원:출석기준)'
      },
		}
};

	var config_bar  = {
		type: 'bar',
		data: {
			datasets: [{
				data: [
				],
				backgroundColor: '#4dc9f6',
				borderWidth: 1,
				label: '재적'
			},
			{
				data: [
				],
				backgroundColor: '#f67019',
				borderWidth: 1,
				label: '출석'
			}],
			labels: [
			]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			title: {
					display: true,
					text: '재적기준 반별구성'
      },
			scales: {
					xAxes: [{
						display: true
					}],
					yAxes: [{
						display: true,
						ticks: {
							beginAtZero: true   // minimum value will be 0.
						}
					}]
			}
		}
};


  angularModule.controller("RankCtrl", [
    "$scope", "$rootScope", "RankSvc", function($scope, $rootScope, RankSvc) {
     init = function() {
        return selectMenu(4);
      };
     init();

		var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		var config = {
			type: 'line',
			data: {
				labels: [],
				datasets: [{
					label: '재적인원',
					backgroundColor: 'rgb(255, 99, 132)',
					data: [],
					fill: false,
				}, {
					label: '출석인원',
					fill: false,
					backgroundColor: 'rgb(54, 162, 235)',
					data: [],
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				elements: {
					line: {
						tension: 0, // disables bezier curves
					}
				},
				hover: {
					mode: 'nearest',
					intersect: true
				},
				scales: {
					xAxes: [{
						display: true
					}],
					yAxes: [{
						display: true,
						ticks: {
							beginAtZero: true   // minimum value will be 0.
						}
					}]
				}
			}
		};

		var ctx = document.getElementById('canvas').getContext('2d');
		var rank_total_gender = document.getElementById('rank_total_gender').getContext('2d');

		return RankSvc.getRankList().success(function(data) {
			member_data = data.member;

			config_pie.data.datasets[0].data=[];
			config_pie.data.datasets[1].data=[];
			config.data.datasets[0].data=[];
			config.data.datasets[1].data=[];
			config_bar.data.datasets[0].data=[];
			config_bar.data.datasets[1].data=[];
			config_bar.data.labels=[];
			
			member_data.map(function(item){
				if(item.MEMBER_TYPE == 1){
					config.data.labels.push(item.WORSHIP_DT.substr(5));
					config.data.datasets[0].data.push(item.total_count);
					config.data.datasets[1].data.push(item.attendanceCnt);
				}
			});

			data.total_gender.map(function(item){
				config_pie.data.datasets[0].data.push(item.c);
			});

			data.last_gender.map(function(item){
				config_pie.data.datasets[1].data.push(item.c);
			});
			
			data.total_part.map(function(item){

        data.part_list.map(function(part){
          if(part.PART_CD == item.i) config_bar.data.labels.push(part.PART_NAME);
        })

				config_bar.data.datasets[0].data.push(item.c);
			});
      
			data.last_part.map(function(item){
				config_bar.data.datasets[1].data.push(item.c);
			});


			window.myPie = new Chart(rank_total_gender, config_pie);
			//window.myPie2 = new Chart(rank_last_gender, config_pie2);

			window.myBar= new Chart(rank_total_part, config_bar);
			//window.myPie4 = new Chart(rank_last_part, config_pie4);

			window.myLine = new Chart(ctx, config);
			return $rootScope.backdrop = void 0;
		});
    }
  ]);

}).call(this);
