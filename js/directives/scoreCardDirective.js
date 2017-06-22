angular.module('app.directives').directive('scoreCard', function () {
    return {
        restrict: 'E',
        scope: {
            game: '='
        },
        templateUrl: 'js/directives/templates/scoreCardDirective.html',
        link: function (scope, element, attrs) {
            scope.holeScores = [];

            //gotta loop through every hole, find the score for every gpUuid, and add it in the correct order. ezpz
            for (var i = 0; i < scope.game.gameHoles.length; i++) {
                var gameHole = scope.game.gameHoles[i];
                //start the array
                var aRow = [];
                //start at 1 because we the first column is hole num, the rest are all names
                for (var j = 0; j < scope.game.players.length; j++) {
                    //this is the gpUuid of the player that we need the score for
                    var gpUuid = scope.game.players[j].gamePlayerUuid;

                    var score = 0;
                    var formatted = "";
                    for (var k = 0; k < gameHole.scores.length; k++) {
                        if (gameHole.scores[k].gamePlayerUuid == gpUuid) {
                            score = gameHole.scores[k].score;
                            formatted = gameHole.scores[k].formattedScoreRelToPar;
                            break;
                        }
                    }
                    aRow.push({
                        score: score,
                        formattedScoreRelToPar: formatted,
                        par: gameHole.par
                    });
                }
                //got all the data for that hole, push the hek out of it.
                scope.holeScores.push(aRow);
            }

        }
    }
})