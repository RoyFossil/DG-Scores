﻿angular.module('app.services').factory('charts', function () {
    
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
            title: 'Scores',
            //this should not be hard coded (width and height)
            //it defaults to the size of the containing elt
            width: 1000,
            height: 500,
            pointSize: 4,
            hAxis: {
                title: 'Hole',
                minValue: 1,
                maxValue: gameData.gameHoles.length,
                gridlines: {
                    count: gameData.gameHoles.length
                }
            },
            vAxis: {
                title: 'Cumulative Score'
            }
        };

        var chart = new google.visualization.LineChart(elt);
        chart.draw(data, options);
    }


    return {
        scoresRelToParForGame: _scoresRelToParForGame
    }
});