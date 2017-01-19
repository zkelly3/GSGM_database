var station_c = {
    machine: function(player){
        if(player.hasItem('悠遊卡')){
            player.dialogChoice('自己', '「诶~是不是該儲值一下了？」', [
                ['「儲就儲啊！誰怕誰啊！！！」', 'askValue'],
                ['「先姑且查一下裡面還剩多少錢好了...」', 'checkCard'],
                ['「不。區區悠遊卡是無法打倒我的決心的！票，票才是坐車該用的神聖之物！」', 'askTicket']
            ]);
        }
        else{
            if(player.hasItem('錢') >= 0){
                player.dialogChoice('自己', '「沒有悠遊卡的我就如喪家之犬...不，不是說了票才是尊貴之物嗎！」', [
                    ['「那麼，就投入票的懷抱吧！」', 'askTicket'],
                    ['「不，目前的我不需要依靠如此神聖之物過活。」', '$Close']
                ]);
            }
            else{
                player.dialogChoice('自己：', '「太悲哀了，沒了悠遊卡又無法抱票的佛腳，嗚啊啊啊啊啊啊啊...」',[]);
            }
        }
    },

    train_c: function(player){
        if(player.hasItem('悠遊卡') && player.hasItem('票')){
            if(player.game_data.items['悠遊卡'].money >= 0){
                player.dialogChoice('自己', '「要逼卡還是插入車票呢...？」', [
                    ['「逼卡。」', 'cardPay'],
                    ['「插入車票。」','ticketPay'],
                    ['「都不要。窩不會上車的！！！」','$Close']
                ]);
            }
            else{
                player.dialogChoice('自己', '「不遠處的站務員正在用眼神打探著我，我並不可疑，可疑的一定是他！真的要把票交給這種可疑的人嗎？」', [
                    ['「(放棄狀)交給他吧:(」', 'ticketPay'],
                    ['「不，不給！窩要去儲值！」', '$Close']
                ]);
            }
        }
        else if(player.hasItem('悠遊卡')){
            if(player.game_data.items['悠遊卡'].money >= 0){
                player.dialogChoice('自己', '「要用這張卡前往未知的彼岸嗎？」', [
                    ['「當然去！未知的彼岸代表著遙遠的光明，也就是...遙光！」', 'cardPay'],
                    ['「還是不了，未知的黑暗在等著我。我看穿所有陰謀了！」', '$Close']
                ]);
            }
            else{
                player.dialogChoice('自己', '「太悲哀了，無法逼卡也沒有票的人生，啊，就是如此的藍瘦香菇啊！」',[]);
            }
        }
        else if(player.hasItem('票')){
            player.dialogChoice('自己', '「不遠處的站務員正在用微笑掩飾對沒有卡的我的鄙視，一定是這樣的！真的要把票交給這種人嗎？」',[
                ['「(放棄狀)交給他吧:(」', 'ticketPay'],
                ['「不，不給！賭上我的一生我也不會放棄小票票的！」', '$Close']
            ]);
        }
        else{
            player.dialogChoice('自己', '「怎麼會如此悲哀，已經窮到只能靠撿錢過活了嗎...」',[]);
        }
    },

    trashcan_c: function(player){
        if(player.game_data.states.inTrashcan_c !=='yes' && player.hasItem('悠遊卡')){
            player.dialogChoice('自己', '「有個垃圾桶，要把悠遊卡丟掉嗎:D」', [
                ['「丟！都丟！！」', 'throwCard'],
                ['「窩對那麼低俗的事情沒興趣，窩要來撿錢錢。」', 'pickMoney'],
                ['「不想對垃圾桶做任何事。」', '$Close']
            ]);
        }
        else if (player.game_data.states.inTrashcan_c ==='yes'){
            player.dialogChoice('自己', '「剛剛丟的悠遊卡在垃圾桶裡面，要偷偷撿回來嗎？」', [
                ['「好吧，窩想念它惹。」', 'pickCard'],
                ['「誰管它啊，窩要先來撿錢錢。」', 'pickMoney'],
                ['「鼻要。窩不想看到它。」', '$Close']
            ]);
        }
        else if (player.game_data.states.inTrashcan_e === 'yes'){
            player.dialogChoice('自己', '「剛剛把悠遊卡丟在另一個垃圾桶了，要撿錢錢安慰自己嗎？」', [
                ['「豪QAQ」', 'pickMoney'],
                ['「不了，窩還要緬懷一下小卡卡QQ」', '$Close']
            ]);
        }
        else{
            player.dialogChoice('自己', '「垃圾桶裡閃閃發亮的好像是錢錢，要撿嗎？」', [
                ['「當然要！」', 'pickMoney'],
                ['「錢乃身外之物，還是算了。」', '$Close']
            ]);
        }
    },
    
    cardPay: function(player){
        player.setItem('悠遊卡', {money: player.game_data.items['悠遊卡'].money - 16});
        player.moveTo('station_e');
    },
    
    ticketPay: function(player){
        player.setItem('票', {amount: player.game_data.items['票'].amount - 1});
        player.moveTo('station_e');
    },
    
    askTicket: function(player){
        player.dialogInput('自己', '「一張票20元...要買幾張票呢？」', 'buyTicket');
    },
    
    buyTicket: function(player, data){
        if(data * 20 <= player.game_data.items['錢'].amount){
            player.setItem('票', {amount: player.game_data.items['票'].amount + data});
            player.setItem('錢', {amount: player.game_data.items['錢'].amount - data * 20});
            player.dialogChoice('自己', '「買了' + data + '張票。」', []);
        }
        else{
            player.dialogChoice('售票機', '「您所投入的金額不足，現在進行退幣的動作。」',[]);
        }
    },
    
    askValue: function(player){
        player.dialogInput('自己', '「要儲多少呢？」', 'addValue');
    },
    
    addValue: function(player, data){
        if(data <= player.game_data.items['錢'].amount){
            player.setItem('悠遊卡', {money: player.game_data.items['悠遊卡'].money + data});
            player.setItem('錢', {amount: player.game_data.items['錢'].amount - data});
            player.dialogChoice('售票機', '「您的悠遊卡目前餘額為' + player.game_data.items['悠遊卡'].money + '元」', []);
        }
        else{
            player.dialogChoice('售票機', '「您所投入的金額不足，現在將進行退幣的動作。」',[]);
        }
    },
    
    checkCard: function(player){
        player.dialogChoice('售票機', '「您的悠遊卡目前餘額為' + player.game_data.items['悠遊卡'].money + '元」', []);
    },
    
    throwCard: function(player){
        player.setItem('悠遊卡', {amount: 0});
        player.game_data.states.inTrashcan_c = 'yes';
        player.dialogChoice('自己', '「把悠遊卡丟到垃圾桶惹，真爽快！」', []);
    },
    
    pickMoney: function(player){
        player.setItem('錢', {amount: player.game_data.items['錢'].amount + Math.floor(Math.random()*50)});
        player.dialogChoice('自己', '「啊！！是神的錢錢！」',[]);
    },
    
    pickCard: function(player){
        player.setItem('悠遊卡', {amount: 1});
        player.game_data.states.inTrashcan_c = 'no';
        player.dialogChoice('自己', '「把悠遊卡撿回來惹ˊ_>ˋ」', []);
    }
}

module.exports = station_c;