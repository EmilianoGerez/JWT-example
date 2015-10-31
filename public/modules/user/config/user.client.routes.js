angular.module('user')
    .config(['$stateProvider', function($stateProvider) {

        $stateProvider
            .state('signup', {
                url: '/signup',
                templateUrl: 'modules/user/views/signup.client.view.html'
            }).state('signin', {
            url: '/signin',
            templateUrl: 'modules/user/views/signin.client.view.html',
        }).state('secureview', {
            url: '/secureview',
            templateUrl: 'modules/user/views/secureview.client.view.html',
            data: {
                requiresLogin: true
            }
        });
    }])
    .run(function($rootScope, $location, store, jwtHelper) {
        $rootScope.$on('$stateChangeStart', function(e, to) {
            if (to.data && to.data.requiresLogin) {
                if (!store.get('jwt')) {
                    return $location.path('signin');
                }
            }
        });
    });