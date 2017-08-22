//理牌中心牌
cc.Class({
    extends: cc.Component,

    properties: {
        //牌值
        cardValue:0,
        grayFarme:cc.SpriteFrame,
    },

    onLoad: function () {
        
    },

    //设置牌纹理
    setCard:function(value)
    {
        if(value === 0){
            var sp            = this.node.getComponent(cc.Sprite);
            sp.spriteFrame    = this.grayFarme;
            return;
        }
        this.cardValue    = value;
        var _flowerColor = cc.vv.RichardCardManager.getCardFlorerColor(this.cardValue);
        var _cardValue   = cc.vv.RichardCardManager.getCardValue(this.cardValue);
        var url           = cc.vv.RichardCardManager.cardUrl + _flowerColor + "_v_" + _cardValue;
        var sp            = this.node.getComponent(cc.Sprite);
        sp.spriteFrame    = cc.vv.xmssManger.cardAtlas.getSpriteFrame(url);
    },


});
