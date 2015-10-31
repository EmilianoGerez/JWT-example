angular.module('user')
    .controller('UserController', ['$scope', '$location', 'Users', '$http', 'store', 'jwtHelper', function($scope, $location, Users, $http, store, jwtHelper) {
        $scope.user = {
            name: "",
            password: "",
            confirmPassword: ""
        };
        $scope.signup = function() {
            $http({
                url: 'http://localhost:3000/api/users/signup',
                method: 'POST',
                data: $scope.user
            }).then(function(response) {
                store.set('jwt', response.data.token);
                $location.path('/');
            }, function(err) {
                $scope.errMessage = err.data.message;
            });
        };

        $scope.signin = function() {
            $http({
                url: 'http://localhost:3000/api/users/signin',
                method: 'POST',
                data: $scope.user
            }).then(function(response) {
                var token = response.data.token;
                store.set('jwt', token);
                $location.path('/');
            }, function(err) {
                $scope.errMessage = err.data.message;
            });
        };

        $scope.isAuth = function() {
            var token = store.get('jwt');
            if (token) {
                $scope.payload = jwtHelper.decodeToken(token);
                return true;
            } else {
                return false;
            }
        };

        $scope.logout = function() {
            var token = store.get('jwt');
            var decoded = jwtHelper.decodeToken(token);
            Users.logout.get({
                id: decoded._id
            }, function() {
                store.remove('jwt');
            });
        };
    }]);


angular.module('user')
    .directive("compareTo", [function() {
        return {
            require: "ngModel",
            scope: {
                otherModelValue: "=compareTo"
            },
            link: function(scope, element, attributes, ngModel) {

                ngModel.$validators.compareTo = function(modelValue) {
                    return modelValue == scope.otherModelValue;
                };

                scope.$watch("otherModelValue", function() {
                    ngModel.$validate();
                });
            }
        };
    }]);

angular.module('user')
    .directive('recordAvailabilityValidator',
        ['$http', 'Users', function($http, Users) {

            return {
                require: 'ngModel',
                link: function(scope, element, attrs, ngModel) {
                    //var apiUrl = attrs.recordAvailabilityValidator;

                    function setAsLoading(bool) {
                        ngModel.$setValidity('recordLoading', !bool);
                    }

                    function setAsAvailable(bool) {
                        ngModel.$setValidity('recordAvailable', bool);
                    }

                    ngModel.$parsers.push(function(value) {
                        if (!value || value.length === 0) return;

                        setAsLoading(true);
                        setAsAvailable(false);

                        // using resource
                        var data = Users.search.get({
                            name: value
                        }, function() {
                            if (data.data === null) {
                                setAsLoading(false);
                                setAsAvailable(true);
                            }
                        });
                        return value;
                    });
                }
            };
        }]);