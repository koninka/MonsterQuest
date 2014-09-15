define(['utils/testsAPI'], function(testsAPI) {
    var expect   = chai.expect;

    function Test(){

        describe('Players\' motion', function() {

            before(testsAPI.Prepare);

            after(testsAPI.Logout);

            beforeEach(testsAPI.BeforeEach);

            afterEach(testsAPI.AfterEach);

            describe('Player move', function() {

                it('should successfully move player in all directions', function(done){
                    var player = { x: 1.5, y: 1.5 };
                    var moveCounter = 0;
                    var dirs = ["north", "south", "west", "east"];
                    this.timeout(8000);

                    testsAPI.SetWSHandler(function(e) {

                        var response = JSON.parse(e.data);
                        if (response["tick"]) return;
                        switch (response['action']){
                            case testsAPI.startTestingAction:
                                expect(response['result']).to.equal(testsAPI.actionResultOk);
                                testsAPI.SetUpConstants(); 
                                break;
                            case testsAPI.setUpConstAction:
                                expect(response['result']).to.equal(testsAPI.actionResultOk);
                                testsAPI.SetUpMap([
                                    [".", ".", ".", "."],
                                    [".", ".", ".", "."],
                                    [".", ".", ".", "."],
                                    [".", ".", ".", "."]
                                ]); 
                                break;
                            case testsAPI.setUpMapAction:
                                expect(response['result']).to.equal(testsAPI.actionResultOk);
                                testsAPI.PutPlayer(player.x, player.y, [], {HP: player.hp, MAX_HP: player.max_hp});
                                break;
                            case testsAPI.putPlayerAction:
                                expect(response['result']).to.equal(testsAPI.actionResultOk);
                                player.id = response['id'];
                                player.sid  = response['sid'];
                                player.fist_id = response['fistId']; 
                                testsAPI.MovePlayer(player['sid'], dirs[moveCounter++]);
                                break;
                            case testsAPI.examineAction:
                                var shift = testsAPI.GetShiftByDir(dirs[moveCounter - 1]);
                                player['x'] += shift[0];
                                player['y'] += shift[1];
                                expect(response['result']).to.equal(testsAPI.actionResultOk);
                                expect(response['x']).to.be.closeTo(player['x'], 0.01);
                                expect(response['y']).to.be.closeTo(player['y'], 0.01);
                                if (moveCounter < dirs.length) {
                                    testsAPI.MovePlayer(player['sid'], dirs[moveCounter++]);
                                } else
                                    done();
                                break;
                            case "move":
                                testsAPI.Ok(response['result'])
                                testsAPI.Sleep(testsAPI.tickDuration * 2, testsAPI.Examine, player['id'])
                                break;
                            default:
                                throw new Error("unexpected response:" + JSON.stringify(response));
                        }
                    });

                 });

                it('should move player from one map edge to another map edge[big playerVelocity]', function(done){
                    var player = { x: 0.5, y: 3.5 };

                    testsAPI.SetWSHandler(function(e) {

                       var response = JSON.parse(e.data);

                        if (response['action'] == testsAPI.startTestingAction) {
                            testsAPI.Ok(response['result']);
                            testsAPI.SetUpConstants(10000);
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
                            testsAPI.Ok(response['result']);
                        } else if (response['action'] == testsAPI.setUpMapAction) {
                            testsAPI.Ok(response['result']);
                            testsAPI.PutPlayer(player['x'], player['y']);
                        } else if (response['action'] == testsAPI.putPlayerAction) {
                            testsAPI.Ok(response['result']);
                            player['id'] = response['id'];
                            player['sid'] = response['sid'];
                            testsAPI.MovePlayer(player['sid'], "east");
                            testsAPI.Sleep(testsAPI.tickDuration * 4, testsAPI.Examine, player['id']);
                        } else if (response['action'] == testsAPI.examineAction) {
                            testsAPI.Ok(response['result']);
                            expect(response['x']).to.be.closeTo(5.5, 0.01);
                            expect(response['y']).to.be.closeTo(player['y'], 0.01);
                            done();
                        }
                    });

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
                            expect(response['x']).to.be.closeTo(player['x'], 0.01);
                            expect(response['y']).to.be.closeTo(player['y'], 0.01);
                            if (moveCounter < dirs.length) {
                                testsAPI.MovePlayer(player['sid'], dirs[moveCounter++]);
                                testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                            } else
                                done();
                        }
                    });

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
                            expect(response['x']).to.be.closeTo(player['x'], 0.01);
                            expect(response['y']).to.be.closeTo(player['y'], 0.01);
                            if (moveCounter < dirs.length) {
                                testsAPI.MovePlayer(player['sid'], dirs[moveCounter++]);
                                testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                            } else
                                done();
                        }
                    });

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
                            expect(response['x']).to.be.closeTo(player['x'], 0.01);
                            expect(response['y']).to.be.closeTo(player['y'], 0.01);
                            if (moveCounter < dirs.length) {
                                testsAPI.MovePlayer(player['sid'], dirs[moveCounter++]);
                                testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                            } else {
                                expect(response['x']).to.be.closeTo(originX, 0.01);
                                expect(response['y']).to.be.closeTo(originY, 0.01);
                                done();
                            }
                        }
                    });

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
                            expect(response['x']).to.be.closeTo(player['x'], 0.01);
                            expect(response['y']).to.be.closeTo(player['y'], 0.01);
                            if (moveCounter < dirs.length) {
                                testsAPI.MovePlayer(player['sid'], dirs[moveCounter++]);
                                testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                            } else {
                                expect(response['x']).to.be.closeTo(originX, 0.01);
                                expect(response['y']).to.be.closeTo(originY, 0.01);
                                done();
                            }
                        }
                    });

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
                            expect(response['x']).to.be.closeTo(player['x'], 0.01);
                            expect(response['y']).to.be.closeTo(player['y'], 0.01);
                            if (moveCounter < dirs.length) {
                                testsAPI.MovePlayer(player['sid'], dirs[moveCounter++]);
                                testsAPI.Sleep(testsAPI.tickDuration * 2.5, testsAPI.Examine, player['id']);
                            } else {
                                expect(response['x']).to.be.closeTo(originX, 0.01);
                                expect(response['y']).to.be.closeTo(originY, 0.01);
                                done();
                            }
                        }
                    });

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
                            expect(response['x']).to.be.closeTo(response['x'] - 0.5, 0.01);
                            expect(response['y']).to.be.closeTo(player['y'] - testsAPI.playerVelocity, 0.01);
                            done();
                        }
                    });

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
                            expect(response['x']).to.be.closeTo(response['x'] - 2.5, 0.01);
                            expect(response['y']).to.be.closeTo(player['y'] - testsAPI.playerVelocity, 0.01);
                            done();
                        }
                    });

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
                            expect(response['x']).to.be.closeTo(response['x'] - 0.5, 0.01);
                            expect(response['y']).to.be.closeTo(player['y'] + testsAPI.playerVelocity, 0.01);
                            done();
                        }
                    });

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
                            expect(response['x']).to.be.closeTo(response['x'] - 2.5, 0.01);
                            expect(response['y']).to.be.closeTo(player['y'] + testsAPI.playerVelocity, 0.01);
                            done();
                        }
                    });

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
                            expect(response['x']).to.be.closeTo(player['x'] + testsAPI.playerVelocity, 0.01);
                            expect(response['y']).to.be.closeTo(response['y'] - 0.5, 0.01);
                            done();
                        }
                    });

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
                            expect(response['x']).to.be.closeTo(player['x'] + testsAPI.playerVelocity, 0.01);
                            expect(response['y']).to.be.closeTo(response['y'] - 2.5, 0.01);
                            done();
                        }
                    });

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
                            expect(response['x']).to.be.closeTo(player['x'] - testsAPI.playerVelocity, 0.01);
                            expect(response['y']).to.be.closeTo(response['y'] - 0.5, 0.01);
                            done();
                        }
                    });

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
                            expect(response['x']).to.be.closeTo(player['x'] - testsAPI.playerVelocity, 0.01);
                            expect(response['y']).to.be.closeTo(response['y'] - 2.5, 0.01);
                            done();
                        }
                    });

                });
            });


            describe('Player attack', function() {

                it('player should not hit yourself by use fists', function(done){
                    var player = { x: 3.5, y: 2.5, hp: 1000, max_hp: 1000};
                    var isSetMap = false;
                    var isSetConst = false;
                    var counter = 0;
                    this.timeout(5500);
                    testsAPI.SetWSHandler(function(e) {
                       var response = JSON.parse(e.data);
                        var actor = {};
                        console.log(response);
                        if (response['tick']) return;
                        switch (response['action']){
                            case testsAPI.startTestingAction:
                                expect(response['result']).to.equal(testsAPI.actionResultOk);
                                testsAPI.SetUpConstants(); 
                                break;
                            case testsAPI.setUpConstAction:
                                expect(response['result']).to.equal(testsAPI.actionResultOk);
                                testsAPI.SetUpMap([
                                    ["#", "#", "#", "#", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", "#", "#", "#", "#"]
                                ]); 
                                break;
                            case testsAPI.setUpMapAction:
                                expect(response['result']).to.equal(testsAPI.actionResultOk);
                                testsAPI.PutPlayer(player.x, player.y, [], {HP: player.hp, MAX_HP: player.max_hp});
                                break;
                            case testsAPI.putPlayerAction:
                                expect(response['result']).to.equal(testsAPI.actionResultOk);
                                player.id = response['id'];
                                player.sid  = response['sid'];
                                player.fist_id = response['fistId']; 
                                testsAPI.Use(player.sid, player.fist_id, player.x, player.y);
                                break;
                            case testsAPI.useAction:
                                testsAPI.Ok(response['result']);
                                testsAPI.Sleep(testsAPI.tickDuration * 2, testsAPI.Examine, player.id);
                                break;
                            case testsAPI.examineAction:
                                expect(response['result']).to.equal(testsAPI.actionResultOk);
                                actor = response["id"] == player.id ? player : 0;
                                expect(response["health"]).to.be.equal(player.hp);
                                done();
                                break;
                            default:
                                throw new Error("unexpected response:" + JSON.stringify(response));
                        }
                    });

                })

                it('player should attack monster by use, mob shouldn\'t attack player[mob don\'t have blow flag]', function(done){
                    var player = { x: 3.5, y: 2.5, hp: 1000, max_hp: 1000};
                    var mob = { x: 2.4, y: 2.5, hp: 500, max_hp: 500, race: "ORC", flags: []};
                    var isSetMap = false;
                    var isSetConst = false;
                    var counter = 0;
                    this.timeout(5500);
                    testsAPI.SetWSHandler(function(e) {
                       var response = JSON.parse(e.data);
                       console.log(response);
                        if (response['action'] == testsAPI.startTestingAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            testsAPI.SetUpConstants();
                            testsAPI.SetUpMap([
                                    ["#", "#", "#", "#", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", "#", "#", "#", "#"]
                                ]);
                        } else if (response['action'] == testsAPI.setUpConstAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetConst = true;
                        } else if (response['action'] == testsAPI.setUpMapAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetMap = true;
                        } else if (response['action'] == testsAPI.putPlayerAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            player.id = response['id'];
                            player.sid  = response['sid'];
                            player.fist_id = response['fistId'];
                            counter++;
                        } else if (response['action'] == testsAPI.putMobAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            mob.id = response['id'];
                            counter++;
                        } else if (response['action'] == testsAPI.examineAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            var actor = response["id"] == mob.id ? mob : player;
                            actor.ex_hp = response["health"];
                        }  else if (response['action'] == testsAPI.useAction) {
                            testsAPI.Ok(response['result']);
                            testsAPI.Sleep(testsAPI.tickDuration * 2, testsAPI.Examine, mob.id);
                            testsAPI.Sleep(testsAPI.tickDuration * 2, testsAPI.Examine, player.id);
                        }
                        if (isSetMap && isSetConst) {
                            testsAPI.PutMob(mob.x, mob.y, "ORC", "50d44", mob.flags, [], {HP: mob.hp, MAX_HP: mob.max_hp});
                            testsAPI.PutPlayer(player.x, player.y, [], {HP: player.hp, MAX_HP: player.max_hp});
                            isSetMap = isSetConst = false;
                        }
                        if (counter == 2) {
                            counter = 0;
                            testsAPI.Use(player.sid, player.fist_id, mob.x, mob.y);
                        }
                        if (mob.hasOwnProperty('ex_hp') && player.hasOwnProperty('ex_hp')) {
                            expect(player.ex_hp).to.equal(player.hp);
                            expect(mob.ex_hp).to.be.below(mob.hp);
                            done();
                        }
                    });

                });


                it('player should attack monster by use and then mob should attack player[mob have blow flag]', function(done){
                    var player = { x: 3.5, y: 2.5, hp: 1000, max_hp: 1000};
                    var mob = { x: 2.4, y: 2.5, hp: 500, max_hp: 500, race: "ORC", flags: ["CAN_BLOW"]};
                    var isSetMap = false;
                    var isSetConst = false;
                    var counter = 0;
                    this.timeout(5500);
                    testsAPI.SetWSHandler(function(e) {
                       var response = JSON.parse(e.data);
                       console.log(response);
                        if (response['action'] == testsAPI.startTestingAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            testsAPI.SetUpConstants();
                            testsAPI.SetUpMap([
                                    ["#", "#", "#", "#", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", ".", ".", ".", "#"],
                                    ["#", "#", "#", "#", "#"]
                                ]);
                        } else if (response['action'] == testsAPI.setUpConstAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetConst = true;
                        } else if (response['action'] == testsAPI.setUpMapAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            isSetMap = true;
                        } else if (response['action'] == testsAPI.putPlayerAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            player.id = response['id'];
                            player.sid  = response['sid'];
                            player.fist_id = response['fistId'];
                            counter++;
                        } else if (response['action'] == testsAPI.putMobAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            mob.id = response['id'];
                            counter++;
                        } else if (response['action'] == testsAPI.examineAction) {
                            expect(response['result']).to.equal(testsAPI.actionResultOk);
                            var actor = response["id"] == mob.id ? mob : player;
                            actor.ex_hp = response["health"];
                        }  else if (response['action'] == testsAPI.useAction) {
                            testsAPI.Ok(response['result']);
                            testsAPI.Sleep(testsAPI.tickDuration * 2, testsAPI.Examine, mob.id);
                            testsAPI.Sleep(testsAPI.tickDuration * 2, testsAPI.Examine, player.id);
                        }
                        if (isSetMap && isSetConst) {
                            testsAPI.PutMob(mob.x, mob.y, "ORC", "2d1", mob.flags, [], {HP: mob.hp, MAX_HP: mob.max_hp});
                            testsAPI.PutPlayer(player.x, player.y, [], {HP: player.hp, MAX_HP: player.max_hp});
                            isSetMap = isSetConst = false;
                        }
                        if (counter == 2) {
                            counter = 0;
                            testsAPI.Use(player.sid, player.fist_id, mob.x, mob.y);
                        }
                        if (mob.hasOwnProperty('ex_hp') && player.hasOwnProperty('ex_hp')) {
                            expect(player.ex_hp).to.be.below(player.hp);
                            expect(mob.ex_hp).to.be.below(mob.hp);
                            expect(player.ex_hp).to.be.at.least(mob.ex_hp);
                            done();
                        }
                    });

                });

            });

        });
    }


    return {
      Test: Test
    }
});