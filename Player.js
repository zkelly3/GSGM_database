function Player(session) {
    this.game_data = session;
    this.actions = [];
}

Player.prototype.dialogChoice = function(name, content, options){
    this.actions.push({
        type: 'dialogChoice',
        name: name,
        content: content,
        options: options,
    });
}

Player.prototype.dialogInput = function(name, content, action){
    this.actions.push({
        type: 'dialogInput',
        name: name,
        content: content,
        action: action,
    });
}

Player.prototype.hasItem = function(item){
    return item in this.game_data.items && this.game_data.items[item].amount>0;
}

Player.prototype.setItem = function(item, attrs){
    this.game_data.items[item] = this.game_data.items[item] || {};
    for(var attr in attrs){
        this.game_data.items[item][attr] = attrs[attr];
    }
    this.actions.push({
        type: 'set_item',
        item: item,
        attrs: attrs
    });
}

Player.prototype.moveTo = function(scene){ 
    this.game_data.present_scene = scene;
    this.actions.push({
        type: 'move',
        scene: scene
    });
}

Player.prototype.removeItem = function(item, amount){
    this.game_data.items[item].amount -= amount;
    this.actions.push({
        type: 'remove_item',
        item: item,
        amount: amount
    });
}

Player.prototype.alertWords = function(content){
    this.actions.push({
        type: 'alert',
        content: content
    });
}

module.exports = Player;