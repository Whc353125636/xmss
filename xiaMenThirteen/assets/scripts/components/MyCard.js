var spaceWidth = 40;
var spaceHeigth = 30;

var NormalColor = [cc.color(255,255,255), cc.color(160,160,160)];
//玩家自己手牌
cc.Class({
    extends: cc.Component,

    properties: {     
        index:0,
        cardNum:0,
        flowerColor:0,
        cardValue:0,
        IsChick:false,
    },

    onLoad: function ()
    {
        this.index          = 0;
        this.cardNum        = 0;
        this.flowerColor    = 0;
        this.cardValue      = 0;
        this.IsChick        = false;
        this.node.active    = false;
        this.addLis();
    },

    addLis:function(){
        this.node.on(cc.Node.EventType.TOUCH_START, this.clickEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.clickEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.clickEvent, this);
    },

    removeLis:function(){
        this.node.off(cc.Node.EventType.TOUCH_START, this.clickEvent, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.clickEvent, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.clickEvent, this);
    },

    clickEvent:function(event){
        var touchType = event.type;
        switch(touchType)
        {
            case "touchstart":
                 this.node.color = NormalColor[1];
                 cc.vv.audioMgr.playSFX("card/sendCardSound.mp3");
                 break;
            case "touchend":
            case "touchcancel":
                 this.node.color = NormalColor[0];
                 this.IsChick = !this.IsChick;
                 this.setCardNodeY(this.IsChick);
                 break;
        }
    },

     /**开始发牌*/
    startSendCard:function()
    {
        this.node.x = spaceWidth*this.index;
        this.node.y = 0;   
        this.show();      
    },
    
    //设置牌纹理
    setCard:function(value,idx)
    {
        if(value === 0){
            this.hide();
            return;
        }
        if(idx >= 0){
            this.index = idx;
            this.node.zIndex    =  this.index; 
        }       
        this.show();
        this.cardNum        = value;
        this.flowerColor    = cc.vv.RichardCardManager.getCardFlorerColor(this.cardNum);
        this.cardValue      = cc.vv.RichardCardManager.getCardValue(this.cardNum);
        var url             = cc.vv.RichardCardManager.cardUrl + this.flowerColor + "_v_" + this.cardValue;
        var sp              = this.node.getComponent(cc.Sprite);
        sp.spriteFrame      = cc.vv.xmssManger.cardAtlas.getSpriteFrame(url);
    },
       
    show:function()
    {
        this.node.active = true;
    },

    hide:function()
    {
        this.node.active = false;
        this.resetCard();
    },

    /**重置牌坐标*/
    resetCard:function()
    {
        this.index         = 0;
        this.cardNum       = 0;
        this.flowerColor   = 0;
        this.cardValue     = 0;
        this.IsChick       = false;
    },
    
    /**设置节点Y值增加*/
    setCardNodeY:function(bool)
    {
        this.IsChick = bool;
        if(bool === true){
            this.node.y = spaceHeigth;
        }else{
           this.node.y = 0;
        }
        cc.vv.RichardCardManager.upCheckCardData([this.cardNum],bool);
    },

    upCardData:function(index)
    {
        this.index       = index;
        //渲染节点的层级
        this.node.zIndex =  this.index;
        this.node.x      = spaceWidth*this.index;
        this.node.y      = 0;
        // this.wordPoint = this.node.convertToWorldSpace(this.node.x,this.node.y);
        // this.wordPoint.x -= 72.5;
    },
    
    // destroyFun:function()
    // {
    //     this.node.removeAllChildren();
    //     this.node.removeFromParent();
    //     this.node.destroy();
    // },
});
