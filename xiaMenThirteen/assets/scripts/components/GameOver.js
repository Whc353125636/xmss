cc.Class({
    extends: cc.Component,

    properties: {
        _gameover:null,
        _gameresult:null,
        _seats:[],
        //游戏是否已结束
        _isGameEnd:false,
        _win:null,
        _lose:null,
    },

    onLoad: function ()
    {
        if(cc.vv == null){ return; }
        if(cc.vv.gameNetMgr.conf == null){ return;}
        //当局结算
        this._gameover = this.node.getChildByName("game_over");
        this._gameover.active = false;
        //总结算
        this._gameresult = this.node.getChildByName("game_result");
             
        this._win = this._gameover.getChildByName("win");
        this._lose = this._gameover.getChildByName("lose");
          
        var wanfa = this._gameover.getChildByName("wanfa").getComponent(cc.Label);
        wanfa.string = cc.vv.gameNetMgr.getWanfa();
        
        var listRoot = this._gameover.getChildByName("result_list");
        this.listSeat = listRoot.children;

        cc.vv.utils.extChildren(this.listSeat[0].getChildByName('pai'), 13, (pos, i)=>{(i===3) && (pos.x += 300); (i ===8)&&(pos.x += 300);pos.x += 55});
        cc.vv.utils.extChildren(listRoot, 4, pos=>pos.y -= 115);

        for(var i = 0; i < 4; ++i){
            var sn              = this.listSeat[i];
            sn.active           = false;
            var viewdata        = {};
            viewdata.username   = sn.getChildByName('username').getComponent(cc.Label);
            viewdata.score      = sn.getChildByName('score').getComponent(cc.Label);
            viewdata.painode    = sn.getChildByName('pai');
            viewdata.card       = viewdata.painode.children;
            this._seats.push(viewdata);
        }
        this.initEventHandlers();        
    },

    initEventHandlers:function(){
        var self = this;
        this.node.on('game_over',function(data){self.onGameOver(data.detail);});       
        this.node.on('game_end',function(data){self._isGameEnd = true;});
    },
    
    onGameOver(data)
    {
        if(data.length == 0){
            this._gameresult.active = true;
            return;
        }

        this._gameover.active = true;
        this._win.active  = false;
        this._lose.active = false;

        var bool = this.getResultState(data);
        if(bool === true){
            this._win.active  = true;
        }else{
           this._lose.active = true; 
        }
        
        for(var i = 0; i < data.length; ++i){
            this.listSeat[i].active = true;
        }          
        for(var i = 0; i < data.length; ++i){
            var seatView             = this._seats[i];
            var userData             = data[i]; 
            var seat                 = userData.seat;

            if(userData.round_score > 0)
                seatView.score.string    =  "+" + userData.round_score;
            else
                 seatView.score.string   =  userData.round_score; 
            
            seatView.username.string = cc.vv.gameNetMgr.seats[seat].name;
            this.upResultItem(seatView.card,userData.out_card);          
        }
    },

    upResultItem:function(nodeList,cardList){
        for(var i = 0 ; i < cardList.length; i ++){
            var _node = nodeList[i];
            var value = cardList[i];
            if(_node !== null){
                var flower      = cc.vv.RichardCardManager.getCardFlorerColor(value);
                var cardValue   = cc.vv.RichardCardManager.getCardValue(value);
                var url         = cc.vv.RichardCardManager.cardUrl + flower+ "_v_" + cardValue;
                var sp          = _node.getComponent(cc.Sprite);
                sp.spriteFrame  = cc.vv.xmssManger.cardAtlas.getSpriteFrame(url);
            }
        }
    },

    getResultState:function(data){
        var bool = false;
        var seat = cc.vv.gameNetMgr.seatIndex;
        var obj = data[seat];
        if(obj !== null){
            if(obj.score >= 0){
                bool = true;
            }else{
                bool = false;
            }
        }
        return bool;
    },
    
    onBtnReadyClicked:function(){
        if(this._isGameEnd){
            this._gameresult.active = true;
        }
        else{
            cc.vv.net.send('ready');   
        }
        this._gameover.active = false;
    },
    
    onBtnShareClicked:function(){
        console.log("onBtnShareClicked");
    }

});
