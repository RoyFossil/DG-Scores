angular.module('app.controllers').
controller('playerCtrl', function ($scope, $routeParams, dataService) {
    $scope.player = {};
    dataService.getPlayer($routeParams.id).done(function (data) {
        $scope.player = data;
        dataService.getNumGamesPlayed($scope.player.uuid).done(function (count) {
            $scope.numGamesPlayed = count;
            $scope.$apply();
        });
        
    })
});