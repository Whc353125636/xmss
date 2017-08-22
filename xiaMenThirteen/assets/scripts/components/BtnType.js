cc.Class({
    extends: cc.Component,

    properties: {
        commonSpriteFrame:cc.SpriteFrame,
        changeSpriteFrame:cc.SpriteFrame,
        cardTypeTxt:cc.Label,
    },

    init: function ()
    {
        this.btnTypeName       = "";
        this.currentCardTarget = null;
        //当前选择的牌型
        this.checkInde         = 0;     
    },

    //点击获取最佳的当前牌型
    clickEvent:function()
    { 
        if(this.currentCardTarget === null)
        {
            var handCardNode = cc.vv.RichardCardManager.getEffectiveCard();
            var handCardArr  = cc.vv.RichardCardManager.getCardNum(handCardNode);
            //获取最佳牌型对象
            var cardTarget  = cc.vv.RichardCardManager.getBestCardArr(this.btnTypeName,handCardArr);
            if(cardTarget.length > 0 ){
                this.currentCardTarget = cardTarget;
            }
        }
        if(this.currentCardTarget !== null){

            cc.vv.audioMgr.playSFX("btnClick.mp3");
            //分解对象
            var cardArr         = this.analysisData(this.currentCardTarget);
            var _checkUpCard    = cc.vv.RichardCardManager.getCheckUpCard();
            var floadCard       = cc.vv.RichardCardManager.removeFoldValue(cardArr,_checkUpCard);  
            //落下
            cc.vv.gameNetMgr.dispatchEvent("upHandCardState",{bool:false,data:floadCard}); 
            //升起
            cc.vv.gameNetMgr.dispatchEvent("upHandCardState",{bool:true,data:cardArr}); 
        }     
    },

    /**解析出每墩牌的牌值 返回一个数组 p1 p2 p3 是从1开始*/
    analysisData:function(data)
    {
        var obj = {};
        var len = data.length;
        var arr = [];
        if(this.checkInde < len ){
            if(this.checkInde === 0 && (this.checkInde+1 < len) ){
                this.checkInde ++;
            }
            obj = data[this.checkInde];
            this.checkInde ++;
        }else{
            this.checkInde = 0;
            obj = data[this.checkInde];
        }
        for( var i = 1 ; i < obj.len+1 ;i ++){
            var cardValue = obj["p"+i].cardValue;
            arr.push(cardValue);
        }           
        return arr;
    },

    restTargetData:function(){
        this.currentCardTarget = null;
        this.checkInde         = 0;
    },

    upBtnView:function(obj)
    {
        var self = this;
        var upCardType = function(obj){
            var status    = obj.status;
            self.btnTypeName = obj.typeName;
            self.upBtnStatus(status);
        };
        upCardType(obj);      
        this.upBtnTypeName();
    },

    upBtnTypeName:function()
    {
        var name = "";
        switch(this.btnTypeName)
        {
            case "onePair"://对子
                name = "对  子";
                break;
            case "twoDouble"://两对
                name = "两  对";
                break;
            case "threeStrip"://三条
                name = "三  条";
                break;
            case "straight"://顺子
                name = "顺  子";
                break;
            case "sameFlower"://同花
                name = "同  花";
                break;
            case "calabash"://葫芦
                name = "葫  芦";
                break;
            case "IronBranch"://铁支
                name = "铁  支";
                break;
            case "StraightFlush" ://同花顺
                name = "同花顺";
                break;
            case "fiveSame"://五同
                name = "五  同";
                break;
        }
        this.cardTypeTxt.string = name;
    },
   
    /**设置按钮状态显示*/
    upBtnStatus:function(bool)
    {
        var _btn = this.node.getComponent(cc.Button);
        _btn.interactable = bool;
        _btn.enabled      = bool;
        var sp = this.node.getComponent(cc.Sprite);
        if(bool === true){
            sp.spriteFrame  = this.commonSpriteFrame;
        }else{
            sp.spriteFrame  = this.changeSpriteFrame;
        }
    },

    destroyFun:function()
    {
        this.node.removeFromParent();
        this.node.removeAllChildren();
        this.node.destroy();
    },
});
