angular.module('app.controllers').
controller('dashboardCtrl', function ($scope, dataService, updateData) {
    $('#test').text("CONTROLLAAA");
    $scope.allPlayers = [];
    dataService.getPlayers().done(function (data) {
        $scope.allPlayers = data;
        $scope.$apply();
    });

    $scope.refreshData = function () {
        updateData.doIt();
    }

});