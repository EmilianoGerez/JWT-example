//Articles service used for communicating with the articles REST endpoints
angular.module('user').factory('Users', ['$resource', function($resource) {

    var logout = $resource('api/users/logout/:id', {
        id: '@_id'
    });

    var search = $resource('api/users/search/:name', {
        name: '@name'
    });

    return {
        logout: logout,
        search: search
    };
}
]);