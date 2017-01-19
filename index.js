var fs = require('fs');
var express = require('express');
var Player = require('./Player');
var bodyParser = require('body-parser');
var app = express();
var session = require('express-session');
var path = require('path');

app.use('/static', express.static(__dirname + '/static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'pusheen',
    cookie: {}
}));
app.use(function(req, res, next){
    if(!req.session.game){
        req.session.game = [];
    }
    next();
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/:game', function(req, res) {
    res.render('GM_2', { gameID: req.params.game });
});

app.get('/:game/sync', function(req, res) {
    if(!req.session.game[req.params.game]){
        req.session.game[req.params.game] = {};
        req.session.game[req.params.game].present_scene = 'station_c';
        req.session.game[req.params.game].items = {'錢': {amount: 0}, '悠遊卡': {amount: 1, money: 0}, '票': {amount: 0}};
        req.session.game[req.params.game].states = {'inTrashcan_c': 'no', 'inTrashcan_e': 'no'};
    }
    res.json(req.session.game[req.params.game]);
});

app.post('/:game/action/:scene/:action', function(req, res){
    var player = new Player(req.session.game[req.params.game]);
    var scene = require('./'+req.params.scene);
    player.actions = [];
    scene[req.params.action](player, parseInt(req.body.quantity));
    res.json(player.actions);
});

app.post('/:game/remove_item/:item/:amount', function(req, res){
    var player = new Player(req.session.game[req.params.game]);
    var item = req.params.item;
    var amount = parseInt(req.params.amount);
    player.actions = [];
    if(isNaN(amount) || amount > player.game_data.items[item].amount || amount < 0) return;
    else{
        console.log("in");
        player.removeItem(item, amount);
        res.json(player.actions);
    }        
});

app.post('/:game/new_card', function(req, res){
    var player = new Player(req.session.game[req.params.game]);
    player.actions = [];
    if(player.hasItem('悠遊卡')){
        player.alertWords('尼還有卡啊不要那麼貪心啦(´・ω・｀)');
    }
    else if(player.game_data.states.inTrashcan_c==='yes' || player.game_data.states.inTrashcan_e==='yes'){
        player.alertWords('先把卡從垃圾桶撿回來好嗎(´・ω・｀)卡卡很貴的OUO');
    }
    else if(player.game_data.items['錢'].amount<100){
        player.alertWords('尼錢錢不夠哦，乖乖去撿錢錢啦ヽ(✿ﾟ▽ﾟ)ノ');
    }
    else{
        player.setItem('錢', {amount: player.game_data.items['錢'].amount - 100});
        player.setItem('悠遊卡', {amount: 1, money: 0});
    }
    res.json(player.actions);
});
    

app.get('/:game/scene/:scene', function (req, res) {
    var scene = require('./static/maps/'+req.params.scene+'.json');
    res.json(scene);
});

app.post('/:game/save', function(req, res){
    var path = './saves/'+ req.body.id + '.json';
    var str = JSON.stringify(req.session.game[req.params.game]);
    fs.writeFileSync(path, str, 'utf8');
    res.send('Pusheen is happy!');
});

app.post('/:game/load', function(req, res){
    var path = './saves/'+ req.body.id + '.json';
    var str = fs.readFileSync(path, 'utf8');
    req.session.game[req.params.game] = JSON.parse(str);
    res.send('Pusheen is eating doughnuts!');
});

app.post('/:game/reset', function(req, res){
    req.session.game[req.params.game] = null;
    res.send('Pusheen finds new food!');
});

app.listen(10001, function(req, res){
    console.log('listening to 10001!');
});