cc.Class({
    extends: cc.Component,

    properties:
    {

    },

    onLoad:function()
    {
            // var self           = this;
            // self.node.active   = true;
            // //房间模式
            // self._roomTypeNode = self.node.getChildByName("roomTypeNode").getComponentsInChildren("RadioButton");
            // //人数
            // self._palyerNode = self.node.getChildByName("player").getComponentsInChildren("RadioButton");
            // //局数
            // self._inningNode = self.node.getChildByName("inning").getComponentsInChildren("RadioButton");

            // //普通十三水
            // self._OrdinaryRoom = self.node.getChildByName("OrdinaryRoom");
            // //坐庄十三水
            // self._VillageRoom  = self.node.getChildByName("VillageRoom");
            // //加一色十三水
            // this._OrdinaryFlowerRoom = self.node.getChildByName("OrdinaryFlowerRoom");
            // //加一色坐庄十三水
            // self._VillageFlowerRoom = self.node.getChildByName("VillageFlowerRoom");

            // self._roomTypeView  = [self._OrdinaryRoom,self._VillageRoom,self._OrdinaryFlowerRoom,self._VillageFlowerRoom];
    },

    addLis:function()
    {
        var self = this;
        self.addTarget(self._roomTypeNode);
        self.addTarget(self._palyerNode);
        self.addTarget(self._inningNode);
    },

    removeLis:function()
    {
        self.removeTarget(self._roomTypeNode);
        self.removeTarget(self._palyerNode);
        self.removeTarget(self._inningNode);
    },

    addTarget:function(radiosButton)
    {
        var self = this;
        for(var i = 0 ; i < self.radiosButton.length; i ++ )
        {
            var _node = self.radiosButton[i];
            if(_node)
                _node.target.on('checkButton',self.upCheckData());
        }    
    },

    removeTarget:function(radiosButton)
    {
        var self = this;
        for(var i = 0 ; i < self.radiosButton.length; i ++ )
        {
            var _node = self.radiosButton[i];
            if(_node)
                _node.target.off('checkButton',self.upCheckData());
        }    
    },

    upCheckData:function(data)
    {
        var self = this;
        var radiogroup = cc.vv.radiogroupmgr.getGroupButton(data.targetNode);
        if(radiogroup)
        {
            var index = cc.vv.radiogroupmgr.getRadioSelectedIndex(radiogroup);
            switch(radiogroup.groupId)
            {
                case 1000://表示模式
                     cc.vv.CreatorRoomManger.localData.roomType = index;
                     self.checkView(index);
                     break;
                case 1001://人数
                     cc.vv.CreatorRoomManger.localData.player   = index;
                     break;
                case 1002://局数
                     cc.vv.CreatorRoomManger.localData.innings  = index;
                     break;
            }
        }
    },

    checkView:function(index)
    {
        var self = this;
        var checkRoom = function()
        {
            for(var i = 0 ; i < self._roomTypeView.length ; i ++)
            {
                if( index === i )
                    self._roomTypeView[i].show(index);
                else
                    self._roomTypeView[i].hide();
            }
        }
        checkRoom();
    },

    closeFun:function()
    {
        this.hide();
    },

    show:function()
    {
        this.node.active = true;
        // this.addLis();
    },

    hide:function()
    {
        this.node.active = false;
        // this.removeLis();
    },
    
    sureRoom:function()
    {
        this.hide();
        this.createRoom();
    },
    
    createRoom:function()
    {
        var self = this;
        var _config = cc.vv.CreatorRoomManger.roomConfig[cc.vv.CreatorRoomManger.localData.roomType];
        var arr =  [];
        var arr1 = []; 

        var _conf = {
            game:"xmsss",
            coin:cc.vv.CreatorRoomManger.calculateRoomCard(),
            player:cc.vv.CreatorRoomManger.localData.player,
            innings:cc.vv.CreatorRoomManger.localData.innings,
            roomType:cc.vv.CreatorRoomManger.localData.roomType,
        };
        for(var key in _config)
        {
            arr.push(key)
            arr1.push(_config[key])
        }
        arr.forEach((key, i) => _conf[key] = arr1[i]);

        var data = {
            account:cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            conf: JSON.stringify(_conf),
        };
        console.log(data);
        cc.vv.wc.show("正在创建房间");
        cc.vv.http.sendRequest("/create_private_room", data, function (ret) {
            if (ret.errcode !== 0) {
                cc.vv.wc.hide();
                if (ret.errcode == 2222) {
                    cc.vv.alert.show("提示", "钻石不足，创建房间失败!");
                }
                else {
                    cc.vv.alert.show("提示", "创建房间失败,错误码:" + ret.errcode);
                }
            }
            else {
                cc.vv.gameNetMgr.connectGameServer(ret);
                cc.vv.CreatorRoomManger.upLocalstore();
            }
        });   
    },

});
