define(['utils/testsAPI'], function(testsAPI) {
    
    var expect = chai.expect;

    function Test(){

        before(function(done){
            testsAPI.Prepare(done);
        });

        describe('Items', function() {

            afterEach(testsAPI.AfterEach);

            it('should successfully pick up item', function(done) {
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

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
                        testsAPI.PutItem(player['x'] + 1, player['y'] + 1);
                    } else if (response['action'] == testsAPI.putItemAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        item_id = response['id'];
                        testsAPI.PickUp(player['sid'], item_id);
                    } else if (response['action'] == testsAPI.enforceAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['actionResult']['result']).to.equal(testsAPI.actionResultOk);
                        done();
                    }
                });

                testsAPI.StartTesting();
            });

            it('should fail pick up item[too far]', function(done) {
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

                testsAPI.SetWSHandler(function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == testsAPI.startTestingAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.SetUpConstants();
                        testsAPI.SetUpMap([
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
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
                        testsAPI.PutItem(player['x'] + testsAPI.pickUpRadius + 1, player['y'] + testsAPI.pickUpRadius + 1);
                    } else if (response['action'] == testsAPI.putItemAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        item_id = response['id'];
                        testsAPI.PickUp(player['sid'], item_id);
                    } else if (response['action'] == testsAPI.enforceAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['actionResult']['result']).to.equal(testsAPI.actionResultBadId);
                        done();
                    }
                });

                testsAPI.StartTesting();
            });

            it('should fail pick up item[player already has it in inventory]', function(done) {
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

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
                        testsAPI.PutPlayer(player['x'], player['y'], [ testsAPI.MakeItem() ]);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        item_id = response['items'][0];
                        testsAPI.PickUp(player['sid'], item_id)
                    } else if (response['action'] == testsAPI.enforceAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['actionResult']['result']).to.equal(testsAPI.actionResultBadId);
                        done();
                    }
                });

                testsAPI.StartTesting();
            });

            it('should fail pick up item[object doesn\'t exists]', function(done) {
                var player = { x: 0.5, y: 0.5 };

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
                        player['sid'] = response['sid'];
                        testsAPI.PickUp(player['sid'], 34535345)
                    } else if (response['action'] == testsAPI.enforceAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['actionResult']['result']).to.equal(testsAPI.actionResultBadId);
                        done();
                    }
                });

                testsAPI.StartTesting();
            });

            it('should successfully destroy item', function(done) {
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

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
                        testsAPI.PutItem(player['x'] + 1, player['y'] + 1);
                    } else if (response['action'] == testsAPI.putItemAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        item_id = response['id'];
                        testsAPI.Destroy(player['sid'], item_id);
                    } else if (response['action'] == testsAPI.enforceAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['actionResult']['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.Sleep(testsAPI.tickDuration * 3, testsAPI.Examine, item_id);
                    } else if (response['action'] == testsAPI.examineAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultBadId);
                        done();
                    }
                });

                testsAPI.StartTesting();
            });

            it('should successfully destroy item in inventory', function(done) {
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

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
                        testsAPI.PutPlayer(player['x'], player['y'], [ testsAPI.MakeItem() ]);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        item_id = response['items'][0];
                        testsAPI.Destroy(player['sid'], item_id)
                    } else if (response['action'] == testsAPI.enforceAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['actionResult']['result']).to.equal(testsAPI.actionResultOk);
                        done();
                    }
                });

                testsAPI.StartTesting();
            });

            it('should fail destroy item[object doesn\'t exists]', function(done) {
                var player = { x: 0.5, y: 0.5 };

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
                        player['sid'] = response['sid'];
                        testsAPI.Destroy(player['sid'], -1)
                    } else if (response['action'] == testsAPI.enforceAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['actionResult']['result']).to.equal(testsAPI.actionResultBadId);
                        done();
                    }
                });

                testsAPI.StartTesting();
            });

            it('should fail destroy item[too far]', function(done) {
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

                testsAPI.SetWSHandler(function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == testsAPI.startTestingAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.SetUpConstants();
                        testsAPI.SetUpMap([
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
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
                        testsAPI.PutItem(player['x'] + testsAPI.pickUpRadius + 1, player['y'] + testsAPI.pickUpRadius + 1);
                    } else if (response['action'] == testsAPI.putItemAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        item_id = response['id'];
                        testsAPI.Destroy(player['sid'], item_id);
                    } else if (response['action'] == testsAPI.enforceAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['actionResult']['result']).to.equal(testsAPI.actionResultBadId);
                        testsAPI.Sleep(testsAPI.tickDuration * 3, testsAPI.Examine, item_id);
                    } else if (response['action'] == testsAPI.examineAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        done();
                    }
                });

                testsAPI.StartTesting();
            });

            it('should successfully drop item', function(done) {
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

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
                        testsAPI.PutPlayer(player['x'], player['y'], [ testsAPI.MakeItem() ]);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        item_id = response['items'][0];
                        testsAPI.Drop(player['sid'], item_id)
                    } else if (response['action'] == testsAPI.enforceAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['actionResult']['result']).to.equal(testsAPI.actionResultOk);
                        done();
                    }
                });

                testsAPI.StartTesting();
            });

            it('should fail drop item[player hasn\'t it in inventory]', function(done) {
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

                testsAPI.SetWSHandler(function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == testsAPI.startTestingAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.SetUpConstants();
                        testsAPI.SetUpMap([
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."]
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
                        testsAPI.PutItem(player['x'] + 1, player['y'] + 1);
                    } else if (response['action'] == testsAPI.putItemAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        item_id = response['id'];
                        testsAPI.Drop(player['sid'], item_id);
                    } else if (response['action'] == testsAPI.enforceAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['actionResult']['result']).to.equal(testsAPI.actionResultBadId);
                        done();
                    }
                });

                testsAPI.StartTesting();
            });

            it('should fail drop item[object doesn\'t exists]', function(done) {
                var player = { x: 0.5, y: 0.5 };

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
                        player['sid'] = response['sid'];
                        testsAPI.Drop(player['sid'], -1)
                    } else if (response['action'] == testsAPI.enforceAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['actionResult']['result']).to.equal(testsAPI.actionResultBadId);
                        done();
                    }
                });

                testsAPI.StartTesting();
            });

            it('should fail pick up item[item in other player\'s inventory]', function(done) {
                var player1 = { x: 0.5, y: 0.5 };
                var player2 = { x: 1.5, y: 1.5 };
                var item_id = null;
                var firstPut = true;

                testsAPI.SetWSHandler(function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == testsAPI.startTestingAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.SetUpConstants();
                        testsAPI.SetUpMap([
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."]
                        ]);
                    } else if (response['action'] == testsAPI.setUpConstAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                    } else if (response['action'] == testsAPI.setUpMapAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.PutPlayer(player1['x'], player1['y'], [ testsAPI.MakeItem() ]);
                        testsAPI.PutPlayer(player2['x'], player2['y']);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        if (firstPut) {
                            firstPut = false;
                            player1['id'] = response['id'];
                            player1['sid'] = response['sid'];
                            item_id = response['items'][0];    
                        } else {
                            player2['sid'] = response['sid'];
                            testsAPI.PickUp(player2['sid'], item_id);
                        }
                    } else if (response['action'] == testsAPI.enforceAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        if (response['actionResult']['action'] == testsAPI.pickUpAction) {
                            expect(response['actionResult']['result']).to.equal(testsAPI.actionResultBadId);
                            testsAPI.Examine(player1['id'], player1['sid']);
                        } else {
                            expect(response['actionResult']['inventory'][0]['id']).to.equal(item_id);
                            done();
                        }
                    }
                });

                testsAPI.StartTesting();
            });

            it('should fail destroy item[item in other player\'s inventory]', function(done) {
                var player1 = { x: 0.5, y: 0.5 };
                var player2 = { x: 1.5, y: 1.5 };
                var item_id = null;
                var firstPut = true;

                testsAPI.SetWSHandler(function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == testsAPI.startTestingAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.SetUpConstants();
                        testsAPI.SetUpMap([
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."]
                        ]);
                    } else if (response['action'] == testsAPI.setUpConstAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                    } else if (response['action'] == testsAPI.setUpMapAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.PutPlayer(player1['x'], player1['y'], [ testsAPI.MakeItem() ]);
                        testsAPI.PutPlayer(player2['x'], player2['y']);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        if (firstPut) {
                            firstPut = false;
                            player1['id'] = response['id'];
                            player1['sid'] = response['sid'];
                            item_id = response['items'][0];    
                        } else {
                            player2['sid'] = response['sid'];
                            testsAPI.Destroy(player2['sid'], item_id);
                        }
                    } else if (response['action'] == testsAPI.enforceAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        if (response['actionResult']['action'] == testsAPI.destroyAction) {
                            expect(response['actionResult']['result']).to.equal(testsAPI.actionResultBadId);
                            testsAPI.Examine(player1['id'], player1['sid']);
                        } else {
                            expect(response['actionResult']['inventory'][0]['id']).to.equal(item_id);
                            done();
                        }
                    }
                });

                testsAPI.StartTesting();
            });

            it('should fail drop item[item in other player\'s inventory]', function(done) {
                var player1 = { x: 0.5, y: 0.5 };
                var player2 = { x: 1.5, y: 1.5 };
                var item_id = null;
                var firstPut = true;

                testsAPI.SetWSHandler(function(e) {

                   var response = JSON.parse(e.data);

                    if (response['action'] == testsAPI.startTestingAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.SetUpConstants();
                        testsAPI.SetUpMap([
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."],
                            [".", ".", ".", ".", ".", ".", ".", "."]
                        ]);
                    } else if (response['action'] == testsAPI.setUpConstAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                    } else if (response['action'] == testsAPI.setUpMapAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        testsAPI.PutPlayer(player1['x'], player1['y'], [ testsAPI.MakeItem() ]);
                        testsAPI.PutPlayer(player2['x'], player2['y']);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        if (firstPut) {
                            firstPut = false;
                            player1['id'] = response['id'];
                            player1['sid'] = response['sid'];
                            item_id = response['items'][0];    
                        } else {
                            player2['sid'] = response['sid'];
                            testsAPI.Drop(player2['sid'], item_id);
                        }
                    } else if (response['action'] == testsAPI.enforceAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        if (response['actionResult']['action'] == testsAPI.dropAction) {
                            expect(response['actionResult']['result']).to.equal(testsAPI.actionResultBadId);
                            testsAPI.Examine(player1['id'], player1['sid']);
                        } else {
                            expect(response['actionResult']['inventory'][0]['id']).to.equal(item_id);
                            done();
                        }
                    }
                });

                testsAPI.StartTesting();
            });

            it('should fail pick up item[too heavy]', function(done) {
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

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
                        testsAPI.PutPlayer(player['x'], player['y'], [], { STRENGTH : 1 });
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        testsAPI.PutItem(player['x'] + 1, player['y'] + 1, 1000);
                    } else if (response['action'] == testsAPI.putItemAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        item_id = response['id'];
                        testsAPI.PickUp(player['sid'], item_id);
                    } else if (response['action'] == testsAPI.enforceAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        if (response['actionResult']['action'] == testsAPI.pickUpAction) {
                            expect(response['actionResult']['result']).to.equal('tooHeavy');
                            testsAPI.Examine(player['id'], player['sid']);    
                        } else {
                            expect(response['actionResult']['inventory'].length).to.equal(0);
                            done();
                        }                        
                    }
                });

                testsAPI.StartTesting();
            });

            it('should successfully equip item', function(done) {
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

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
                        testsAPI.PutPlayer(player['x'], player['y'], [ testsAPI.MakeItem() ]);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        item_id = response['items'][0];
                        testsAPI.Equip(player['sid'], item_id, "LEFT-HAND");
                    } else if (response['action'] == testsAPI.enforceAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['actionResult']['result']).to.equal(testsAPI.actionResultOk);
                        if (response['actionResult']['action'] == testsAPI.equipAction) {
                            testsAPI.Examine(player['id'], player['sid']);
                        } else {
                            expect(response['actionResult']['slots']['LEFT-HAND']['id']).to.equal(item_id);
                            done();
                        }
                    }
                });

                testsAPI.StartTesting();
            });

            it('should successfully unequip item', function(done) {
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;

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
                        testsAPI.PutPlayer(player['x'], player['y'], [ testsAPI.MakeItem() ], {}, { 'LEFT-HAND' : testsAPI.MakeItem() });
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        item_id = response['items'][0];
                        testsAPI.Unequip(player['sid'], "LEFT-HAND");
                    } else if (response['action'] == testsAPI.enforceAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['actionResult']['result']).to.equal(testsAPI.actionResultOk);
                        if (response['actionResult']['action'] == testsAPI.unequipAction) {
                            testsAPI.Examine(player['id'], player['sid']);
                        } else {
                            expect(response['actionResult']['slots']['LEFT-HAND']).to.equal(undefined);
                            done();
                        }
                    }
                });

                testsAPI.StartTesting();
            });

            it('should successfully equip/unequip item', function(done) {
                var player = { x: 0.5, y: 0.5 };
                var item_id = null;
                var first = true;

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
                        testsAPI.PutPlayer(player['x'], player['y'], [ testsAPI.MakeItem() ]);
                    } else if (response['action'] == testsAPI.putPlayerAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        player['id'] = response['id'];
                        player['sid'] = response['sid'];
                        item_id = response['items'][0];
                        testsAPI.Equip(player['sid'], item_id, "LEFT-HAND");
                    } else if (response['action'] == testsAPI.enforceAction) {
                        expect(response['result']).to.equal(testsAPI.actionResultOk);
                        expect(response['actionResult']['result']).to.equal(testsAPI.actionResultOk);
                        if (response['actionResult']['action'] == testsAPI.equipAction) {
                            testsAPI.Examine(player['id'], player['sid']);
                        } else if (response['actionResult']['action'] == testsAPI.examineAction) {
                            if (first) {
                                first = false;
                                expect(response['actionResult']['slots']['LEFT-HAND']['id']).to.equal(item_id);
                                testsAPI.Unequip(player['sid'], 'LEFT-HAND');
                            } else {
                                expect(response['actionResult']['slots']['LEFT-HAND']).to.equal(undefined);
                                done();
                            }
                        } else if (response['actionResult']['action'] == testsAPI.unequipAction) {
                            expect(response['actionResult']['result']).to.equal(testsAPI.actionResultOk);
                            testsAPI.Examine(player['id'], player['sid']);
                        }
                    }
                });

                testsAPI.StartTesting();
            });

        });

        after(testsAPI.Logout);
    }


    return {
      Test: Test
    }
});