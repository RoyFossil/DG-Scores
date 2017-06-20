angular.module('app.controllers').
controller('gamesCtrl', function ($scope, $routeParams, dataService) {
    var gameUuids = $routeParams.uuids.split(',');
    $scope.games = [];
    for (var i = 0; i < gameUuids.length; i++) {
        dataService.getGame(gameUuids[i]).done(function (data) {
            $scope.games.push(data);
            $scope.$apply();
        });
    }
});