var leftPos = 3;
cc.Class({
    extends: cc.Component,

    properties: {
        leftNode:null,
        timeIndex:0,
        leftHolds:null,
    },

    onLoad: function ()
    {
        this.leftNode = cc.find("Canvas/game/left");
        this.timeIndex = 0;
        this.initView();
        this.initHandEvent();
    },

    initView:function(){
        cc.vv.utils.extChildren(this.leftNode.getChildByName("holds"), 13, ()=>{});
        this.leftHolds = this.leftNode.getChildByName("holds").getComponentsInChildren("BackCardView");
        for(var i = 0 ; i < this.leftHolds.length ; i ++){
            this.leftHolds[i].init(i);
        }
    },

    initHandEvent:function()
    {
        var self = this;
        this.node.on("startCardAn",function(data){
            self.sendCard(data);
        });
        this.node.on("resetCardAn",function(data){
            self.resetAnimation();
        });

        this.node.on("moveCandView",function(data){
            var localIndex = cc.vv.gameNetMgr.getLocalIndex(data.detail.seat);
            if(localIndex === leftPos){
                self.resetAnimation();
            }       
        });
    },

    //隐藏并重置
    resetAnimation:function()
    {
        var _index      = 0;
        while(_index < 13){
            this.leftHolds[_index].resetPos();
            _index ++;
        }
    },

    //开始发牌
    sendCard:function(data)
    {
        if(this.isPlayAnimation() === false){
            return;
        }
        var self        = this;
        var _index      = 0;
        var _isAnimaton = data.detail.bool;
        if(_isAnimaton === true)
        {
            self.timeIndex  = 0;
            self.timeIndex = setInterval(function(){
                if(_index >= 13){
                    clearInterval(self.timeIndex);
                    return;
                }
                self.leftHolds[_index].startAn(2);
                _index ++;
            }
            ,100);
        }
        else
        {
            while(_index < 13){
                self.leftHolds[_index].startAn(2);
                _index ++;
            }
        }
    },

    isPlayAnimation:function()
    {
        var seats = cc.vv.gameNetMgr.seats;
        for(var i = 0 ; i < seats.length ; i ++){
            var _data = seats[i];
            if(_data !== null){
                var pos = cc.vv.gameNetMgr.getLocalIndex(_data.seatindex);
                if(pos === leftPos){
                    return true;
                }
            }
        }
        return false;
    },
});
