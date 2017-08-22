//头中尾节点
var moundNameArr = ["heard","middle","tail"];
var grayCardArr = [[0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
//理牌界面
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () 
    {
        this._closeNode = [];
        this._layerNode = [];
        this.moundNodeArr = {};

        this.initView();  
        this.initEventHandlers();
    },

    initView:function()
    {
        this.putCardNode = this.node.getChildByName("putCardNode");
        this.outCard     = this.putCardNode.getChildByName("outCard");
        this.retrieve    = this.putCardNode.getChildByName("retrieve");

        //创建9个普通牌型按钮 不包括乌龙
        cc.vv.utils.extChildren(this.putCardNode.getChildByName("cardButton"), 9, (pos, i)=>{pos.x += 120});
        //关闭
        var closeBtn    = this.putCardNode.getChildByName("close");
        //触碰layer
        var layerBtn    = this.putCardNode.getChildByName("layerNode");
        for( var i = 0 ; i < 3 ; i ++){
            this._closeNode.push(closeBtn.getChildByName("close"+i));
            this._layerNode.push(layerBtn.getChildByName("layer"+i));
        }
        for(var i = 0; i < moundNameArr.length; ++i){
            var _cardNode =  this.putCardNode.getChildByName("putCard").getChildByName(moundNameArr[i]).getComponentsInChildren("MoundCard");
            this.moundNodeArr[moundNameArr[i]] = _cardNode;
        }
        //牌型按钮
        var _btnType = this.putCardNode.getChildByName("cardButton")
        this.btnArr = _btnType.getComponentsInChildren("BtnType");
        for(var i = 0 ; i < this.btnArr.length; i ++){
            var _node = this.btnArr[i];
            _node.init();
        }
    },

    initEventHandlers:function()
    {
        var self = this;
        //更新按钮状态
        self.node.on('upAllBtnState',function(data){    
            var handCardNode = cc.vv.RichardCardManager.getEffectiveCard();
            var handCardArr  = cc.vv.RichardCardManager.getCardNum(handCardNode);
            var cardTypeArr = cc.vv.RichardCardManager.findAllCardTypeBtn(handCardArr);
            console.log("==cardTypeArr===",cardTypeArr);
            for(var i = 0 ; i < self.btnArr.length ; i ++)
            {
                var obj = cardTypeArr[i];
                var _btnNode = self.btnArr[i];
                _btnNode.upBtnView(obj);
            }
            self.addLis(); 
            self.upViewBtnState();
        });
        
        //所有按钮禁止事件
        self.node.on('AllBtnStopState',function(data){    
            for(var i = 0 ; i < self.btnArr.length ; i ++){
                var _btnNode = self.btnArr[i];
                _btnNode.upBtnStatus(false);
            }
        });

        this.node.on("outcardResult",function(data){
            console.log("=============出牌结果======",data.detail.result);
            if(data.detail.result === 0){//成功
                self.removeLis();
                //移除自己牌面板
                cc.vv.gameNetMgr.dispatchEvent("moveCandView",{seat:cc.vv.gameNetMgr.seatIndex});
                //重置摆牌数据
                self.restCardData();
                //移除理牌面板
                cc.vv.gameNetMgr.dispatchEvent("upPutCardState",{bool:false});
                //显示扇形面板
                cc.vv.gameNetMgr.dispatchEvent("showBack",{seat:cc.vv.gameNetMgr.seatIndex,isSpCard:false});
            }else{             
               cc.vv.alert.show("提示", "摆牌错误,请重新摆牌");
            }
        });

    },

    addLis:function()
    {
        var self = this;
        for(var i = 0; i < self._layerNode.length ; i ++)
        {
            var _layerSp = self._layerNode[i];
            _layerSp.on(cc.Node.EventType.TOUCH_START, self.onLayer, self);
        }
    },

    removeLis:function()
    {
        var self = this;
        for(var i = 0; i < self._layerNode.length ; i ++)
        {
            var _layerSp = self._layerNode[i];
            _layerSp.off(cc.Node.EventType.TOUCH_START, self.onLayer, self);
        }
    },

    onClose:function(event)
    {
        cc.vv.audioMgr.playSFX("btnClick.mp3");
        var grayValue = [];
        var mound = Number(event.target.name.slice(5,6));
        if(mound === 0){
            grayValue = [0,0,0];
        }else{
            grayValue = [0,0,0,0,0];
        }             
        var cardArr = cc.vv.RichardCardManager.getMoundCardData(mound);
        //添加
        cc.vv.gameNetMgr.dispatchEvent("upHandCard",{bool:true,data:cardArr});
        //清除当前墩牌值
        cc.vv.RichardCardManager.clearMoundCardData(mound);
        //交换纹理
        this.swapMoundTexture(mound,grayValue);
        //更新界面按钮状态
        this.upViewBtnState();
        //清除升起牌组
        cc.vv.RichardCardManager.upCheckCardData(cardArr,false);
    },

    onLayer:function(event)
    {
        var mound           = Number(event.target.name.slice(5,6));
        var _checkUpCard    = cc.vv.RichardCardManager.getCheckUpCard();
        if(_checkUpCard.length < 1) {
            return;
        }
        cc.vv.audioMgr.playSFX("btnClick.mp3");
        var moundData       = cc.vv.RichardCardManager.getMoundCardData(mound);
        var arr             = _checkUpCard.concat(moundData);
        var bestCard        = cc.vv.RichardCardManager.findBestCardType(arr,mound);

        //选择升起剩余的牌执行落下
        var floadUpCard     = cc.vv.RichardCardManager.removeFoldValue(bestCard,_checkUpCard);
        var bestCardValue   = cc.vv.RichardCardManager.conversionNumber(bestCard);
        //添加到牌墩的牌
        var deletUpCard     = cc.vv.RichardCardManager.removeArrValue(moundData,bestCardValue);
        //牌墩丢弃的牌执行添加牌
        var moundFloadCard  = cc.vv.RichardCardManager.removeFoldValue(bestCard,moundData);
        //转换成牌值
        var cardNumArr      =  this.getBestCardValue(mound,bestCard)
        //更新牌墩牌
        cc.vv.RichardCardManager.upMoundCardData(mound,cardNumArr);
        //更新牌墩牌纹理
        this.swapMoundTexture(mound,cardNumArr);
        //删除
        cc.vv.gameNetMgr.dispatchEvent("upHandCard",{bool:false,data:deletUpCard});
        //添加
        cc.vv.gameNetMgr.dispatchEvent("upHandCard",{bool:true,data:moundFloadCard});
        //落下
        cc.vv.gameNetMgr.dispatchEvent("upHandCardState",{bool:false,data:floadUpCard});
        //更新界面按钮状态
        this.upViewBtnState();
        //清除升起牌组
        cc.vv.RichardCardManager.upCheckCardData(cardNumArr,false);
        //重置所有类型数据
        this.restBtnData();
    },

    upCloseBtnState:function()
    {
        for(var i = 0; i < 3; i ++)
        {
            var arr         = cc.vv.RichardCardManager.getMoundCardData(i);
            var _closeBtn   = this._closeNode[i];
            var sp          = _closeBtn.getComponent(cc.Sprite);
            var isClick     = this.getCloseBtnState(i);

            if(isClick === true){
                sp.spriteFrame         = cc.vv.xmssManger.cardAtlas.getSpriteFrame("close");
                _closeBtn.on(cc.Node.EventType.TOUCH_START, this.onClose, this);
            }else{
                sp.spriteFrame         = cc.vv.xmssManger.cardAtlas.getSpriteFrame("grayClose");
                _closeBtn.off(cc.Node.EventType.TOUCH_START, this.onClose, this);
            }
        }
    },

    upLayerState:function()
    {
        var len = 0;
        for(var i = 0; i < 3; i ++)
        {
            var arr         = cc.vv.RichardCardManager.getMoundCardData(i);
            var _layer      = this._layerNode[i];
            var isFull      = cc.vv.RichardCardManager.isMoundCardFull(i);

            if(isFull === true){
                _layer.active = false;
            }else{
                _layer.active = true;
            }
        }
    },

    upOutBackState:function(){
        var bool = cc.vv.RichardCardManager.getTypeButtonState();
        var sp = this.outCard.getComponent(cc.Sprite);
        if(bool === true){
            sp.spriteFrame        = cc.vv.xmssManger.cardAtlas.getSpriteFrame("outCard");
            this.outCard.on(cc.Node.EventType.TOUCH_START, this.outCardFun, this);
        }else{
            sp.spriteFrame        = cc.vv.xmssManger.cardAtlas.getSpriteFrame("grayOutCard");
            this.outCard.off(cc.Node.EventType.TOUCH_START, this.outCardFun, this);
        }
    },

    upRetrieveCardState:function(){
        var bool = cc.vv.RichardCardManager.getRetrieveState();
        var sp = this.retrieve.getComponent(cc.Sprite);
        if(bool === true){
            sp.spriteFrame        = cc.vv.xmssManger.cardAtlas.getSpriteFrame("retrieve");
            this.retrieve.on(cc.Node.EventType.TOUCH_START, this.retrieveCardFun, this);
        }else{
            sp.spriteFrame        = cc.vv.xmssManger.cardAtlas.getSpriteFrame("grayRetrieve");
            this.retrieve.off(cc.Node.EventType.TOUCH_START, this.retrieveCardFun, this);
        }
    },

    outCardFun:function(){
       cc.vv.audioMgr.playSFX("btnClick.mp3");
       console.log("===========出牌==========");
       var data     = cc.vv.RichardCardManager.getCardGroupData();
       var cardList = data.card;
       var group    = data.cardData;
       var typeList = [group[0].type,group[1].type,group[2].type];

       console.log("==cardList==",cardList,"====typeList==",typeList);
       if( group[0].type > group[1].type || group[0].type > group[2].type || group[1].type > group[2].type){
            cc.vv.alert.show("提示", "相公了,请重新选择");
       }else{
           cc.vv.net.sendOp('chupai',{card:cardList,type:typeList});
       }
    },

    retrieveCardFun:function(){
        cc.vv.audioMgr.playSFX("btnClick.mp3");
        var newCard = [];
        for( var i = 0 ; i < 3; i ++ ){
            var moundCard = cc.vv.RichardCardManager.getMoundCardData(i);
            newCard = newCard.concat(moundCard);
        }
        for( var i = 0 ; i < 3;i ++){
            this.swapMoundTexture(i,grayCardArr[i]);
            cc.vv.RichardCardManager.clearMoundCardData(i);
        }
        cc.vv.gameNetMgr.dispatchEvent("upHandCard",{bool:true,data:newCard});
        this.upViewBtnState();
    },

    restCardData:function(){
        for( var i = 0 ; i < 3;i ++){
            this.swapMoundTexture(i,grayCardArr[i]);
            cc.vv.RichardCardManager.clearMoundCardData(i);
        }
        //重置所有类型数据
        this.restBtnData();
    },

    upViewBtnState:function(){
        //更新关闭按钮状态
        this.upCloseBtnState();
        //更新layer
        this.upLayerState();
        //更新出牌按钮
        this.upOutBackState();
        //更新回收按钮
        this.upRetrieveCardState();
    },

    /**
     * 更换整墩值纹理
     * @ index 墩数
     * @ vaule 更换的牌值
     * @ cardItemIndex 第几个cardItem
     */
    swapMoundTexture:function(mound,arr)
    {
        //获取牌墩牌节点
        var _cardNode = this.moundNodeArr[moundNameArr[mound]];
        for(var i = 0 ; i < arr.length ; i ++){
            var _item  = _cardNode[i];
            _item.setCard(arr[i]);
        }
    },

    restBtnData:function(){
        for(var i = 0 ; i < this.btnArr.length ; i ++){
            var _btnNode = this.btnArr[i];
            _btnNode.restTargetData();
        }
    },
    
    getBestCardValue:function(mound,bestCard){
        var len = 0;
        var arr = [];
        if(mound ===0){
            len = 3;
        }else{
            len = 5;
        }
        if(bestCard.len === len){
             //转换成牌值
            var currentCardList = cc.vv.RichardCardManager.conversionNumber(bestCard);
            var cardList        = cc.vv.RichardCardManager.creatorTarget(currentCardList);
            cardList.sort(cc.vv.RichardCardManager.cardValeBigSort);
            arr                 = this.analysisValue(cardList)
        }else{
            arr      = cc.vv.RichardCardManager.conversionNumber(bestCard);
        }
        return arr;        
    },

    analysisValue:function(arr){
       var newArr = [];
       for( var i = 0 ; i < arr.length; i ++ ){
           var obj = arr[i];
           newArr.push(obj.cardNum);
       }
        return newArr;
    },

    getCloseBtnState:function(mound){
        var moundCard = cc.vv.RichardCardManager.getMoundCardData(mound);
        if(moundCard.length > 0){
            return true;
        }else{
            return false;
        }
    },

});
