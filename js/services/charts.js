angular.module('app.services').factory('charts', ['gameManip', function (gameManip) {
    
    google.charts.load('current', { 'packages': ['corechart', 'scatter'] });

    //line chart showing players scores over the course of a game
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

    //pie chart showing percent played on each day of the week
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

    //scatter chart with a point at each finished game score for a course
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

        //so the trendline idea is dope, and for now it looks good for most courses, but down the line it wouldn't make much sense,
        //at least on a course basis.  per person, it would be great all the time, as we assume people get better overtime

        var options = {
            title: 'Scores',
            width: 1000,
            height: 600/*,      
            trendlines: {
                0: {
                    type: 'exponential'         
                }
            }*/
        }

        var chart = new google.visualization.ScatterChart(elt);
        chart.draw(data, options);
    }

    //scatter chart with a point at each finished game score for a player at a course (or at all courses)
    function _scoresOverTimeForPlayerAtCourse(elt, gameData, playerUuid, courseUuid) {
        if (elt instanceof jQuery) {
            elt = elt.get(0);
        }

        var data = new google.visualization.DataTable();
        data.addColumn('date', 'Date');
        data.addColumn('number', 'Score');

        for (var i = 0; i < gameData.length; i++) {
            var aGame = gameData[i];
            if (aGame.course.uuid == courseUuid || courseUuid == 0) {
                var aDate = new Date(parseInt(aGame.startedAt));
                for (var j = 0; j < aGame.players.length; j++) {
                    var aPlayer = aGame.players[j];
                    if (aPlayer.uuid == playerUuid && aPlayer.holesPlayed == aGame.gameHoles.length) {
                        data.addRow([aDate, aPlayer.scoreRelToPar]);
                    }
                }
            }
        }

        //so the trendline idea is dope, and for now it looks good for most courses, but down the line it wouldn't make much sense,
        //at least on a course basis.  per person, it would be great all the time, as we assume people get better overtime

        var options = {
            title: 'Scores',
            width: 1000,
            height: 600,      
            trendlines: {
                0: {
                    type: 'exponential'         
                }
            }
        }

        var chart = new google.visualization.ScatterChart(elt);
        chart.draw(data, options);
    }

    //scatter chart of par, avg, and every score at each whole for a course
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

    //pie chart for courses played
    function _coursesPlayedCount(elt, courseData) {
        if (elt instanceof jQuery) {
            elt = elt.get(0);
        }

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Course');
        data.addColumn('number', 'Count');

        courseData.sort(function (a, b) {
            return b.count - a.count;
        });

        for (var i = 0; i < courseData.length; i++) {
            data.addRow([courseData[i].name, courseData[i].count]);
        }

        var options = {
            title: 'Course Play Count',
            pieSliceText: 'value',
            //this should not be hard coded (width and height)
            //it defaults to the size of the containing elt
            width: 1000,
            height: 500,
            sliceVisibilityThreshold: .02
        };

        var chart = new google.visualization.PieChart(elt);
        chart.draw(data, options);
    }

    //pie chart showing number of games played with X number of people
    function _numPeopleInGame(elt, gameData) {
        if (elt instanceof jQuery) {
            elt = elt.get(0);
        }

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Number of Players');
        data.addColumn('number', 'Count');

        var numPlayersTally = {};

        for (var i = 0; i < gameData.length; i++) {
            var numPlayers = gameData[i].players.length;
            if (numPlayersTally[numPlayers]) {
                numPlayersTally[numPlayers]++;
            } else {
                numPlayersTally[numPlayers] = 1;
            }
        }

        var arrOfNumPlayers = Object.keys(numPlayersTally).map(x => parseInt(x)).sort();

        for (var i = 0; i < arrOfNumPlayers.length; i++) {
            var pString = arrOfNumPlayers[i] == 1 ? " player" : " players";
            data.addRow([arrOfNumPlayers[i].toString() + pString, numPlayersTally[arrOfNumPlayers[i]]]);
        }


        var options = {
            title: 'Games with X Number of Players (including self)',
            pieSliceText: 'value',
            //this should not be hard coded (width and height)
            //it defaults to the size of the containing elt
            width: 1000,
            height: 500
            //sliceVisibilityThreshold: .03
        };

        var chart = new google.visualization.BarChart(elt);
        chart.draw(data, options);
    }

    //pie chart showing number of games played with each person
    function _playersPlayedWith(elt, gameData, thePlayerUuid) {
        if (elt instanceof jQuery) {
            elt = elt.get(0);
        }

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Player');
        data.addColumn('number', 'Games Played');

        var playersTally = {};

        for (var i = 0; i < gameData.length; i++) {
            for (var j = 0; j < gameData[i].players.length; j++) {
                var playerUuid = gameData[i].players[j].uuid;
                if (playerUuid != thePlayerUuid) {
                    if (playersTally[playerUuid]) {
                        playersTally[playerUuid].count++;
                    } else {
                        playersTally[playerUuid] = {
                            count: 1,
                            name: gameData[i].players[j].name
                        };
                    }
                }
            }
        }

        var arrPlayerUuids = Object.keys(playersTally).sort(function (a, b) {
            return playersTally[b].count - playersTally[a].count;
        });

        for (var i = 0; i < arrPlayerUuids.length; i++) {
            data.addRow([playersTally[arrPlayerUuids[i]].name, playersTally[arrPlayerUuids[i]].count]);
        }


        var options = {
            title: 'Games Played With Player',
            pieSliceText: 'value',
            //this should not be hard coded (width and height)
            //it defaults to the size of the containing elt
            width: 1000,
            height: 800/*,
            sliceVisibilityThreshold: .01*/
        };

        var chart = new google.visualization.BarChart(elt);
        chart.draw(data, options);
    }

    function getSliceColorOption(scoreName) {
        switch (scoreName) {
            case "Ace":
                return { color: 'deeppink' };
            case "Birdie":
                return { color: 'dodgerblue' };
            case "Par":
                return { color: 'limegreen' };
            case "Bogey":
                return { color: '#5BD75B' };
            case "Double Bogey":
                return { color: '#84E184' };
            case "Triple Bogey":
                return { color: '#ADEBAD' };
            case "4+ over":
                return { color: 'lightgrey' };
            default:
                return {};
        }
    }

    //pie chart for bird, par, boge blah
    function _scoreBreakdownForPlayerAtCourse(elt, gameData, playerUuid, courseUuid) {
        if (elt instanceof jQuery) {
            elt = elt.get(0);
        }

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Score');
        data.addColumn('number', 'Score');

        var scoreNamesTally = {};

        for (var i = 0; i < gameData.length; i++) {
            //loop through all games
            var aGame = gameData[i];
            if (aGame.course.uuid == courseUuid || courseUuid == 0) {
                //only tally if its at the selected course, or all courses is selected

                //get gamePlayerUuid for each game
                var gamePlayerUuid;
                for (var j = 0; j < aGame.players.length; j++) {
                    if (aGame.players[j].uuid == playerUuid) {
                        gamePlayerUuid = aGame.players[j].gamePlayerUuid;
                    }
                }

                for (var j = 0; j < aGame.gameHoles.length; j++) {
                    var aGameHole = aGame.gameHoles[j];
                    for (var k = 0; k < aGameHole.scores.length; k++) {
                        var aScore = aGameHole.scores[k];
                        if (aScore.gamePlayerUuid == gamePlayerUuid) {
                            //only pull in scores for that player
                            var scoreName = gameManip.getScoreName(aGameHole.par, aScore.score);
                            if (scoreNamesTally[scoreName]) {
                                scoreNamesTally[scoreName]++;
                            } else {
                                scoreNamesTally[scoreName] = 1;
                            }
                        }
                    }
                }
            }
        }

        var names = ["Ace", "Condor", "Albatross", "Eagle", "Birdie", "Par", "Bogey", "Double Bogey", "Triple Bogey", "4+ over"];
        var sliceCount = 0;
        var slicesOptions = [];
        for (var i = 0; i < names.length; i++) {
            if (scoreNamesTally[names[i]]) {
                data.addRow([names[i], scoreNamesTally[names[i]]]);
                sliceCount++;
                slicesOptions.push(getSliceColorOption(names[i]));
            }
        }


        var options = {
            title: 'Scores Breakdown',
            width: 1000,
            height: 600,
            sliceVisibilityThreshold: 0,
            slices: slicesOptions
        }

        var chart = new google.visualization.PieChart(elt);
        chart.draw(data, options);
    }

    return {
        scoresRelToParForGame: _scoresRelToParForGame,
        daysOfWeekForCourse: _daysOfWeekForCourse,
        scoresOverTimeForCourse: _scoresOverTimeForCourse,
        holeDifficulty: _holeDifficulty,
        coursesPlayedCount: _coursesPlayedCount,
        numPeopleInGame: _numPeopleInGame,
        playersPlayedWith: _playersPlayedWith,
        scoresOverTimeForPlayerAtCourse: _scoresOverTimeForPlayerAtCourse,
        scoreBreakdownForPlayerAtCourse: _scoreBreakdownForPlayerAtCourse
    }
}]);