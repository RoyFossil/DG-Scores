angular.module('app.services').factory('charts', function () {
    
    google.charts.load('current', { 'packages': ['corechart', 'scatter'] });

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
                aRow.push(score);
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

    function _daysOfWeekForCourse(elt, courseData) {
        if (elt instanceof jQuery) {
            elt = elt.get(0);
        }

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Day of the Week');
        data.addColumn('number', 'Count');

        var daysOfWeekAndCount = [];

        //data.date = moment(parseInt(data.startedAt)).format("ddd, MMM D Y h:mm A");
        //sun=0, sat=6
        daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var allIndividualDays = courseData.map(x => moment(parseInt(x.startedAt)).day());
        var countedDaysOfWeek = [0,0,0,0,0,0,0];
        for (var i = 0; i < allIndividualDays.length; i++) {
            countedDaysOfWeek[allIndividualDays[i]]++;
        }

        for (var i = 0; i < 7; i++) {
            var row = [];
            row.push(daysOfTheWeek[i]);
            row.push(countedDaysOfWeek[i]);
            daysOfWeekAndCount.push(row);
        }

        data.addRows(daysOfWeekAndCount);

        var options = {
            title: 'Days of the Week',
            //this should not be hard coded (width and height)
            //it defaults to the size of the containing elt
            width: 1000,
            height: 500
        };

        var chart = new google.visualization.PieChart(elt);
        chart.draw(data, options);
    }

    function _scoresOverTimeForCourse(elt, courseScoresData) {
        if (elt instanceof jQuery) {
            elt = elt.get(0);
        }

        var data = new google.visualization.DataTable();
        data.addColumn('date', 'Date');
        data.addColumn('number', 'Score');

        for (var i = 0; i < courseScoresData.length; i++) {
            var aGame = courseScoresData[i];
            var aDate = new Date(parseInt(aGame.startedAt));
            for (var j = 0; j < aGame.players.length; j++) {
                var aPlayer = aGame.players[j];
                if (aPlayer.holesPlayed == aGame.gameHoles.length) {
                    data.addRow([aDate, aPlayer.scoreRelToPar]);
                }
            }
        }

        var options = {
            title: 'Scores',
            width: 1000,
            height: 600
        }

        var chart = new google.visualization.ScatterChart(elt);
        chart.draw(data, options);
    }

    function _holeDifficulty(elt, holesData) {
        if (elt instanceof jQuery) {
            elt = elt.get(0);
        }

        var data = new google.visualization.DataTable();
        data.addColumn('number', 'Hole');
        data.addColumn('number', 'Par');
        data.addColumn('number', 'Avg');
        data.addColumn('number', 'Scores');

        var allScores = {};
        //loop through each game
        for (var i = 0; i < holesData.length; i++) {
            //loop through each gameHole
            for (var j = 0; j < holesData[i].gameHoles.length; j++) {
                var aGameHole = holesData[i].gameHoles[j];
                //add par info.  This will, for each hole, make for a par entry for every game
                //it is possible that a par could have changed, so that might actually be good
                data.addRow([aGameHole.hole, aGameHole.par, null, null]);
                for (var k = 0; k < aGameHole.scores.length; k++) {
                    var aScore = aGameHole.scores[k];
                    //add an individual score
                    data.addRow([aGameHole.hole, null, null, aScore.score]);
                    if (allScores[aGameHole.hole]) {
                        allScores[aGameHole.hole].sumScores += aScore.score;
                        allScores[aGameHole.hole].count++;
                    } else {
                        allScores[aGameHole.hole] = {
                            sumScores: aScore.score,
                            count: 1
                        }
                    }
                }
            }
        }

        //get avg for each hole
        Object.keys(allScores).forEach(function (hole, index) {
            var avg = allScores[hole].sumScores / allScores[hole].count;
            data.addRow([parseInt(hole), null, avg, null]);
        });




        var options = {
            title: 'Hole scores',
            width: 1000,
            height: 600,
            series: {
                0: { pointShape: 'square', pointSize: 20 },  //par
                1: { pointShape: 'star', pointSize: 20 },  //avg
                2: { pointShape: 'circle' }   //scores
            }
        }

        var chart = new google.visualization.ScatterChart(elt);
        //var chart = new google.charts.Scatter(elt);
        chart.draw(data, options);
        //chart.draw(data, google.charts.Scatter.convertOptions(options));
    }

    return {
        scoresRelToParForGame: _scoresRelToParForGame,
        daysOfWeekForCourse: _daysOfWeekForCourse,
        scoresOverTimeForCourse: _scoresOverTimeForCourse,
        holeDifficulty: _holeDifficulty
    }
});