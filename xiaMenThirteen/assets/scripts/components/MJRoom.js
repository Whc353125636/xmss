cc.Class({
    extends: cc.Component,

    properties: {
        lblRoomNo:{
            default:null,
            type:cc.Label
        },
        _seats:[],
        _seats2:[],
        _timeLabel:null,
        _voiceMsgQueue:[],
        _lastPlayingSeat:null,
        _playingSeat:null,
        _lastPlayTime:null,
    },

    onLoad: function () {
        if(cc.vv == null){
            return;
        }     
        this.initView();
        this.initSeats();
        this.initEventHandlers();
    },
    
    initView:function()
    {
        var prepare = this.node.getChildByName("prepare");
        var seats = prepare.getChildByName("seats");
        for(var i = 0; i < seats.children.length; ++i){
            this._seats.push(seats.children[i].getComponent("Seat"));
        }
        
        this.refreshBtns();
        
        this.lblRoomNo = cc.find("Canvas/infobar/Z_room_txt/New Label").getComponent(cc.Label);
        this._timeLabel = cc.find("Canvas/infobar/time").getComponent(cc.Label);
        this.lblRoomNo.string = cc.vv.gameNetMgr.roomId;
        var gameChild = this.node.getChildByName("game");
        var sides = ["myself","right","up","left"];

        for(var i = 0; i < sides.length; ++i){
            var sideNode = gameChild.getChildByName(sides[i]);
            var seat = sideNode.getChildByName("seat");
            var ss   = seat.getComponent("Seat");
            this._seats2.push(ss);
        }
        var btnWechat = cc.find("Canvas/prepare/btnWeichat");
        if(btnWechat){
            cc.vv.utils.addClickEvent(btnWechat,this.node,"MJRoom","onBtnWeichatClicked");
        }
        
        
        var titles = cc.find("Canvas/typeTitle");
        for(var i = 0; i < titles.children.length; ++i){
            titles.children[i].active = false;
        }
    },
    
    refreshBtns:function(){
        var prepare = this.node.getChildByName("prepare");
        var btnExit = prepare.getChildByName("btnExit");
        var btnDispress = prepare.getChildByName("btnDissolve");
        var btnWeichat = prepare.getChildByName("btnWeichat");
        var btnBack = prepare.getChildByName("btnBack");
        var isIdle = cc.vv.gameNetMgr.numOfGames == 0;
        
        btnExit.active = !cc.vv.gameNetMgr.isOwner() && isIdle;
        btnDispress.active = cc.vv.gameNetMgr.isOwner() && isIdle;
        
        btnWeichat.active = isIdle;
        btnBack.active = isIdle;
    },
    
    initEventHandlers:function()
    {
        var self = this;
        this.node.on('new_user',function(data){
            self.initSingleSeat(data.detail);
        });
        
        this.node.on('user_state_changed',function(data){
            self.initSingleSeat(data.detail);
        });
        
        this.node.on('game_begin',function(data){
            self.refreshBtns();
            self.initSeats();
        });
        
        this.node.on('game_num',function(data){
            self.refreshBtns();
        });
                
        this.node.on('voice_msg',function(data){
            var data = data.detail;
            self._voiceMsgQueue.push(data);
            self.playVoice();
        });
        
        this.node.on('chat_push',function(data){
            var data = data.detail;
            var idx = cc.vv.gameNetMgr.getSeatIndexByID(data.sender);
            var localIdx = cc.vv.gameNetMgr.getLocalIndex(idx);
            self._seats[localIdx].chat(data.content);
            self._seats2[localIdx].chat(data.content);
        });
        
        this.node.on('quick_chat_push',function(data){
            var data = data.detail;
            var idx = cc.vv.gameNetMgr.getSeatIndexByID(data.sender);
            var localIdx = cc.vv.gameNetMgr.getLocalIndex(idx);
            
            var index = data.content;
            var info = cc.vv.chat.getQuickChatInfo(index);
            self._seats[localIdx].chat(info.content);
            self._seats2[localIdx].chat(info.content);
            
            cc.vv.audioMgr.playSFX(info.sound);
        });
        
        this.node.on('emoji_push',function(data){
            var data = data.detail;
            var idx = cc.vv.gameNetMgr.getSeatIndexByID(data.sender);
            var localIdx = cc.vv.gameNetMgr.getLocalIndex(idx);
            console.log(data);
            self._seats[localIdx].emoji(data.content);
            self._seats2[localIdx].emoji(data.content);
        });
    },
    
    initSeats:function(){
        var seats = cc.vv.gameNetMgr.seats;
        if(seats === null) return;
        for(var i = 0; i < seats.length; ++i){
            this.initSingleSeat(seats[i]);
        }
    },
    
    initSingleSeat:function(seat)
    {
        var index = cc.vv.gameNetMgr.getLocalIndex(seat.seatindex);
        var isOffline = !seat.online;
        var isZhuang = false;
        // var isZhuang = seat.seatindex == cc.vv.gameNetMgr.button;
        
        console.log("isOffline:" + isOffline);
        
        this._seats[index].setInfo(seat.name,seat.score);
        this._seats[index].setReady(seat.ready);
        this._seats[index].setOffline(isOffline);
        this._seats[index].setID(seat.userid);
        this._seats[index].voiceMsg(false);
        
        this._seats2[index].setInfo(seat.name,seat.score);
        this._seats2[index].setZhuang(isZhuang);
        this._seats2[index].setOffline(isOffline);
        this._seats2[index].setID(seat.userid);
        this._seats2[index].voiceMsg(false);
    },
    
    //显示面板
    onBtnSettingsClicked:function(){
        cc.vv.audioMgr.playSFX("btnClick.mp3");
        cc.vv.popupMgr.showSettings();   
    },
 
    //返回大厅
    onBtnBackClicked:function(){
         cc.vv.audioMgr.playSFX("btnClick.mp3");
        cc.vv.alert.show("返回大厅","返回大厅房间仍会保留，快去邀请大伙来玩吧！",function(){
            cc.director.loadScene("hall");    
        },true);
    },
    
    onBtnChatClicked:function(){
        
    },
    
    //分享
    onBtnWeichatClicked:function(){
         cc.vv.audioMgr.playSFX("btnClick.mp3");
        cc.vv.anysdkMgr.share("厦门麻将房号:" + cc.vv.gameNetMgr.roomId + " 玩法:" + cc.vv.gameNetMgr.getWanfa());
    },
    
    //房间按钮申请解散房间
    onBtnDissolveClicked:function(){
        cc.vv.audioMgr.playSFX("btnClick.mp3");
        cc.vv.alert.show("解散房间","解散房间不扣房卡，是否确定解散？",function(){
            cc.vv.net.send("dispress");    
        },true);
    },
    
    //退出游戏
    onBtnExit:function(){
        cc.vv.audioMgr.playSFX("btnClick.mp3");
        cc.vv.net.send("exit");
    },
    
    playVoice:function(){
        if(this._playingSeat == null && this._voiceMsgQueue.length){
            console.log("playVoice2");
            var data = this._voiceMsgQueue.shift();
            var idx = cc.vv.gameNetMgr.getSeatIndexByID(data.sender);
            var localIndex = cc.vv.gameNetMgr.getLocalIndex(idx);
            this._playingSeat = localIndex;
            this._seats[localIndex].voiceMsg(true);
            this._seats2[localIndex].voiceMsg(true);
            
            var msgInfo = JSON.parse(data.content);
            
            var msgfile = "voicemsg.amr";
            console.log(msgInfo.msg.length);
            cc.vv.voiceMgr.writeVoice(msgfile,msgInfo.msg);
            cc.vv.voiceMgr.play(msgfile);
            this._lastPlayTime = Date.now() + msgInfo.time;
        }
    },
    
    update: function (dt) {
        var minutes = Math.floor(Date.now()/1000/60);
        if(this._lastMinute != minutes){
            this._lastMinute = minutes;
            var date = new Date();
            var h = date.getHours();
            h = h < 10? "0"+h:h;
            
            var m = date.getMinutes();
            m = m < 10? "0"+m:m;
            this._timeLabel.string = "" + h + ":" + m;             
        }
        
        
        if(this._lastPlayTime != null){
            if(Date.now() > this._lastPlayTime + 200){
                this.onPlayerOver();
                this._lastPlayTime = null;    
            }
        }
        else{
            this.playVoice();
        }
    },
    
        
    onPlayerOver:function(){
        cc.vv.audioMgr.resumeAll();
        console.log("onPlayCallback:" + this._playingSeat);
        var localIndex = this._playingSeat;
        this._playingSeat = null;
        this._seats[localIndex].voiceMsg(false);
        this._seats2[localIndex].voiceMsg(false);
    },
    
    onDestroy:function(){
        cc.vv.voiceMgr.stop();
//        cc.vv.voiceMgr.onPlayCallback = null;
    }
});
