define(['utils/testsAPI'], function(testsAPI) {
    var expect   = chai.expect;

    function Test(){

        before(function(done){
            testsAPI.Prepare(done);
        });

        after(testsAPI.Logout);

        describe('Players\' motion', function() {

            afterEach(testsAPI.AfterEach);

            it('should successfully move player in all directions', function(done){
                var player = { x: 1.5, y: 1.5 };
                var moveCounter = 0;
                var dirs = ["north", "south", "west", "east"];
                this.timeout(8000);

                testsAPI.SetWSHandler(function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == testsAPI.startTestingAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.SetUpConstants();
                        testsAPI.SetUpMap([
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."]
                        ]);
                    } else if (response['action'] == testsAPI.setUpConstAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                    } else if (response['action'] == testsAPI.setUpMapAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        testsAPI.MovePlayer(player['sid'], dirs[moveCounter++]);
                        testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                    } else if (response['action'] == testsAPI.examineAction) {
                        var shift = testsAPI.GetShiftByDir(dirs[moveCounter - 1]);
                        player['x'] += shift[0];
                        player['y'] += shift[1];
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['x']).to.equal(player['x']);
                        expect(response['y']).to.equal(player['y']);
                        if (moveCounter < dirs.length) {
                            testsAPI.MovePlayer(player['sid'], dirs[moveCounter++]);
                            testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                        } else
                            done();
                    }
                });

                testsAPI.StartTesting();
             });

            it('should move player from one map edge to another map edge[big playerVelocity]', function(done){
                var player = { x: 3.5, y: 6.5 };

                testsAPI.SetWSHandler(function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == testsAPI.startTestingAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.SetUpConstants(30);
                        testsAPI.SetUpMap([
                            [".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", "."]
                        ]);
                    } else if (response['action'] == testsAPI.setUpConstAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                    } else if (response['action'] == testsAPI.setUpMapAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        testsAPI.MovePlayer(player['sid'], "north");
                        testsAPI.Sleep(testsAPI.tickDuration * 4, testsAPI.Examine, player['id']);
                    } else if (response['action'] == testsAPI.examineAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['x']).to.equal(player['x']);
                        expect(response['y']).to.be.below(player['y']);
                        testsAPI.MovePlayer(player['sid'], dirs[moveCounter++]);
                        testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                        done();
                    }
                });

                testsAPI.StartTesting();
             });

            it('should not move player in all directions[walls around]', function(done){
                var player = { x: 1.5, y: 1.5 };
                var moveCounter = 0;
                var dirs = ["north", "south", "west", "east"];

                testsAPI.SetWSHandler(function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == testsAPI.startTestingAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.SetUpConstants();
                        testsAPI.SetUpMap([
                            ["#", "#", "#"],
                            ["#", ".", "#"],
                            ["#", "#", "#"]
                        ]);
                    } else if (response['action'] == testsAPI.setUpConstAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                    } else if (response['action'] == testsAPI.setUpMapAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        testsAPI.MovePlayer(player['sid'], dirs[moveCounter++]);
                        testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                    } else if (response['action'] == testsAPI.examineAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['x']).to.equal(player['x']);
                        expect(response['y']).to.equal(player['y']);
                        if (moveCounter < dirs.length) {
                            testsAPI.MovePlayer(player['sid'], dirs[moveCounter++]);
                            testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                        } else
                            done();
                    }
                });

                testsAPI.StartTesting();
             });

            it('should not move player[another players on way]', function(done){
                var player = { x: 1.5, y: 1.5 };
                var moveCounter = 0, putPlayerCounter = 0;
                var dirs = ["north", "south", "west", "east"];
                testsAPI.SetWSHandler(function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == testsAPI.startTestingAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.SetUpConstants();
                        testsAPI.SetUpMap([
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."]
                        ]);
                    } else if (response['action'] == testsAPI.setUpConstAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                    } else if (response['action'] == testsAPI.setUpMapAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        var x = player['x'], y = player['y'];
                        testsAPI.PutPlayer(x, y);
                        testsAPI.PutPlayer(x - 1, y - 1);
                        testsAPI.PutPlayer(x - 1, y);
                        testsAPI.PutPlayer(x - 1, y + 1);
                        testsAPI.PutPlayer(x, y - 1);
                        testsAPI.PutPlayer(x, y + 1);
                        testsAPI.PutPlayer(x + 1, y - 1);
                        testsAPI.PutPlayer(x + 1, y);
                        testsAPI.PutPlayer(x + 1, y + 1);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        if (putPlayerCounter == 0) {
                            player['id'] = response['id'];
                            player['sid'] = response['sid'];
                        }
                        putPlayerCounter++;
                        if (putPlayerCounter == 9) {
                            testsAPI.MovePlayer(player['sid'], dirs[moveCounter++]);
                            testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                        }
                    } else if (response['action'] == testsAPI.examineAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['x']).to.equal(player['x']);
                        expect(response['y']).to.equal(player['y']);
                        if (moveCounter < dirs.length) {
                            testsAPI.MovePlayer(player['sid'], dirs[moveCounter++]);
                            testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                        } else
                            done();
                    }
                });

                testsAPI.StartTesting();
             });

            it('should successfully move player in all directions[bound collision with walls]', function(done){
                var originX = 1.5, originY = 1.5;
                var player = { x: originX, y: originY };
                var moveCounter = 0;
                var dirs = ["north", "south", "west", "east", "south", "north", "east", "west"];

                testsAPI.SetWSHandler(function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == testsAPI.startTestingAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.SetUpConstants();
                        testsAPI.SetUpMap([
                            ["#", ".", "#"],
                            [".", ".", "."],
                            ["#", ".", "#"],
                        ]);
                    } else if (response['action'] == testsAPI.setUpConstAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                    } else if (response['action'] == testsAPI.setUpMapAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        testsAPI.MovePlayer(player['sid'], dirs[moveCounter++]);
                        testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                    } else if (response['action'] == testsAPI.examineAction) {
                        var shift = testsAPI.GetShiftByDir(dirs[moveCounter - 1]);
                        player['x'] += shift[0];
                        player['y'] += shift[1];
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['x']).to.equal(player['x']);
                        expect(response['y']).to.equal(player['y']);
                        if (moveCounter < dirs.length) {
                            testsAPI.MovePlayer(player['sid'], dirs[moveCounter++]);
                            testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                        } else {
                            expect(response['x']).to.equal(originX);
                            expect(response['y']).to.equal(originY);
                            done();
                        }
                    }
                });

                testsAPI.StartTesting();
             });

            it('should successfully move player in all directions[bound collision with players]', function(done){
                var originX = 1.5, originY = 1.5;
                var player = { x: originX, y: originY };
                var moveCounter = 0, putPlayerCounter = 0;
                var dirs = ["north", "south", "west", "east", "south", "north", "east", "west"];

                testsAPI.SetWSHandler(function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == testsAPI.startTestingAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.SetUpConstants();
                        testsAPI.SetUpMap([
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."]
                        ]);
                    } else if (response['action'] == testsAPI.setUpConstAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                    } else if (response['action'] == testsAPI.setUpMapAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        var x = player['x'], y = player['y'];
                        testsAPI.PutPlayer(x, y);
                        testsAPI.PutPlayer(x - 1, y - 1);
                        testsAPI.PutPlayer(x - 1, y + 1);
                        testsAPI.PutPlayer(x + 1, y - 1);
                        testsAPI.PutPlayer(x + 1, y + 1);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        if (putPlayerCounter == 0) {
                            player['id'] = response['id'];
                            player['sid'] = response['sid'];
                        }
                        putPlayerCounter++;
                        if (putPlayerCounter == 5) {
                            testsAPI.MovePlayer(player['sid'], dirs[moveCounter++]);
                            testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                        }
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        testsAPI.MovePlayer(player['sid'], dirs[moveCounter++]);
                        testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                    } else if (response['action'] == testsAPI.examineAction) {
                        var shift = testsAPI.GetShiftByDir(dirs[moveCounter - 1]);
                        player['x'] += shift[0];
                        player['y'] += shift[1];
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['x']).to.equal(player['x']);
                        expect(response['y']).to.equal(player['y']);
                        if (moveCounter < dirs.length) {
                            testsAPI.MovePlayer(player['sid'], dirs[moveCounter++]);
                            testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                        } else {
                            expect(response['x']).to.equal(originX);
                            expect(response['y']).to.equal(originY);
                            done();
                        }
                    }
                });

                testsAPI.StartTesting();
             });

            it('should successfully move player in east and west[bound collision with wall(north) and player(south)]', function(done){
                var originX = 1.5, originY = 1.5;
                var player = { x: originX, y: originY };
                var moveCounter = 0;
                var putFirstPlayer = false;
                var dirs = ["east", "west", "west", "east"];

                testsAPI.SetWSHandler(function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == testsAPI.startTestingAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.SetUpConstants();
                        testsAPI.SetUpMap([
                            [".", "#", "."],
                            [".", ".", "."],
                            [".", ".", "."],
                            [".", ".", "."]
                        ]);
                    } else if (response['action'] == testsAPI.setUpConstAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                    } else if (response['action'] == testsAPI.setUpMapAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.PutPlayer(player['x'], player['y']);
                        testsAPI.PutPlayer(player['x'], player['y'] + 1);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        if (!putFirstPlayer) {
                            putFirstPlayer = true;
                            player['id'] = response['id'];
                            player['sid'] = response['sid'];
                        } else {
                            testsAPI.MovePlayer(player['sid'], dirs[moveCounter++]);
                            testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                        }
                    } else if (response['action'] == testsAPI.examineAction) {
                        var shift = testsAPI.GetShiftByDir(dirs[moveCounter - 1]);
                        player['x'] += shift[0];
                        player['y'] += shift[1];
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['x']).to.equal(player['x']);
                        expect(response['y']).to.equal(player['y']);
                        if (moveCounter < dirs.length) {
                            testsAPI.MovePlayer(player['sid'], dirs[moveCounter++]);
                            testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                        } else {
                            expect(response['x']).to.equal(originX);
                            expect(response['y']).to.equal(originY);
                            done();
                        }
                    }
                });

                testsAPI.StartTesting();
             });

             it('should successfully move player[wall sliding(left, north)]', function(done){
                var player = { x: 1.5 - 1 + testsAPI.slideThreshold, y: 2.5 };

                testsAPI.SetWSHandler(function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == testsAPI.startTestingAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.SetUpConstants();
                        testsAPI.SetUpMap([
                            [".", ".", ".", "."],
                            [".", "#", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                        ]);
                    } else if (response['action'] == testsAPI.setUpConstAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                    } else if (response['action'] == testsAPI.setUpMapAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        testsAPI.MovePlayer(player['sid'], "north");
                        testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                    } else if (response['action'] == testsAPI.examineAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['x']).to.equal(0.5);
                        expect(response['y']).to.equal(player['y'] - testsAPI.playerVelocity);
                        done();
                    }
                });

                testsAPI.StartTesting();
             });

            it('should successfully move player[wall sliding(right, north)]', function(done){
                var player = { x: 1.5 + 1 - testsAPI.slideThreshold, y: 2.5 };

                testsAPI.SetWSHandler(function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == testsAPI.startTestingAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.SetUpConstants();
                        testsAPI.SetUpMap([
                            [".", ".", ".", "."],
                            [".", "#", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                        ]);
                    } else if (response['action'] == testsAPI.setUpConstAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                    } else if (response['action'] == testsAPI.setUpMapAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        testsAPI.MovePlayer(player['sid'], "north");
                        testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                    } else if (response['action'] == testsAPI.examineAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['x']).to.equal(2.5);
                        expect(response['y']).to.equal(player['y'] - testsAPI.playerVelocity);
                        done();
                    }
                });

                testsAPI.StartTesting();
             });

            it('should successfully move player[wall sliding(left, south)]', function(done){
                var player = { x: 1.5 - 1 + testsAPI.slideThreshold, y: 0.5 };

                testsAPI.SetWSHandler(function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == testsAPI.startTestingAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.SetUpConstants();
                        testsAPI.SetUpMap([
                            [".", ".", ".", "."],
                            [".", "#", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                        ]);
                    } else if (response['action'] == testsAPI.setUpConstAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                    } else if (response['action'] == testsAPI.setUpMapAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        testsAPI.MovePlayer(player['sid'], "south");
                        testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                    } else if (response['action'] == testsAPI.examineAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['x']).to.equal(0.5);
                        expect(response['y']).to.equal(player['y'] + testsAPI.playerVelocity);
                        done();
                    }
                });

                testsAPI.StartTesting();
             });

            it('should successfully move player[wall sliding(right, south)]', function(done){
                var player = { x: 1.5 + 1 - testsAPI.slideThreshold, y: 0.5 };

                testsAPI.SetWSHandler(function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == testsAPI.startTestingAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.SetUpConstants();
                        testsAPI.SetUpMap([
                            [".", ".", ".", "."],
                            [".", "#", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                        ]);
                    } else if (response['action'] == testsAPI.setUpConstAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                    } else if (response['action'] == testsAPI.setUpMapAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        testsAPI.MovePlayer(player['sid'], "south");
                        testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                    } else if (response['action'] == testsAPI.examineAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['x']).to.equal(2.5);
                        expect(response['y']).to.equal(player['y'] + testsAPI.playerVelocity);
                        done();
                    }
                });

                testsAPI.StartTesting();
             });

            it('should successfully move player[wall sliding(top, east)]', function(done){
                var player = { x: 0.5, y: 1.5 - 1 + testsAPI.slideThreshold };

                testsAPI.SetWSHandler(function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == testsAPI.startTestingAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.SetUpConstants();
                        testsAPI.SetUpMap([
                            [".", ".", ".", "."],
                            [".", "#", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                        ]);
                    } else if (response['action'] == testsAPI.setUpConstAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                    } else if (response['action'] == testsAPI.setUpMapAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        testsAPI.MovePlayer(player['sid'], "east");
                        testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                    } else if (response['action'] == testsAPI.examineAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['x']).to.equal(player['x'] + testsAPI.playerVelocity);
                        expect(response['y']).to.equal(0.5);
                        done();
                    }
                });

                testsAPI.StartTesting();
             });

            it('should successfully move player[wall sliding(bottom, east)]', function(done){
                var player = { x: 0.5, y: 1.5 + 1 - testsAPI.slideThreshold };

                testsAPI.SetWSHandler(function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == testsAPI.startTestingAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.SetUpConstants();
                        testsAPI.SetUpMap([
                            [".", ".", ".", "."],
                            [".", "#", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                        ]);
                    } else if (response['action'] == testsAPI.setUpConstAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                    } else if (response['action'] == testsAPI.setUpMapAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        testsAPI.MovePlayer(player['sid'], "east");
                        testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                    } else if (response['action'] == testsAPI.examineAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['x']).to.equal(player['x'] + testsAPI.playerVelocity);
                        expect(response['y']).to.equal(2.5);
                        done();
                    }
                });

                testsAPI.StartTesting();
             });

            it('should successfully move player[wall sliding(top, west)]', function(done){
                var player = { x: 2.5, y: 1.5 - 1 + testsAPI.slideThreshold };

                testsAPI.SetWSHandler(function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == testsAPI.startTestingAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.SetUpConstants();
                        testsAPI.SetUpMap([
                            [".", ".", ".", "."],
                            [".", "#", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                        ]);
                    } else if (response['action'] == testsAPI.setUpConstAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                    } else if (response['action'] == testsAPI.setUpMapAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        testsAPI.MovePlayer(player['sid'], 'west');
                        testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                    } else if (response['action'] == testsAPI.examineAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['x']).to.equal(player['x'] - testsAPI.playerVelocity);
                        expect(response['y']).to.equal(0.5);
                        done();
                    }
                });

                testsAPI.StartTesting();
             });

            it('should successfully move player[wall sliding(bottom, west)]', function(done){
                var player = { x: 2.5, y: 1.5 + 1 - testsAPI.slideThreshold };

                testsAPI.SetWSHandler(function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == testsAPI.startTestingAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.SetUpConstants();
                        testsAPI.SetUpMap([
                            [".", ".", ".", "."],
                            [".", "#", ".", "."],
                            [".", ".", ".", "."],
                            [".", ".", ".", "."],
                        ]);
                    } else if (response['action'] == testsAPI.setUpConstAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                    } else if (response['action'] == testsAPI.setUpMapAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.PutPlayer(player['x'], player['y']);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        testsAPI.MovePlayer(player['sid'], 'west');
                        testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                    } else if (response['action'] == testsAPI.examineAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['x']).to.equal(player['x'] - testsAPI.playerVelocity);
                        expect(response['y']).to.equal(2.5);
                        done();
                    }
                });

                testsAPI.StartTesting();
            });

        });
    }


    return {
      Test: Test
    }
});