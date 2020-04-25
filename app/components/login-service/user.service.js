(function () {
    'use strict';

    angular
        .module('myApp')
        .factory('UserService', UserService);

    UserService.$inject = ['$http'];
    function UserService($http) {
        var service = {};

        service.loginServer = loginServer;
        return service;

        function loginServer() {
            return $http.createPostRequestFn('/api/manager/login')({
                TITLE: title,
                WORSHIP_DT: WORSHIP_DT
                }).then(handleSuccess, handleError('Error getting all users'));
        }

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(error) {
            return function () {
                return { success: false, message: error };
            };
        }
    }

})();
