var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'GSGM',
  password: 'gsgm',
  database: 'GSGM'
});

var db = {
    connect: function() {
        return new Promise(function(resolve, reject) {
            connection.connect((err)=>{
                if(err) {
                    console.error('error connecting: '+err.stack);
                    reject(err);
                }
                resolve();
            });
        });
    },
    query: function(query_str){
        return new Promise(function(resolve, reject) {
            connection.query(query_str,
                function(error, results, fields){
                    if(error) {
                        console.error(error);
                        reject(error);
                    }
                    resolve(results, fields);
            });
        })
    },
    getBgIID: function(SID) {
        return db.query('SELECT bgIID FROM scene WHERE SID='+SID+';')
            .then(function(results, fields) {
                return results[0].bgIID;
            });
    },
    getImageInfo: function(IID) {
        return db.query('SELECT `usage`, name, format, width, height FROM image WHERE IID='+IID+';')
            .then(function(results, fields) {
                return {
                    path: './static/GMimages/'+results[0].usage+'/'+results[0].name+'.'+results[0].format,
                    width: results[0].width,
                    height: results[0].height
                };
            });
    },
    getSceneMap: function(SID) {
        return db.query('SELECT shape, coords, AID FROM scene_map WHERE SID='+SID+';')
            .then(function(results, fields){
                var map = '<map name="scene-map" class="now">';
                for(var i in results) {
                    var shape = results[i].shape;
                    var coords = results[i].coords;
                    var AID = results[i].AID;
                    map += '<area shape="'+shape+'" coords="'+coords+'" onClick="doAction('+AID+')" />';
                }
                map +='</map>';
                return map;
            });
    },
    getImageItemsAndBackgroundItems: function(SID) {
        return db.query('SELECT id, IID, type, x, y, AID FROM scene_items WHERE SID='+SID+';')
            .then(function(items) {
                var imageItems = [], backgroundItems = [];
                for(var i in items){
                    if(items[i].type==='image')
                        imageItems.push(db.getImageItem(items[i]));
                    else
                        backgroundItems.push(db.getBackgroundItem(items[i]));
                }
                return Promise.all([Promise.all(imageItems), Promise.all(backgroundItems)]);
            });
    },
    getImageItem: function(item) {
        return Promise.all([db.getImageInfo(item.IID), db.getItemMap(item.id)])
            .then(function(data) {
                var info = data[0], map = data[1];
                var res = {};
                res.useMap = 'item-'+item.id;
                res.src = info.path;
                res.width = info.width;
                res.height = info.height;
                res.x = item.x;
                res.y = item.y;
                res.map = map;
                return res;
            });
    },
    getBackgroundItem: function(item) {
        return db.getImageInfo(item.IID)
            .then(function(info) {
                var res = {};
                res.url = 'url("'+info.path+'")';
                res.width = info.width;
                res.height = info.height;
                res.x = item.x;
                res.y = item.y;
                res.AID = item.AID;
                return res;
            });
    },
    getItemMap: function(IID){
        return db.query('SELECT shape, coords, AID FROM item_map WHERE IID='+IID+';')
            .then(function(results, fields){
                var map = '<map name="item-'+IID+'" class="now">';
                for(var i in results) {
                    var shape = results[i].shape;
                    var coords = results[i].coords;
                    var AID = results[i].AID;
                    map += '<area shape="'+shape+'" coords="'+coords+'" onClick="doAction('+AID+')" />';
                }
                map +='</map>';
                return map;
            });
    },
    getAID: function(SID, name) {
        if(name[0] == '$') return Promise.resolve(name);
        return db.query('SELECT AID FROM action WHERE SID='+SID+' AND name="'+name+'";')
            .then(function(results, fields) {
                if(results[0]) return results[0].AID;
                else return null;
            });
    },
    getSID: function(gameID, scene) {
        return db.query('SELECT SID FROM scene WHERE GID='+gameID+' AND name="'+scene+'";')
            .then(function(results, fields) {
                return results[0].SID;
            });
    },
    refineActions: function(GID, SID, actions) {
        var querys = [];
        for (let i in actions) {
            if (actions[i].type === 'dialogInput') {
                querys.push(db.getAID(SID, actions[i].action)
                    .then(function(AID) {
                        actions[i].action = AID;
                    })
                );
            } else if (actions[i].type === 'dialogChoice') {
                for (let j in actions[i].options) {
                    querys.push(db.getAID(SID, actions[i].options[j][1])
                        .then(function(AID) {
                            actions[i].options[j][1] = AID;
                        })
                    );
                }
            } else if (actions[i].type === 'move') {
                querys.push(db.getSID(GID, actions[i].scene)
                    .then(function(SID) {
                        actions[i].scene = SID;
                    })
                );
            }
        }
        return Promise.all(querys);
    }
}
module.exports = db;