cc.Class({
    extends: cc.Component,

    properties: {    
        //游戏节点    
        gameRoot:cc.Node,
        //准备节点 
        prepareRoot:cc.Node,  
        //理牌节点
        putCardRoot:cc.Node,  
        //翻牌节点
        fanCardRoot:cc.Node,  
        //动画节点
        animationRoot:cc.Node,
        //特殊动画节点
        specialRoot:cc.Node,
    },
    
    onLoad: function ()
    {
        console.log("===================进入房间==============");

        if(!cc.sys.isNative && cc.sys.isMobile){
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }
        if(!cc.vv){
            cc.director.loadScene("loading");
            return;
        }

        var RichardCardManager = require("RichardCardManager");
        cc.vv.RichardCardManager = new RichardCardManager();
        cc.vv.RichardCardManager.init();

        this.addComponent("MyHandCardView");
        // this.addComponent("RightCardAn");
        // this.addComponent("LeftCardAn");
        // this.addComponent("UpCardAn");
        
        this.addComponent("RichardCardView");
        this.addComponent("ShowCardPanel");
        this.addComponent("ShotAnimation");
        this.addComponent("SpecialAnimation");

        this.addComponent("NoticeTip");
        this.addComponent("GameOver");
        this.addComponent("MJRoom");

        this.addComponent("GameResult");
        this.addComponent("Chat");
        this.addComponent("PopupMgr");
        this.addComponent("ReConnect");
        this.addComponent("Voice");
        this.addComponent("UserInfoShow");

        this.initEventHandlers();
        this.initView();

        this.prepareRoot.active = true;
        this.fanCardRoot.active = true;
        this.gameRoot.active    = false;
        this.specialRoot.active = false;
        //特殊牌型标识 0为没有
        this.specialType        = 0;
        this.onGameBeign();
        cc.vv.audioMgr.playBGM("bgm.mp3");
        // 通知服务端客户端场景加载完成 服务端发送数据
        cc.vv.net.send('ready');
    },

    initView:function(){
        
        this._gamecount = cc.find("Canvas/game/gamecount").getComponent(cc.Label);
        this._gamecount.string = "" + cc.vv.gameNetMgr.numOfGames + "/" + cc.vv.gameNetMgr.maxNumOfGames + "局";
    },

    initEventHandlers:function()
    {
        cc.vv.gameNetMgr.dataEventHandler = this.node;    
        //初始化事件监听器
        var self = this;
        
        //发牌
        this.node.on('game_holds',function(data){
            console.log("=======================发牌=========================");
            for( var i = 0 ; i < cc.vv.gameNetMgr.seats.length ; i ++){
                var _userData = cc.vv.gameNetMgr.seats[i];
                if(cc.vv.gameNetMgr.seatIndex === _userData.seatindex){
                    self.initHandCardData(_userData.holds,_userData.spec_card_type,true,cc.vv.gameNetMgr.seatIndex);
                }else{
                    self.initHandCardData(null,null,true,_userData.seatindex);
                }
            }
        });
        
        this.node.on('game_begin',function(data){
            //重置牌
            cc.vv.gameNetMgr.dispatchEvent("resetCard");
            self.onGameBeign();
        });
        
        //重连
        this.node.on('game_sync',function(data){
            self.gameSyncFun(data.detail);
        });

        //更新游戏局数
        this.node.on('game_num',function(data){
            self._gamecount.string = "" + cc.vv.gameNetMgr.numOfGames + "/" + cc.vv.gameNetMgr.maxNumOfGames + "局";
        });
        
        //游戏结束
        this.node.on('game_over',function(data){
            self.gameRoot.active    = false;
            self.prepareRoot.active = true;
        }); 

        //更新理牌面板
        this.node.on("upPutCardState",function(data){
            var bool = data.detail.bool;
            self.putCardRoot.active = bool;
        });

        //牌已发完
        this.node.on("cardAmFinish",function(data){
            var bool = data.detail.bool;
            if(self.specialType === 0){
                self.putCardRoot.active = bool;
                self.fanCardRoot.active = bool;
                cc.vv.gameNetMgr.dispatchEvent("upAllBtnState");
            }else{
                self.fanCardRoot.active = bool;
            }
        });

        //更新动画节点状态
        this.node.on("upAmNodeState",function(data){
            var bool = data.detail.bool;
            console.log("====更新动画节点状态==bool=========",bool);
            self.animationRoot.active = bool;
        });  
        
    },

    testBtn:function(){
        // this.aaa = !this.aaa;
        // console.log("====this.aaa=========",this.aaa);
        // this.fanCardRoot.active = this.aaa;
        // var seats = cc.vv.gameNetMgr.seats;
        // var seatData = seats[cc.vv.gameNetMgr.seatIndex];
        // this.onGameBeign();
        // cc.vv.gameNetMgr.dispatchEvent("startCardAn",{bool:true,card:[46, 12, 11, 58, 10, 9, 41, 8, 38, 54, 2, 34, 18]});

        var shotList = [{dShot:1,bShot:3,shotSocre:3}
                        // ,{dShot:1,bShot:0,shotSocre:3},{dShot:1,bShot:2,shotSocre:3},{dShot:1,bShot:3,shotSocre:3}
                        // ,{dShot:2,bShot:0,shotSocre:3},{dShot:2,bShot:1,shotSocre:3},{dShot:2,bShot:3,shotSocre:3}
                        // ,{dShot:3,bShot:0,shotSocre:3},{dShot:3,bShot:1,shotSocre:3},{dShot:3,bShot:2,shotSocre:3}
                    ];
        cc.vv.gameNetMgr.dispatchEvent("upAmNodeState",{bool:true});
        cc.vv.gameNetMgr.dispatchEvent("playShotAnimation",{shotData:shotList});

        // var ss = cc.vv.RichardCardManager.analysisCardResultData(arr);
        // console.log("====ss======",ss);
        // var as = cc.vv.RichardCardManager.analysisSortData(ss);
        // console.log("====ss======",as);
        // var ac = cc.vv.RichardCardManager.sortGroupValue(as);
        // console.log("====ss======",ac);
    },

    /**
     * @ cardList    自己手牌数据
     * @ spCardType  特殊牌型type
     * @ isAnimation 是否需要发牌动画
     */
    initHandCardData:function(cardList,spCardType,isAnimation,seat){
        cc.vv.gameNetMgr.dispatchEvent("startCardAn",{bool:isAnimation,card:cardList,seat:seat});
        if(spCardType > 0){ //特殊牌型
            self.specialType  = spCardType;
            var name = this.getSpCardName(spCardType);
            cc.vv.alert.show("提示","恭喜你获取特殊牌型:" + name,this.sureClick,0,this.cancelClick);
        }
    },

    //确认选择特殊牌型
    sureClick:function(){
        //显示扇形面板
        cc.vv.gameNetMgr.dispatchEvent("showBack",{seat:cc.vv.gameNetMgr.seatIndex,isSpCard:true});
    },

    //取消
    cancelClick:function(){
        self.putCardRoot.active = true;
        cc.vv.gameNetMgr.dispatchEvent("upAllBtnState");
    },

    onGameBeign:function()
    {
        var game = this.node.getChildByName("game");
        for (var i = 0; i < 4; ++i) {
            var side = cc.vv.xmssManger.getSide(i);
            var sideRoot = game.getChildByName(side);
            sideRoot.active = false;
        }        
        for(var i = 0; i < cc.vv.gameNetMgr.seats.length; ++i){
            var userData = cc.vv.gameNetMgr.seats[i];
            if(userData){
                var localIndex = cc.vv.gameNetMgr.getLocalIndex(userData.seatindex);          
                var side = cc.vv.xmssManger.getSide(localIndex);
                var sideRoot = game.getChildByName(side);
                sideRoot.active = true;
            }
        }
        if(cc.vv.gameNetMgr.gamestate == ""){
            return;
        }
        this.gameRoot.active      = true;
        this.prepareRoot.active   = false;
        this.fanCardRoot.active   = false;
        this.animationRoot.active = false;
    },

    //断线重连
    gameSyncFun:function(data)
    {
        console.log("======断线重连play_step==============",data.syncData.play_step);
        var self  = this;
        var syncData = data.syncData;
        if(syncData.play_step === 1){ //准备

        }
        else if(syncData.play_step === 2)//发牌
        {
            for(var i = 0 ; i < syncData.seats.length ; i ++ ){
                var _userData = syncData.seats[i];
                self.initHandCardData(_userData.holds,_userData.spec_card_type,true,_userData.seat);
            }
        }
        else if(syncData.play_step === 3)//理牌
        { 
            self.fanCardRoot.active = true;
            var isPutCard = self.myIsPutCard(syncData.seats);
            if(isPutCard === true){
                 self.putCardRoot.active = false;//理牌面板
            }else{
                 self.putCardRoot.active = true;
            }
            for(var i = 0 ; i < syncData.seats.length ; i ++)
            {
                var _userData = syncData.seats[i];
                if(_userData.is_outcard === true)//显示扇形牌背
                { 
                    if(_userData.spec_card_type > 0){
                        cc.vv.gameNetMgr.dispatchEvent("showBack",{seat:_userData.seat,isSpCard:true});
                    }else{
                        cc.vv.gameNetMgr.dispatchEvent("showBack",{seat:_userData.seat,isSpCard:false});
                    }
                }
                else{ 
                     self.initHandCardData(_userData.holds,_userData.spec_card_type,false,_userData.seat);
                }
            }      
        }
        else if(syncData.play_step === 4)//比牌
        { 
            self.putCardRoot.active = false;
            self.dispatchEvent("finishPutCard",{data:syncData.seats,bool:false});
            //通知结算倒计时
            cc.vv.gameNetMgr.dispatchEvent('push_notice',{time:5});
        }
    },

    getSpCardName:function(type){
        var typeName = "测试测试";
        switch(type)
        {
            case 20:
                typeName = "一条龙"
                break;
        }
        return  typeName;        
    },

    //自己是否摆好牌
    myIsPutCard:function(data){
        var isPutCard = false;
        for( var i = 0 ; i < data.length; i ++){
            var _userData = data[i];
            if(_userData.seat === cc.vv.gameNetMgr.seatIndex && _userData.is_outcard === true){
                isPutCard = true;
                return isPutCard;
            }
        }
        return isPutCard;
    },

    onDestroy:function(){
        console.log("onDestroy");
        if(cc.vv){
            cc.vv.gameNetMgr.clear();   
        }
    }
});
