angular.module('app.controllers').
controller('dashboardCtrl', function ($scope, dataService) {
    $('#test').text("CONTROLLAAA");
    $scope.allPlayers = [];
    dataService.getPlayers().done(function (data) {
        $scope.allPlayers = data;
        $scope.$apply();
    })
});