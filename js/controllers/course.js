angular.module('app.controllers').
controller('courseCtrl', function ($scope, $routeParams, dataService) {
    $scope.course = {};
    dataService.getCourse($routeParams.id).done(function (data) {
        $scope.course = data;
        $scope.$apply();
    })
});