angular.module('app').config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('');
    $routeProvider.
    when('/', {
        templateUrl: 'views/dashboard.html',
        controller: 'dashboardCtrl'
    }).
	when('/allPlayers', {
	    templateUrl: 'views/allPlayers.html',
	    controller: 'allPlayersCtrl'
	}).
    when('/allCourses', {
        templateUrl: 'views/allCourses.html',
        controller: 'allCoursesCtrl'
    }).
    when('/course/:id', {
        templateUrl: 'views/course.html',
        controller: 'courseCtrl'
    }).
    when('/games/:uuids', {
        templateUrl: 'views/games.html',
        controller: 'gamesCtrl'
    }).
    when('/calendar', {
        templateUrl: 'views/calendar.html',
        controller: 'calendarCtrl'
    }).
    otherwise('/');
}]);