const fs = require('fs');
const path = require('path');
const vm = require('vm');
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const db = require('./database');
const Player = require('./player');

const app = express();

/* Middlewares */
app.use('/static', express.static(__dirname + '/static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'pusheen',
    cookie: {}
}));

app.use(function(req, res, next) {
    if (!req.session.game) {
        req.session.game = [];
    }
    next();
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* Routes */
app.get('/:game', function(req, res) {
    res.render('GM_2', {
        gameID: req.params.game
    });
});

app.get('/:game/sync', function(req, res) {
    if (!req.session.game[req.params.game]) {
        db.getGameInfo(req.params.game)
            .then(function(gameInfo) {
                req.session.game[req.params.game] = {items: {}, states: {}};
                req.session.game[req.params.game].present_scene = gameInfo.initSID;
                return gameInfo.initAID;
            })
            .then(function(initAID) {
                return db.getCode(initAID);
            })
            .then(function(code) {
                var script = new vm.Script(code);
                var context = new vm.createContext({
                    player: new Player(req.session.game[req.params.game]),
                });
                script.runInContext(context);
                res.json(req.session.game[req.params.game]);
            });
    } else res.json(req.session.game[req.params.game]);
});

app.post('/:game/action/:scene/:actionID', function(req, res) {
    var player = new Player(req.session.game[req.params.game]);
    db.getCode(req.params.actionID)
        .then(function(code) {
            var script = new vm.Script(code);
            var context = new vm.createContext({
                player: player,
                data: parseInt(req.body.quantity)
            });
            player.actions = [];
            script.runInContext(context);
            db.refineActions(req.params.game, req.params.scene, player.actions)
                .then(function() {
                    res.json(player.actions);
                });
        });
});

app.post('/:game/remove_item/:item/:amount', function(req, res) {
    var player = new Player(req.session.game[req.params.game]);
    var item = req.params.item;
    var amount = parseInt(req.params.amount);
    player.actions = [];
    if (isNaN(amount) || amount > player.game_data.items[item].amount || amount < 0) return;
    else {
        player.removeItem(item, amount);
        res.json(player.actions);
    }
});

app.post('/:game/new_card', function(req, res) {
    var player = new Player(req.session.game[req.params.game]);
    player.actions = [];
    if (player.hasItem('悠遊卡')) {
        player.alertWords('尼還有卡啊不要那麼貪心啦(´・ω・｀)');
    } else if (player.game_data.states.inTrashcan_c === 'yes' || player.game_data.states.inTrashcan_e === 'yes') {
        player.alertWords('先把卡從垃圾桶撿回來好嗎(´・ω・｀)卡卡很貴的OUO');
    } else if (player.game_data.items['錢'].amount < 100) {
        player.alertWords('尼錢錢不夠哦，乖乖去撿錢錢啦ヽ(✿ﾟ▽ﾟ)ノ');
    } else {
        player.setItem('錢', {
            amount: player.game_data.items['錢'].amount - 100
        });
        player.setItem('悠遊卡', {
            amount: 1,
            money: 0
        });
    }
    res.json(player.actions);
});


app.get('/:game/scene/:scene', function(req, res) {
    var SID = req.params.scene;
    var scene = {}
    Promise.all([
        db.getBgIID(SID)
        .then(db.getImageInfo)
        .then(function(info) {
            scene.scene = info.path;
        }),
        db.getSceneMap(SID)
        .then(function(map) {
            scene.map = map;
        }),
        db.getImageItemsAndBackgroundItems(SID)
        .then(function(data) {
            scene.images = data[0];
            scene.background = data[1];
        })
    ]).then(function() {
        res.json(scene);
    });
});

app.post('/:game/save', function(req, res) {
    var str = JSON.stringify(req.session.game[req.params.game]);
    db.saveStatus(req.params.game, req.body.id, str)
        .then(function() {
            res.send('Pusheen is happy!');
        });
});

app.post('/:game/load', function(req, res) {
    db.loadStatus(req.params.game, req.body.id)
        .then(function(str) {
            req.session.game[req.params.game] = JSON.parse(str);
            res.send('Pusheen is eating doughnuts!');
        });
});

app.post('/:game/reset', function(req, res) {
    req.session.game[req.params.game] = null;
    res.send('Pusheen finds new food!');
});

/* Start the Server */
db.connect().then(function() {
    app.listen(10001, function(req, res) {
        console.log('listening to 10001!');
    });
});