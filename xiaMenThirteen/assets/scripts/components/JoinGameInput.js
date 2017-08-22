cc.Class({
    extends: cc.Component,

    properties: {
        nums:{
            default:[],
            type:[cc.Label]
        },
        _inputIndex:0,
    },

    onLoad: function () {
        
    },
    
    onEnable:function(){
        this.onResetClicked();
    },
    
    onInputFinished:function(roomId){
        cc.vv.userMgr.enterRoom(roomId,function(ret){
            if(ret.errcode == 0){
                this.node.active = false;
            }
            else{
                var content = "房间["+ roomId +"]不存在，请重新输入!";
                if(ret.errcode == 4){
                    content = "房间["+ roomId + "]已满!";
                }
                cc.vv.alert.show("提示",content);
                this.onResetClicked();
            }
        }.bind(this)); 
    },
    
    onInput:function(num){
        cc.vv.audioMgr.playSFX("btnClick.mp3");
        if(this._inputIndex >= this.nums.length){
            return;
        }
        this.nums[this._inputIndex].string = num;
        this._inputIndex += 1;
        
        if(this._inputIndex == this.nums.length){
            var roomId = this.parseRoomID();
            console.log("ok:" + roomId);
            this.onInputFinished(roomId);
        }
    },
    
    onN0Clicked:function(){
        this.onInput(0);  
    },
    onN1Clicked:function(){
        this.onInput(1);  
    },
    onN2Clicked:function(){
        this.onInput(2);
    },
    onN3Clicked:function(){
        this.onInput(3);
    },
    onN4Clicked:function(){
        this.onInput(4);
    },
    onN5Clicked:function(){
        this.onInput(5);
    },
    onN6Clicked:function(){
        this.onInput(6);
    },
    onN7Clicked:function(){
        this.onInput(7);
    },
    onN8Clicked:function(){
        this.onInput(8);
    },
    onN9Clicked:function(){
        this.onInput(9);
    },

    onResetClicked:function(){
        cc.vv.audioMgr.playSFX("btnClick.mp3");
        for(var i = 0; i < this.nums.length; ++i){
            this.nums[i].string = "";
        }
        this._inputIndex = 0;
    },

    onDelClicked:function(){
        cc.vv.audioMgr.playSFX("btnClick.mp3");
        if(this._inputIndex > 0){
            this._inputIndex -= 1;
            this.nums[this._inputIndex].string = "";
        }
    },

    parseRoomID:function(){
        var str = "";
        for(var i = 0; i < this.nums.length; ++i){
            str += this.nums[i].string;
        }
        return str;
    }
});
