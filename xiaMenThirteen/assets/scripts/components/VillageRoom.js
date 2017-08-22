cc.Class({
    extends: cc.Component,

    properties: {
        commonFrame:cc.SpriteFrame,
        checkFrame:cc.SpriteFrame,  
    },

    onLoad: function () 
    {
        self._contTxt = self.node.getChildByName("contTxt");
        //马牌3张牌节点
        self._cardNode = self.node.getChildByName("cardNode").getComponent(cc.Node);
        //封顶
        self._capsNode = self.node.getChildByName("capsNode").getComponentsInChildren("RadioButton");

        self._maPai = self.node.getChildByName("maPai");
        self._maPaiBg = self._maPai.getChildByName("maPaiBg");
    },

    addList:function()
    {
        var self = this;
        for(var i = 0 ; i < self._capsNode.length ; i ++)
        {
            var _node = self._capsNode[i];
            if(_node)
                _node.target.on('checkButton',self.checkRoomData());
        }
    },

    removeLis:function()
    {
        var self = this;
        self.removeRadioButton();
        for(var i = 0 ; i < self._capsNode.length ; i ++)
        {
            var _node = self._capsNode[i];
            if(_node)
                _node.target.on('checkButton',self.checkRoomData());
        }
    },

    addCardLis:function()
    {
        for(var i = 0 ; i < self._cardNode.length ; i ++ )
        {
            var _node = self._cardNode[i];
            if(_node)
                _node.on(cc.Node.EventType.TOUCH_START, this.checkCard, this);
        }   
    },

    removeCardLis:function()
    {
        for(var i = 0 ; i < self._cardNode.length ; i ++ )
        {
            var _node = self._cardNode[i];
            if(_node)
                _node.off(cc.Node.EventType.TOUCH_START, this.checkCard, this);
        }   
    },

    upCoin:function()
    {
        this.contTxt.string = cc.vv.CreatorRoomManger.calculateRoomCard();
    },

    //选择马牌
    checkMaPai:function()
    {
        var self = this;
        var mapiValue = cc.vv.CreatorRoomManger.roomConfig[1].double;
        mapiValue     = mapiValue == 0 ? 1:0;
        var sp = self._maPai.getComponent(cc.Sprite);
        if(mapiValue > 0){
            sp.spriteFrame = self.checkFrame;
            self.addCardLis();
        }
        else{
            sp.spriteFrame = self.commonFrame;
            self.removeCardLis();
        }
        self.upCardView();
        self.upCoin();
    },

    //更新马牌牌界面
    checkCard:function(event)
    {
        var self = this;
        var index = Number(event.target.name.slice(4,5));
        cc.vv.CreatorRoomManger.roomConfig[1].cardValue = index;
        self.upCardView();
    },

    upCardView:function()
    {
        var self  = this;
        var index = cc.vv.CreatorRoomManger.roomConfig[1].cardValue;
        var maPai = cc.vv.CreatorRoomManger.roomConfig[1].double;
        for(var i = 0 ; i  < self._cardNode.length ; i ++ )
        {
            var currentCard = self._cardNode[index];
            if( i === index)
            {
                currentCard.node.color = colorArr[1];
                if(maPai > 0)
                     self._maPaiBg.active = true;
                else
                     self._maPaiBg.active = false;
            }
            else
                currentCard.node.color = colorArr[0];           
        }
    },

    checkRoomData:function(data)
    {
        var self = this;
        var radiogroup = cc.vv.radiogroupmgr.getGroupButton(data.targetNode);
        var index = cc.vv.radiogroupmgr.getRadioSelectedIndex(radiogroup);
        if(radiogroup.groupId === 10005)//积分       
            cc.vv.CreatorRoomManger.roomConfig[1].caps = index;      
    },

    show:function(index)
    {
        var self = this;
        self.node.active = true;
        self._maPaiBg.active = false;
        cc.vv.CreatorRoomMange.reset(index);
        self.addLis();
        self.addCardLis();
        self.upCoin();
        self.upCardView();
    },

    hide:function()
    {
        this.removeLis();
        this.removeCardLis();
        this.node.active = false;
    },

});
