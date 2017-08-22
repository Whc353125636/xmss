//牌总张数
var cardTotal = 13;
var holdPoint = -241;

var holdsName = ["myself","right","up","left"]
//自己手牌中心
var cardClass = cc.Class({
    extends: cc.Component,

    statics: {
        myCardArr:[],
    },

    properties: {
        timeIndex:0,
        myholds:null,
        startPoint:null,
    },

    onLoad: function () 
    {
        this.initView();
        this.initHandEvent();
    },

    initView:function()
    {   
        //所有方位节点
        this.holdsList = {};
        //所有方位牌组
         this.otherCardNodeList = {};

        var _url = "Canvas/game/";
        for(var i = 0 ; i < 4 ; i ++){
            var _holdsNode = cc.find(_url + holdsName[i]);
            this.holdsList[holdsName[i]] = _holdsNode;
            cc.vv.utils.extChildren(_holdsNode.getChildByName("holds"), cardTotal, ()=>{});
        }
        //自己的手牌组节点
        this.myholds        = this.holdsList["myself"].getChildByName("holds");
        cardClass.myCardArr = this.mySelfCard = this.myholds.getComponentsInChildren("MyCard");

        //其他玩家牌节点
        for(var j = 1; j < 4; j ++){
            var _hodeNode = this.holdsList[holdsName[j]];
            var _holdCardList = _hodeNode.getComponentsInChildren("BackCardView");
            this.otherCardNodeList[holdsName[j]] = _holdCardList;
            for( var z = 0 ; z < _holdCardList.length ; z ++){
                var _cardNode = _holdCardList[z];
                _cardNode.init(z);
            }
        }
    },

    initHandEvent:function()
    {
        var self = this;
        self.node.on('upHandCard',function(data){
            self.upHandCardView(data.detail)
        });

        self.node.on('upHandCardState',function(data){
             self.upCheckCardState(data.detail)
        });

        this.node.on("resetCard",function(data){
            self.resetCard();
        });

        self.node.on("startCardAn",function(data){
            self.sendCard(data.detail);
        });

        self.node.on("moveCandView",function(data){   
            self.resetCard(data.detail.seat);             
        });
    },

     /**
     * 控制牌节点的y轴变化
     * @ checkCardData 升起的牌值组
     * @ bool 升起还是落下 同时更新升起的牌组数据
     */ 
    upCheckCardState:function(checkData){
        var bool = checkData.bool;
        var data = checkData.data;

        for( var i = 0 ; i < data.length ; i ++ )
        {
            var _cardValue = data[i];
            for( var j = 0 ; j < this.mySelfCard.length; j ++){
                var _cardNode = this.mySelfCard[j];
                if( _cardNode.cardNum === _cardValue){
                    _cardNode.setCardNodeY(bool);
                    break;
                }
            }
        }
        cc.vv.RichardCardManager.upCheckCardData(data,bool);
    },

    /**
     * 更新自己手牌界面 bool true增加
     */
    upHandCardView:function(cardData){
        var bool = cardData.bool;
        var data = cardData.data;
        for( var i = 0 ; i < data.length ; i ++)
        {
            var value = data[i];
            for( var j = 0 ; j < this.mySelfCard.length ; j ++)
            {
                var _cardNode = this.mySelfCard[j];
                if(_cardNode.cardNum === 0 && bool === true){
                     _cardNode.setCard(value);
                     break;
                }else{
                    if(_cardNode.cardNum === value ){
                        if(bool === false){
                            _cardNode.setCard(0);
                            break;
                        }
                    }
                }
            }
        }
        this.refreshViewPos();
        //判断三墩牌是否选好
        var bool = cc.vv.RichardCardManager.getTypeButtonState();
        if(bool === true){
            //所有牌型按钮置灰
            cc.vv.gameNetMgr.dispatchEvent("AllBtnStopState");
        }else{
            cc.vv.gameNetMgr.dispatchEvent("upAllBtnState");
        }
        this.refreshSlefCard();
    },

    /**更新自己牌容器的位置*/
    refreshViewPos:function(){
        var cardList = cc.vv.RichardCardManager.getEffectiveCard();
        var len = (cardTotal- cardList.length);
        this.myholds.x = (len * 40 >> 1) + holdPoint;
    },

    /**刷新自己的牌*/
    refreshSlefCard:function(){
        var _selfCard = cc.vv.RichardCardManager.getEffectiveCard();
        _selfCard.sort(this.sortCardValue);
        for( var i = 0 ; i < _selfCard.length ; i ++){
            var _cardNode = _selfCard[i]
            _cardNode.upCardData(i);
        }
    },
    
    /**从大到小排序*/
    sortCardValue:function(a,b){
        return b.cardValue - a.cardValue;      
    },

    getDirection:function(idx){
        if(idx === 3){
            return 2;
        }else if(idx === 1){
            return 0;
        }else if(idx === 2){
            return 1;
        }
        return -1;
    },
    
    sendCard:function(data)
    {
        var self = this;
        //是否需要播放发牌动画
        var isAnimation = data.bool;
        //玩家座位
        var seatIndex   = data.seat;
        var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatIndex);

        var mySendCardAm = function(){
            self.myholds.x      = holdPoint;
            var _index          = 0;
            var cardNodeList    = self.mySelfCard;
            var _cardTarget     =  cc.vv.RichardCardManager.creatorTarget(data.card);

            if(isAnimation === true){
                _cardTarget.sort(self.sortCardValue);
                var timeIndex = 0;
                timeIndex = setInterval(function(){
                    if(_index >= cardTotal){   
                        clearInterval(timeIndex);
                        setTimeout(function(){
                            cc.vv.gameNetMgr.dispatchEvent("cardAmFinish",{bool:true});
                        },500);
                    }else{
                        cc.vv.audioMgr.playSFX("card/sendCardSound.mp3");
                        cardNodeList[_index].setCard(_cardTarget[_index].cardNum,_index);
                        cardNodeList[_index].startSendCard();
                        _index ++;
                    }
                },100);
            }
            else{
                _cardTarget.sort(self.sortCardValue);
                while(_index < cardTotal){
                    cardNodeList[_index].setCard(_cardTarget[_index].cardNum,_index);
                    cardNodeList[_index].startSendCard();
                    _index ++;
                }
                cc.vv.gameNetMgr.dispatchEvent("cardAmFinish",{bool:true});
            }
        };
        var rightSendCardAm = function(){
            var _holdCardList   = self.otherCardNodeList[holdsName[localIndex]];
            var timeIndex  = 0;
            var _cardIndex  = 0;
            var _direction  = self.getDirection(localIndex);
            if(isAnimation === true){
                timeIndex = setInterval(function(){
                    if(_cardIndex >= 13){
                        clearInterval(timeIndex);
                    }else{
                        _holdCardList[_cardIndex].startAn(_direction);
                        _cardIndex ++;
                    }
                },100);
            }
            else{
                while(_cardIndex < 13){
                     _holdCardList[_cardIndex].startAn(_direction);
                    _cardIndex ++;
                }
            }
        };
        var upSendCardAm = function(){
            var _holdCardList   = self.otherCardNodeList[holdsName[localIndex]];
            var timeIndex  = 0;
            var _cardIndex  = 0;
            var _direction  = self.getDirection(localIndex);
            if(isAnimation === true){
                timeIndex = setInterval(function(){
                    if(_cardIndex >= 13){
                        clearInterval(timeIndex);
                    }else{
                        _holdCardList[_cardIndex].startAn(_direction);
                        _cardIndex ++;
                    }
                },100);
            }
            else{
                while(_cardIndex < 13){
                     _holdCardList[_cardIndex].startAn(_direction);
                    _cardIndex ++;
                }
            }
        };
        var leftSendCardAm = function(){
            var _holdCardList   = self.otherCardNodeList[holdsName[localIndex]];
            var timeIndex  = 0;
            var _cardIndex  = 0;
            var _direction  = self.getDirection(localIndex);
            if(isAnimation === true){
                timeIndex = setInterval(function(){
                    if(_cardIndex >= 13){
                        clearInterval(timeIndex);
                    }else{
                        _holdCardList[_cardIndex].startAn(_direction);
                        _cardIndex ++;
                    }
                },100);
            }
            else{
                while(_cardIndex < 13){
                     _holdCardList[_cardIndex].startAn(_direction);
                    _cardIndex ++;
                }
            }
        };
        if(seatIndex === cc.vv.gameNetMgr.seatIndex){
            mySendCardAm();
        }else if(localIndex === 1){
            rightSendCardAm();
        }else if(localIndex === 2){
            upSendCardAm();
        }else if(localIndex === 3){
            leftSendCardAm();
        }
    },

    resetCard:function(seat){
        var self = this; 
        var _localIndex     =  cc.vv.gameNetMgr.getLocalIndex(seat);
        var resetMyAm = function(){
            //重置牌容器位置
            self.myholds.x = holdPoint;
            for( var i = 0 ; i < self.mySelfCard.length; i ++ ){
                var _node = self.mySelfCard[i];
                _node.setCard(0);
            }
        };
        var resetLeftAm = function(){         
            var _holdCardList   = self.otherCardNodeList[holdsName[_localIndex]];
            var _idx      = 0;
            while(_idx < 13){
                _holdCardList[_idx].reset();
                _idx ++;
            }
        };
        var resetUptAm = function(){
            var _holdCardList   = self.otherCardNodeList[holdsName[_localIndex]];
            var _idx      = 0;
            while(_idx < 13){
                _holdCardList[_idx].reset();
                _idx ++;
            }
        };
        var resetRightAm = function(){
            var _holdCardList   = self.otherCardNodeList[holdsName[_localIndex]];
            var _idx      = 0;
            while(_idx < 13){
                _holdCardList[_idx].reset();
                _idx ++;
            }
        };

        if(seat === cc.vv.gameNetMgr.seatIndex){
            resetMyAm();
        }else if(_localIndex === 1){
            resetRightAm();
        }else if(_localIndex === 2){
            resetUptAm();
        }else if(_localIndex === 3){
            resetLeftAm();
        }     
    },

});
