var _url = "specialAm_";
//特殊牌型
cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    onLoad: function () {
        console.log("==================初始化specialAnimation==========");
        this.spAmNode = cc.find("Canvas/specialNode/specialCardType");
        this.spAmNode.active = false;
                
        var spAnimation = this.spAmNode.getComponent(cc.Animation); 
        spAnimation.on('finished',this.finishAnimation,this);

        this.initEventHandlers();
    },

    initEventHandlers:function(){
        var self = this;

        this.node.on('playSpAm',function(data){
            self.spData     = [];
            self.spData     = data.detail.spData
            var type        = self.spData[0].spType;
            self.playSpAnimation(type);
        });
    
    },

    playSpAnimation:function(type){
        console.log("=======特殊牌型type======",type);
        this.spAmNode.stopAllActions();
        this.spAmNode.active = true;
        this.spAmNode.getComponent(cc.Animation).play(_url+type);   
        this.noticeUpScore();
    },

    noticeUpScore:function(){
        var self = this;
        if(self.spData === null || self.spData.length < 1){
            return;
        }

        //获取自己的分数 先更新自己的分数
        var mySocre = self.spData[cc.vv.gameNetMgr.seatIndex].mySocre;
        cc.vv.gameNetMgr.dispatchEvent("upScore",{score:mySocre,seat:cc.vv.gameNetMgr.seatIndex});

        //更新其他玩家分数
        for( var i = 0 ; i < self.spData.length ; i ++){
            var obj = self.spData[i];
            var _bseat = obj.bseat;
            var type   = obj.spType;
            //当前玩家总分数 和特殊牌型的分数 累加
            var totalScore = obj.totalScore;
            cc.vv.gameNetMgr.dispatchEvent("upScore",{score:totalScore,seat:_bseat});
        }
    },

    finishAnimation:function(event){
        this.spAmNode.getComponent(cc.Animation).stop();
        this.spAmNode.active = false;
    },
  
});
