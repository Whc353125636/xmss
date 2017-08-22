//头中尾节点
var moundNameList = ["heard","middle","tail"];
var backCardArr = [[0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
cc.Class({
    extends: cc.Component,
    properties: {

    },

    onLoad:function()
    {
        console.log("================初始化showView================");
        this.moundCardNodeList = [];
        this.moundNodeList     = [];
        this.totalScore        = 0;

        for( var i = 0 ; i < 3 ; i ++){
            var _node = this.node.getChildByName(moundNameList[i]);
            this.moundNodeList.push(_node);
            var _nodeList = _node.children;
            this.moundCardNodeList.push(_nodeList);
            // 牌型节点
            var _typeNode = _nodeList[_nodeList.length-1];
            _typeNode.active = false;
        }

        //特殊牌型节点
        this.spCardTypeNode =  this.node.getChildByName("spCardBg");
        this.spCardTypeNode.active = false;

        //分数总节点
        this.scoreNode =  this.node.getChildByName("scoreNode");
        //头 中 尾 节点组
        this.scoreList =  this.scoreNode.children;
        for(var i = 0; i < this.scoreList.length ; i ++ ){
            var _node = this.scoreList[i];
            _node.active = false;
        }
        //总分节点
        this.totalScoreNode = this.node.getChildByName("totalScoreNode");
        //txt
        this.totalTxt   = this.totalScoreNode.getChildByName("scoreTxt").getComponent(cc.Label);;
        //触碰layer节点
        this.layerNode  = this.node.getChildByName("layerNode");
        //子弹动画
        this._bulletAm = cc.find("Canvas/fanCardNode/putCard/bulletAm");
        if(this._bulletAm != null){
            this._bulletAm.active = false;
        }

        this.totalScoreNode.active  = false;
        this.scoreNode.active   = false;
        this.isBackCard         = true;
        this.node.active = false;
    },

    hide:function(){
        this.node.active = false;
        this.isBackCard  = true;
        this.removeLis();
        for( var i = 0 ; i < this.moundNodeList.length ; i ++){
            var _node = this.moundNodeList[i];
            _node.stopAllActions();
        }
    },

    init: function (idx) {  
        this.pos = idx; 
    },

    addLis:function(){
        this.layerNode.on(cc.Node.EventType.TOUCH_START, this.clickEvent, this)
    },

    removeLis:function(){
        this.layerNode.off(cc.Node.EventType.TOUCH_START, this.clickEvent, this)
    },
    
    clickEvent:function(event){
        var self        = this;
        this.isBackCard = !this.isBackCard;
        var cardList    = [];
        if(this.isBackCard === true)//牌背
        {
            cardList = backCardArr;
        }else{
            cardList = cc.vv.RichardCardManager.putCardData;
        }  
        console.log("======cardList=====",cardList);
        for(var i = 0 ; i < 3; i ++){
            self.showBack(cardList[i],i,false);
        }
    },

    showBack:function(cardArr,mound,isSpCard)
    {
        if(isSpCard === true){
            this.spCardTypeNode.active = true;
            this.removeLis();
        }
        this.upMoundCardData(cardArr,null,null,mound,false);      
    },

    /**
     * 更新对应墩牌
     * @cardArr 牌组
     * @score   分数
     * @mound   墩索引
     * @isAnimation 是否播放动画
     */
    upMoundCardData:function(cardArr,type,score,mound,isAnimation)
    {
        if(cardArr !== null)
        {
            var self = this;
            var _moundCardNode = self.moundCardNodeList[mound];
            for(var i = 0 ; i < cardArr.length; i ++)
            {
                var _value      = cardArr[i];
                var _cardNode   = _moundCardNode[i];
                var sp          = _cardNode.getComponent(cc.Sprite);
                if(_value > 0){
                    var _flower     = cc.vv.RichardCardManager.getCardFlorerColor(_value);
                    var _cardValue  = cc.vv.RichardCardManager.getCardValue(_value);
                    var _url        = cc.vv.RichardCardManager.cardUrl + _flower + "_v_" + _cardValue;
                    sp.spriteFrame  = cc.vv.xmssManger.cardAtlas.getSpriteFrame(_url);
                }else{
                    var _url        = "poker_back";
                    sp.spriteFrame  = cc.vv.xmssManger.cardAtlas.getSpriteFrame(_url);
                }                
            }
            if(isAnimation === true)
            {
                var currentType = self.getTypeIndex(mound,type);
                console.log("=====当前牌型是currentType======",currentType);               
                var typeNode = _moundCardNode[_moundCardNode.length-1];
                var sp = typeNode.getComponent(cc.Sprite);
                sp.spriteFrame  = cc.vv.xmssManger.cardAtlas.getSpriteFrame("type"+currentType);

                var moundNode = self.moundNodeList[mound];
                moundNode.stopAllActions();
                moundNode.opacity   = 125;
                var pointX  = moundNode.x;
                var pointY  = moundNode.y;
                typeNode.active = true;
                //播放牌型声音
                cc.vv.audioMgr.playSFX("card/cardSound"+ currentType + ".mp3");

                var action = cc.sequence(
                    cc.spawn(
                        cc.targetedAction(moundNode, cc.spawn(
                            cc.moveTo(0.2,pointX,pointY+75),
                            cc.fadeTo(0.2,255),
                            cc.scaleTo(0.2,1.5)
                        )),
                    ),
                   cc.targetedAction(typeNode, cc.spawn(
                            cc.scaleTo(0.2,1.5)
                        )),

                    cc.delayTime(0.1),

                    cc.targetedAction(moundNode, cc.spawn(
                        cc.moveTo(0.2,pointX,pointY),
                        cc.scaleTo(0.2,1)
                    )),
                    cc.targetedAction(typeNode, cc.spawn(
                            cc.scaleTo(0.2,1)
                        )),

                    cc.callFunc(function(){
                       typeNode.active = false;
                       self.upScoreData(score,mound);
                    })
                );   
                moundNode.runAction(action);
            }
            else{
              self.upScoreData(score,mound);  
            }   
            this.node.active = true;       
        }
    },

    /**
     * 更新当前墩值分数
     * @data 分数
     * @mound 墩索引
     */
    upScoreData:function(data,mound)
    {
        // console.log("=====显示分数data==========",data,mound);
        if(data !== null)
        {
            var self = this;
            //3墩分数总节点
            self.scoreNode.active = true;
            //当前分数节点
            var _moundScore = self.scoreList[mound];
            //普通加分
            var _pTxt = _moundScore.getChildByName("pScoreTxt").getComponent(cc.Label);
            //特殊加分
            var _sTxt = _moundScore.getChildByName("sScoreTxt").getComponent(cc.Label);

            if(data.pScore < 0){
                _pTxt.string = data.pScore;
            }else{
                _pTxt.string = "+" + data.pScore;
            }          
            if(data.sScore < 0){
                _sTxt.string = "("+ data.sScore + ")";
            }else{
                _sTxt.string = "( +" + data.sScore + ")";
            }
            _moundScore.active = true;
            self.totalScore += data.pScore + data.sScore;
            self.totalScoreNode.stopAllActions();
            self.playScoreAction(self.totalScore);
        }
    },

    playScoreAction:function(num)
    {
        var self  =  this;
        var action = cc.sequence(
                    cc.spawn(
                        cc.targetedAction(self.totalScoreNode, cc.spawn(
                           cc.scaleTo(0.2,1.5)
                        )),
                    ),
                    cc.delayTime(0.1),
                    cc.targetedAction(self.totalScoreNode, cc.spawn(
                        cc.scaleTo(0.2,1)
                    )),
                    cc.callFunc(function(){
                        self.upMyTotalSocre(num);
                    })
        );
        self.scoreNode.runAction(action);
    },

    //更新自己总分分数
    upMyTotalSocre:function(num)
    {
        //总分节点
        this.totalScoreNode.active = true;
        if(num > 0){
             this.totalTxt.string = "+" + num;
        }else{
             this.totalTxt.string = num;
        }
    },

    getTypeIndex:function(mound,index){
        if(index === 3 && mound === 0){
             index = 10; //冲三         
        }else if(index === 6 && mound === 1){
            index = 11; //中墩葫芦
        }
        return index;
    }



});
