angular.module('app.services').factory('charts', function () {
    
    google.charts.load('current', { 'packages': ['corechart'] });

    function _scoresRelToParForGame(elt, gameData) {
        if (elt instanceof jQuery) {
            elt = elt.get(0);
        }

        var data = new google.visualization.DataTable();
        data.addColumn('number', 'Hole');
        for (var i = 0; i < gameData.players.length; i++) {
            data.addColumn('number', gameData.players[i].name, gameData.players[i].gamePlayerUuid);
        }


        var holesPlayersAndCumulScores = [];
        // need to push rows that look like this...     [hole number, cumulative score for p1, cumulative score for p2, cumulative score for p3]
        //                                              [1, 0, -1, 2]
        //this only sucks because i need to match against gamePlayerUuids because scores are not necessarily in the same order. meh.. won't be too bad.

        //gotta loop through every hole, find the score for every gpUuid, and add it in the correct order. ezpz
        for (var i = 0; i < gameData.gameHoles.length; i++) {
            var gameHole = gameData.gameHoles[i];
            //start the array
            var aRow = [gameHole.hole];
            //start at 1 because we the first column is hole num, the rest are all names
            for (var j = 1; j < data.getNumberOfColumns() ; j++) {
                //this is the gpUuid of the player that we need the score for
                var gpUuid = data.getColumnId(j);
                
                var score = null;
                for (var k = 0; k < gameHole.scores.length; k++) {
                    if (gameHole.scores[k].gamePlayerUuid == gpUuid) {
                        score = gameHole.scores[k].scoreRelToPar;
                        break;
                    }
                }
                if (typeof(score) == 'undefined') {
                    aRow.push(null);
                } else {
                    aRow.push(score);
                }
            }
            //got all the data for that hole, push the hek out of it.
            holesPlayersAndCumulScores.push(aRow);
        }

        
        data.addRows(holesPlayersAndCumulScores);

        var options = {
            'title': 'Scores',
            'width': 1200,
            'height': 700
        };

        var chart = new google.visualization.LineChart(elt);
        chart.draw(data, options);
    }


    return {
        scoresRelToParForGame: _scoresRelToParForGame
    }
});