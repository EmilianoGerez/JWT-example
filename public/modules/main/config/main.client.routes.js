angular.module('jwtApp').config(['$stateProvider', '$urlRouterProvider', 'jwtInterceptorProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, jwtInterceptorProvider, $httpProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/');

    // get token to local storage and set on the headers
    jwtInterceptorProvider.tokenGetter = ['jwtHelper', '$http', 'store', '$state', '$rootScope', function(jwtHelper, $http, store, $state, $rootScope) {
        var idToken = store.get('jwt');
        try {
            if (jwtHelper.isTokenExpired(idToken)) {
                // This is a promise of a JWT id_token
                return $http({
                    url: 'http://localhost:3000/api/users/refresh',
                    // This makes it so that this request doesn't send the JWT
                    skipAuthorization: true,
                    method: 'POST',
                    data: {
                        token: idToken
                    }
                }).then(function(response) {
                    var id_token = response.data.token;
                    store.set('jwt', id_token);
                    return id_token;
                }, function(err) {
                    store.remove('jwt');
                    $state.go('signin');
                    return false;
                });
            } else {
                return idToken;
            }
        } catch ( err ) {
            store.remove('jwt');
            return false;
        }
    }];
    $httpProvider.interceptors.push('jwtInterceptor');

    // Home state routing
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'modules/main/views/home.client.view.html'
    });
}
]);