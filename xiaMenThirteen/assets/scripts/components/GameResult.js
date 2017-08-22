cc.Class({
    extends: cc.Component,

    properties: {
        _gameresult:null,
        _item:[],
    },

    onLoad: function () 
    {
        if(cc.vv == null){return;}   
        this._gameresult = this.node.getChildByName("game_result");      
        this.timeLabel = this._gameresult.getChildByName("time").getComponent(cc.Label);

        var seats = this._gameresult.getChildByName("seats");
        cc.vv.utils.extChildren(seats, 4, pos=>pos.x += 300);
        var itemList = seats.children;
        
        var btnClose = cc.find("Canvas/game_result/btnClose");
        cc.vv.utils.addClickEvent(btnClose,this.node,"GameResult","onBtnCloseClicked");
         
        var btnShare = cc.find("Canvas/game_result/btnShare");
        cc.vv.utils.addClickEvent(btnShare,this.node,"GameResult","onBtnShareClicked");

        for(var i = 0; i < 4; ++i){
            var _itemNode           = itemList[i];
            _itemNode.active        = false;
            var viewdata            = {};
            viewdata.node           = _itemNode;
            viewdata.username       = _itemNode.getChildByName('name').getComponent(cc.Label);
            viewdata.score          = _itemNode.getChildByName('score').getComponent(cc.Label);
            viewdata.icon           = _itemNode.getChildByName('icon').getComponent("ImageLoader");
            viewdata.winner         = _itemNode.getChildByName('winner');
            viewdata.winner.active  = false;
            //打枪次数
            viewdata.shotTimes      = _itemNode.getChildByName('shotTimes').getComponent(cc.Label);
            //被打次数
            viewdata.beShotTimes    = _itemNode.getChildByName('beShotTimes').getComponent(cc.Label);
            //全垒打次数
            viewdata.allShotTimes   = _itemNode.getChildByName('allShotTimes').getComponent(cc.Label);
            //特殊次数
            viewdata.specCardTimes  = _itemNode.getChildByName('specCardTimes').getComponent(cc.Label); 
            this._item.push(viewdata);
        }       
        this.initEventHandlers();
    },

    initEventHandlers:function(){
        var self = this;           
        this.node.on('game_end',function(data){self.onGameEnd(data.detail);});
    },
       
    onGameEnd:function(data)
    {     
        console.log("==============game_end游戏结束=data=================",data);    
        if(data.length < 1){return;}
        var fixN = function (x) {return x < 10? "0"+x:x;}
        var date = new Date();
        this.timeLabel.string = [date.getFullYear(), "/", fixN(date.getMonth() + 1), "/", fixN(date.getDate()), " ", fixN(date.getHours()), ":", fixN(date.getMinutes()), ":", fixN(date.getSeconds())].join("");      
        var bigScore = this.getBigWinerScore(data);

        for( var j = 0 ; j < 4; j ++){
            var item = this._item[j];
            item.winner.active = false;
            item.node.active = false;
        }

        for(var i = 0; i < data.length; ++i){
            var obj                    = data[i];
            var _node                  = this._item[i];
            _node.node.active               = true;
            var userData               = cc.vv.gameNetMgr.seats[obj.seat];
            //更新头像
            _node.icon.setUserID(userData.userid);
            _node.username.string      = userData.name;
            
            if(bigScore === obj.total_score){
                _node.winner.active  = true;
            }else{
                _node.winner.active  = false;
            }
            _node.score.string         = obj.total_score;
            _node.shotTimes.string     = obj.shot_times;
            _node.beShotTimes.string   = obj.be_shot_times;
            _node.allShotTimes.string  = obj.all_shot_times;
            _node.specCardTimes.string = obj.spec_card_times;
        }  
    },

    getBigWinerScore:function(data){
        var socre = 0;
        for(var i = 0 ; i < data.length ; i ++ ){
            var obj = data[i];
            if(obj.total_score > socre){
                socre = obj.total_score;
            }
        }
        return socre;
    },
    
    onBtnCloseClicked:function(){
        cc.director.loadScene("hall");
    },
    
    onBtnShareClicked:function(){
        cc.vv.anysdkMgr.shareResult();
    }
});
