angular.module('app.controllers').
controller('allPlayersCtrl', function ($scope, dataService) {
    $scope.allPlayers = [];
    $scope.selectedPlayer = {};
    dataService.getPlayers().done(function (data) {
        $scope.allPlayers = data;
        $scope.$apply();
    })

    $scope.selectPlayer = function (player) {
        $scope.selectedPlayer = player;
    }
});