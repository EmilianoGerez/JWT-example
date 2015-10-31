// Init app configuration
var AppConfiguration = ( function() {
    var appName = 'jwtApp';
    var appDependecies = ['ngResource', 'ui.router', 'angular-jwt', 'angular-storage', 'ngMessages'];

    // Method for add new modules
    var registerModule = function(moduleName, moduleDependencies) {
        // Create module
        angular.module(moduleName, moduleDependencies || []);

        // Add the new module to the angular config file
        angular.module(appName).requires.push(moduleName);

    };

    return {
        appName: appName,
        appDependecies: appDependecies,
        registerModule: registerModule
    };

} )();