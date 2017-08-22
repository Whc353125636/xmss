//交换的花色节点索引
var checkIndexArr = [0,3];
cc.Class({
    extends: cc.Component,

    properties: {
        commonFrame:cc.SpriteFrame,
        checkFrame:cc.SpriteFrame,
        flowersCoFrame:cc.SpriteFrame,
        flowersChFrame:cc.SpriteFrame,
    },

    onLoad: function () 
    {
        //封顶
        self._capsNode = self.node.getChildByName("capsNode").getComponentsInChildren("RadioButton");
        self._flowersNode = self.node.getChildByName("flowers").getComponent(cc.Node);
        self._contTxt = self.node.getChildByName("contTxt");
    },

    addList:function()
    {
        var self = this;
        self.addRadioButton();
        for(var i = 0 ; i < self._flowersNode.length ; i ++)
        {
            var _node = self._flowersNode[i];
            if(_node)
                _node.on(cc.Node.EventType.TOUCH_START, self.checkFlowers, self);
        }
    },

    removeLis:function()
    {
        var self = this;
        self.removeRadioButton();
        for(var i = 0 ; i < self._flowersNode.length ; i ++)
        {
            var _node = self._flowersNode[i];
            if(_node)
                _node.off(cc.Node.EventType.TOUCH_START, self.checkFlowers, self);
        }
    },

    addRadioButton:function()
    {
        for(var i = 0 ; i < this._capsNode.length; i ++ )
        {
            var _node = this._capsNode[i];
            if(_node)
                _node.target.on('checkButton',this.checkRoomData());
        }    
    },

    removeRadioButton:function()
    {
        for(var i = 0 ; i < this._capsNode.length; i ++ )
        {
            var _node = this._capsNode[i];
            if(_node)
                _node.target.off('checkButton',this.checkRoomData());
        }    
    },

    checkRoomData:function(data)
    {
        var self = this;
        var radiogroup = cc.vv.radiogroupmgr.getGroupButton(data.targetNode);
        var index = cc.vv.radiogroupmgr.getRadioSelectedIndex(radiogroup);
        if(radiogroup.groupId === 10006)//坐庄封顶       
            cc.vv.CreatorRoomManger.roomConfig[3].caps = index;      
    },

    checkFlowers:function(event)
    {
        var self  = this;
        var index = Number(event.target.name.slice(4,5));
        var addflowers = cc.vv.CreatorRoomManger.roomConfig[3].addflowers;
        if(addflowers > 0) //加两色
        {
            if(cc.vv.CreatorRoomManger.roomConfig[3].flowers[index] === 1) return;
            self.swopCheckIndex(index);
        }
        else     
            cc.vv.CreatorRoomManger.roomConfig[3].flowers[index] = 1;    
        self.upFlowersView();       
    },

    //始终更换最前一次的选择
    swopCheckIndex:function(index)
    {
        var self = this;
        var currentIndex = checkIndexArr[1];
        checkIndexArr[1] = index;
        checkIndexArr[0] = currentIndex;
        for(var i = 0 ; i < checkIndexArr.length ; i ++)
        {
            var _idx = checkIndexArr[i];
            cc.vv.CreatorRoomManger.roomConfig[3].flowers[_idx] = 1;
        }
    },

    upFlowersView:function()
    {
        var self = this;
        for(var i = 0 ; i < self._flowersNode.length; i ++)
        {
            var _node = self._flowersNode[i];
            if(_node)
            {
                var sp = _node.getComponent(cc.Sprite);
                if(cc.vv.CreatorRoomManger.roomConfig[3].flowers[i] === 1)
                    sp.spriteFrame = self.flowersChFrame;
                else
                    sp.spriteFrame = self.flowersCoFrame;
            } 
        }
    },

    addflowers:function()
    {
        var self = this;
        var addflowers = cc.vv.CreatorRoomManger.roomConfig[3].addflowers == 0 ? 1:0;
        var sp = self._AAconsume.getComponent(cc.Sprite);
        if(addflowers > 0){
            checkIndexArr = [0,3];
            sp.spriteFrame = self.checkFrame;
            cc.vv.CreatorRoomManger.roomConfig[3].flowers[0] = 1;
            cc.vv.CreatorRoomManger.roomConfig[3].flowers[3] = 1;
            cc.vv.CreatorRoomManger.roomConfig[3].flowers[1] = 0;
            cc.vv.CreatorRoomManger.roomConfig[3].flowers[2] = 0;
        }
        else{
            sp.spriteFrame = self.commonFrame;
            cc.vv.CreatorRoomManger.roomConfig[3].flowers[0] = 1;
            cc.vv.CreatorRoomManger.roomConfig[3].flowers[3] = 0;
            cc.vv.CreatorRoomManger.roomConfig[3].flowers[1] = 0;
            cc.vv.CreatorRoomManger.roomConfig[3].flowers[2] = 0;
        }
        self.upFlowersView(); 
    },

    upCoin:function()
    {
        this.contTxt.string = cc.vv.CreatorRoomManger.calculateRoomCard();
    },

    show: function (index)
    {
        var self = this;
        checkIndexArr = [0,3];
        cc.vv.CreatorRoomMange.reset(index);
        self.addList();
        self.upCoin();
        self.upFlowersView();
        self.node.active = true;
    },

    hide:function()
    {
        var self = this;
        self.node.active = false;
        self.removeLis();
    },

});
