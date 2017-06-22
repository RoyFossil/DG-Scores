var MongoClient = require('mongodb').MongoClient;
var express = require('express');
var cors = require('cors');
var app = express();
app.use(cors())

var uri = "mongodb://RoyFossil:DGCluster83@discgolf-shard-00-00-vzyvi.mongodb.net:27017,discgolf-shard-00-01-vzyvi.mongodb.net:27017,discgolf-shard-00-02-vzyvi.mongodb.net:27017/DiscGolf?ssl=true&replicaSet=DiscGolf-shard-0&authSource=admin";
MongoClient.connect(uri, function (err, db) {
    if (err) throw err;

    //all the functions

    app.get('/getPlayers', function (req, res) {
        db.collection('players').find({}, function (err, cursor) {
            cursor.toArray(function (err, arr) {
                res.send(arr);
            });
        });
    });

    app.get('/getCourses', function (req, res) {
        db.collection('courses').find({}, function (err, cursor) {
            cursor.toArray(function (err, arr) {
                res.send(arr);
            });
        });
    });

    app.get('/getPlayer/:id', function (req, res) {
        db.collection('players').findOne({ id: req.params.id }, function (err, obj) {
            res.send(obj);
        });
    });

    app.get('/getCourse/:id', function (req, res) {
        db.collection('courses').findOne({ id: req.params.id }, function (err, obj) {
            res.send(obj);
        });
    });

    app.get('/getNumGamesPlayed/:uuid', function (req, res) {
        db.collection('gamePlayers').count({ playerUuid: req.params.uuid }, function (err, count) {
            res.send(count.toString());
        });
    })

    app.get('/getGame/:uuid', function (req, res) {
        db.collection("games").aggregate([
            {
                $match: {uuid:req.params.uuid}
            },
            {
                $lookup: {
                    from: "courses",
                    localField: "courseUuid",
                    foreignField: "uuid",
                    as: "course"
                }
            },
            {
                $unwind: "$course"
            },
            {
                $lookup: {
                    from: "gamePlayers",
                    localField: "uuid",
                    foreignField: "gameUuid",
                    as: "gamePlayers"
                }
            },
            {
                $unwind: "$gamePlayers"
            },
            {
                $lookup: {
                    from: "players",
                    localField: "gamePlayers.playerUuid",
                    foreignField: "uuid",
                    as: "players"
                }
            },
            {
                $unwind: "$players"
            },
            {
                $group: {
                    _id: "$_id",
                    //createdAt: { $first:"$createdAt" },
                    endedAt: { $first: "$endedAt" },
                    id: { $first: "$id" },
                    startedAt: { $first: "$startedAt" },
                    //updatedAt: { $first: "$updatedAt"},
                    uuid: { $first: "$uuid" },
                    course: { $first: "$course" },
                    players: {
                        $push: {
                            _id: "$players._id",
                            uuid: "$players.uuid",
                            id: "$players.id",
                            name: "$players.name",
                            uuid: "$players.uuid",
                            gamePlayerUuid: "$gamePlayers.uuid"
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "gameHoles",
                    localField: "uuid",
                    foreignField: "gameUuid",
                    as: "gameHoles"
                }
            },
            {
                $unwind: "$gameHoles"
            },
            {
                $lookup: {
                    from: "scores",
                    localField: "gameHoles.uuid",
                    foreignField: "gameHoleUuid",
                    as: "gameHoles.scores"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    //createdAt: { $first:"$createdAt" },
                    endedAt: { $first: "$endedAt" },
                    id: { $first: "$id" },
                    startedAt: { $first: "$startedAt" },
                    //updatedAt: { $first: "$updatedAt"},
                    uuid: { $first: "$uuid" },
                    course: { $first: "$course" },
                    players: { $first: "$players" },
                    gameHoles: {
                        $push: {
                            _id: "$gameHoles._id",
                            hole: "$gameHoles.hole",
                            id: "$gameHoles.id",
                            par: "$gameHoles.par",
                            uuid: "$gameHoles.uuid",
                            scores: "$gameHoles.scores"
                        }
                    }
                }
            },
            {
                $project: {
                    "gameHoles": {
                        "scores": {
                            "gameHoleUuid": 0,
                            "gameUuid": 0
                        }
                    }
                }
            }/*,
            {
                $project: {
                    "course.par": { $sum: "$gameHoles.par" }
                }
            }*/

        ]).toArray(function (err, arr) {
            //this should be replaced with next, instead of toArray
            var obj = arr[0]
            var totalPar = 0;
            var holesPlayed = {};
            var totalScore = {};
            var lastScoreRelToPar = {};

            //prettttty sure gameHoles will always be ordered.... but just to be safe? nah screw it. gonna leave this here tho. something to think about.

            //calculate total scores and number of holes played for each player
            for (var i = 0; i < obj.gameHoles.length; i++) {
                //cumulate par over all holes
                var par = obj.gameHoles[i].par;
                totalPar += par;
                //for each hole, loop through scores array 
                for (var j = 0; j < obj.gameHoles[i].scores.length; j++) {
                    //get gamePlayerUuid for this score
                    var gpUuid = obj.gameHoles[i].scores[j].gamePlayerUuid;
                    //get score value
                    var score = obj.gameHoles[i].scores[j].score;

                    //calculate score relative to par for this hole
                    var scoreRelToPar = score - par;
                    //cumulate score relative to par
                    if (lastScoreRelToPar.hasOwnProperty(gpUuid)) {
                        lastScoreRelToPar[gpUuid] += scoreRelToPar;
                    } else {
                        lastScoreRelToPar[gpUuid] = scoreRelToPar;
                    }
                    //add running score relative to par to the score obj so that it can be accessed again
                    obj.gameHoles[i].scores[j].scoreRelToPar = lastScoreRelToPar[gpUuid];
                    obj.gameHoles[i].scores[j].formattedScoreRelToPar = formatScore(lastScoreRelToPar[gpUuid]);

                    //increment holes played
                    if (holesPlayed.hasOwnProperty(gpUuid)) {
                        holesPlayed[gpUuid]++;
                    } else {
                        //if this is the first hole scored for this player, create the entry and set to 1
                        holesPlayed[gpUuid] = 1;
                    }

                    //cumulate total score
                    if (totalScore.hasOwnProperty(gpUuid)) {
                        totalScore[gpUuid] += score;
                    } else {
                        //if this is the first hole scored for this player, create the entry and set to score
                        totalScore[gpUuid] = score;
                    }
                }
            }

            obj.course.totalPar = totalPar;

            for (var i = 0; i < obj.players.length; i++) {
                obj.players[i].holesPlayed = holesPlayed[obj.players[i].gamePlayerUuid];
                obj.players[i].totalScore = totalScore[obj.players[i].gamePlayerUuid];
                //updated score rel to par
                obj.players[i].scoreRelToPar = lastScoreRelToPar[obj.players[i].gamePlayerUuid];
                
                obj.players[i].formattedScore = formatScore(obj.players[i].scoreRelToPar);
            }

            obj.players.sort(playerCompare);

            res.send(obj);
        });
    })

    function gameHolesCompare(g1, g2) {
        return g1.hole - g2.hole;
    }

    function playerCompare(p1, p2) {
        if (p1.holesPlayed == p2.holesPlayed) {
            //compare scores
            return p1.totalScore - p2.totalScore;
        } else {
            return p2.holesPlayed - p1.holesPlayed;
        }
    }

    function parThroughNHoles(gameHoles, n) {
        var par = 0;
        for (var i = 0; i < n; i++) {
            par += gameHoles[i].par;
        }
        return par;
    }

    function formatScore(score) {
        if (score > 0) {
            return '+' + score.toString();
        } else if (score < 0) {
            return score.toString();
        } else {
            return 'E';
        }
    }

    app.get('/getMostRecentGameUuid/:playerUuid', function (req, res) {
        db.collection('gamePlayers').aggregate([
            { $match: { playerUuid: req.params.playerUuid } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            { $project: { "gameUuid": 1, "_id": 0 } }
        ]).toArray(function (err, arr) {
            console.log(arr[0]);
            res.send(arr[0]);
        })
    })

    //player uuid in
    app.get('/getNumGamesWon/:uuid', function (req, res) {
        var results = { count: 0 };
        //need to get all gamePlayer uuids from the given player uuid
        db.collection('gamePlayers').find({ playerUuid: req.params.uuid }, function (err, cursor) {
            //throw em into an array
            cursor.toArray(function (err, arr) {
                //loop through each gamePlayer uuid, match on the gameUuid and do some clever sorting..
                var checked = {};
                for (var i = 0; i < arr.length; i++) {
                    checked["game" + i] = false;
                    var obj = arr[i];
                    obj.index = i;
                    gamesWonHelper(obj, results, checked, arr.length, res);
                }
            });
        });
    });

    //ensures input data isn't changing when the query is being run
    //NOTE: in the case of a tie for first, both players will pick up the win (as opposed to neither? idk. seems fair)
    function gamesWonHelper(obj, results, checked, length, res) {
        db.collection('scores').aggregate([
            { $match: { gameUuid: obj.gameUuid } },
            { $group: { _id: "$gamePlayerUuid", score: { $sum: "$score" }, holesPlayed: { $sum: 1 } } },
            { $sort: { holesPlayed: -1, score: 1 } }
        ]).toArray(function (err, arr) {
            if(arr[0]._id == obj.uuid){
                results.count++;
            } else {
                var i=0
                while (i < arr.length - 1 && arr[i].holesPlayed == arr[i + 1].holesPlayed && arr[i].score == arr[i + 1].score) {
                    if (arr[i + 1]._id == obj.uuid) {
                        results.count++;
                        break;
                    } else {
                        i++;
                    }
                }
            }
            checked["game" + obj.index] = true;
            if (allGamesChecked(checked)) {
                res.send(results.count.toString());
            }
        });
    }

    //janky fix for synchronous calls because i don't know what i'm doing.
    function allGamesChecked(checked) {
        var keys = Object.keys(checked);
        for (var i = 0; i < keys.length; i++) {
            if (!checked[keys[i]]) {
                return false
            }
        }
        return true;
    }

    //start the server
    var server = app.listen(50000, "127.0.0.1", function () {
        var host = server.address().address;
        var port = server.address().port;
        console.log("App listening at http://%s:%s", host, port);
    });
});









/*
db.collection('games').find({}, function (err, cursor) {

        cursor.toArray(function (err, arr) {
            arr.forEach(function (doc) {
                //console.log(doc);
                var date = new Date(doc.startedAt * 1).toDateString()
                var startTime = new Date(doc.startedAt * 1).toLocaleTimeString();
                var endTime = new Date(doc.endedAt * 1).toLocaleTimeString();
                var courseUuid = doc.courseUuid;
                //console.log(date + startTime + endTime + courseUuid);
                db.collection('courses').findOne({uuid:courseUuid}, function (err, course) {
                    if (err) throw err;
                    var courseName = course.name;
                    console.log(courseName);
                    console.log(date);
                    console.log("Start time: " + startTime + "  End time: " + endTime + "\n");
                });
            });
            db.close();
        });
    });
*/









/*
db.collections(function (err, cols) {
    cols.forEach(function (col) {
        console.log(col.collectionName);
    });
});
*/


/*MongoClient.connect(uri, function (err, db) {
    if (err) throw err;
    db.collection('courses').insertMany(courses, function (err, records) {
        if (err) throw err;
    });
    db.collection('holes').insertMany(holes, function (err, records) {
        if (err) throw err;
    });
    db.close();
});*/



/*MongoClient.connect(uri, function (err, db) {
    if (err) throw err;
    db.collection('test').find({}, function (err, cursor) {
        cursor.toArray(function (err, docs) {
            console.log(docs);
        });
    });
    db.close();
});*/