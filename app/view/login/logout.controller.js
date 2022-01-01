(function () {
    'use strict';

    angular
        .module('myApp')
        .controller('LogoutController', LogoutController);

    LogoutController.$inject = ['$location', 'AuthenticationService', 'FlashService'];

    function LogoutController($location, AuthenticationService, FlashService) {
        var vm = this;
        console.log("SDf");
        // reset login status
        this.logout = function() {
            AuthenticationService.ClearCredentials();
            $.notify("로그아웃 되었습니다.");
            $location.path('/login');
        }

        this.logout();
    }

})();
