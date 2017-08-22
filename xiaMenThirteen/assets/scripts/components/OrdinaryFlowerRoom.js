//交换的花色节点索引
var checkIndexArr = [0,3];
cc.Class({
    extends: cc.Component,

    properties: 
    {
        commonFrame:cc.SpriteFrame,
        checkFrame:cc.SpriteFrame,
        flowersCoFrame:cc.SpriteFrame,
        flowersChFrame:cc.SpriteFrame,
    },

    onLoad:function()
    {
        var self = this;
        self._flowersNode = self.node.getChildByName("flowers");
        self._integralNode = self.node.getChildByName("integral").getComponentsInChildren("RadioButton");

        self._contTxt = self.node.getChildByName("contTxt");
        //需要更换的花色索引
        self.changeIndex = 0;
    },

    addList:function()
    {
        var self = this;
        self.addRadioButton();
        for(var i = 0 ; i < self._flowersNode.length ; i ++)
        {
            var _node = self._flowersNode[i];
            if(_node){
                _node.on(cc.Node.EventType.TOUCH_START, self.checkFlowers, self);
            }
        }
    },

    removeLis:function()
    {
        var self = this;
        self.removeRadioButton();
        for(var i = 0 ; i < self._flowersNode.length ; i ++)
        {
            var _node = self._flowersNode[i];
            if(_node){
                _node.off(cc.Node.EventType.TOUCH_START, self.checkFlowers, self);
            }
        }
    },

    addRadioButton:function()
    {
        for(var i = 0 ; i < this._integralNode.length; i ++ )
        {
            var _node = this._integralNode[i];
            if(_node){
                _node.target.on('checkButton',this.checkRoomData());
            }
        }    
    },

    removeRadioButton:function()
    {
        for(var i = 0 ; i < this._integralNode.length; i ++ )
        {
            var _node = this._integralNode[i];
            if(_node){
                _node.target.off('checkButton',this.checkRoomData());
            }
        }    
    },

    checkFlowers:function(event)
    {
        var self  = this;
        var index = Number(event.target.name.slice(4,5));
        var addflowers = cc.vv.CreatorRoomManger.roomConfig[2].addflowers;
        if(addflowers > 0) //加两色
        {
            if(cc.vv.CreatorRoomManger.roomConfig[2].flowers[index] === 1) return;
            self.swopCheckIndex(index);
        }
        else{    
            cc.vv.CreatorRoomManger.roomConfig[2].flowers[index] = 1;
        }    
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
            cc.vv.CreatorRoomManger.roomConfig[2].flowers[_idx] = 1;
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
                if(cc.vv.CreatorRoomManger.roomConfig[2].flowers[i] === 1){
                    sp.spriteFrame = self.flowersChFrame;
                }
                else{
                    sp.spriteFrame = self.flowersCoFrame;
                }
            } 
        }
    },

    checkRoomData:function(data)
    {
        var self = this;
        var radiogroup = cc.vv.radiogroupmgr.getGroupButton(data.targetNode);
        var index = cc.vv.radiogroupmgr.getRadioSelectedIndex(radiogroup);
        if(radiogroup.groupId === 1003){//积分       
            cc.vv.CreatorRoomManger.roomConfig[2].integral = index;
        }      
    },

    checkAA:function()
    {
        var self = this;
        var divide = cc.vv.CreatorRoomManger.roomConfig[2].divide == 0 ? 1:0;
        var sp = self._AAconsume.getComponent(cc.Sprite);
        if(divide > 0){
            sp.spriteFrame = self.checkFrame;
        }
        else{
            sp.spriteFrame = self.commonFrame;
        }
        self.upCoin();
    },

    addflowers:function()
    {
        var self = this;
        var addflowers = cc.vv.CreatorRoomManger.roomConfig[2].addflowers == 0 ? 1:0;
        var sp = self._AAconsume.getComponent(cc.Sprite);
        if(addflowers > 0){
            checkIndexArr = [0,3];
            sp.spriteFrame = self.checkFrame;
            cc.vv.CreatorRoomManger.roomConfig[2].flowers[0] = 1;
            cc.vv.CreatorRoomManger.roomConfig[2].flowers[3] = 1;
            cc.vv.CreatorRoomManger.roomConfig[2].flowers[1] = 0;
            cc.vv.CreatorRoomManger.roomConfig[2].flowers[2] = 0;
        }
        else{
            sp.spriteFrame = self.commonFrame;
            cc.vv.CreatorRoomManger.roomConfig[2].flowers[0] = 1;
            cc.vv.CreatorRoomManger.roomConfig[2].flowers[3] = 0;
            cc.vv.CreatorRoomManger.roomConfig[2].flowers[1] = 0;
            cc.vv.CreatorRoomManger.roomConfig[2].flowers[2] = 0;
        }
        self.upFlowersView(); 
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

    upCoin:function()
    {
        this.contTxt.string = cc.vv.CreatorRoomManger.calculateRoomCard();
    },

});
