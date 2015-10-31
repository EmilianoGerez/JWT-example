angular.module('jwtApp')
    .controller('HomeCtrl', ['$scope', 'jwtHelper', 'store', '$http', function($scope, jwtHelper, store, $http) {
        var jwt = store.get('jwt');
        $scope.token = (jwt) ? jwt : 'Must be login!';
        $scope.decode = (jwt) ? jwtHelper.decodeToken(jwt) : "Token doesn't exist";

        $scope.secureApi = function() {
            $http({
                url: "http://localhost:3000/api/users/secure",
                method: "GET"
            }).then(function(response) {
                $scope.secureMessage = response.data.message;
            }, function(err) {
                $scope.secureMessage = err.data.message;
            });
        };

        $scope.adminApi = function() {
            $http({
                url: "http://localhost:3000/api/users/admin",
                method: "GET"
            }).then(function(response) {
                $scope.adminMessage = response.data.message;
            }, function(err) {
                $scope.adminMessage = err.data.message;
            });
        };
    }
    ]);