//亮牌面板
var backCardArr = [[0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
cc.Class({
    extends: cc.Component,

    properties: {

    },

   onLoad: function ()
   {
       console.log("==================初始化亮牌面板showCardPanel=======================");
        var cardNode = cc.find("Canvas/fanCardNode");
        cc.vv.utils.extChildren(cardNode, 4, (pos,i)=>{(i === 1) && (pos.x = 700,pos.y = 400);(i === 2) 
            &&(pos.x = 0,pos.y = 680);(i ===3)&&(pos.x = -700,pos.y=400)});
        this.showCardList =  cardNode.getComponentsInChildren("ShowCardView");
        for(var i = 0; i < this.showCardList.length ; i ++){
            var _node = this.showCardList[i];
            _node.init(i);
        }
        this.initEventHandlers();
        cardNode.active = false;
    },

    initEventHandlers:function(){
        var self = this;

        this.node.on('showBack',function(data){
            console.log("=============显示牌背============");
            self.showCardBack(data.detail);
        });

        //所有玩家摆牌完成
        this.node.on('finishPutCard',function(data){
            self.showCard(data.detail);
        });

        this.node.on('gameOver',function(data){
            self.removeShowView();
        });

        //播放特殊牌型动画
        this.node.on('playSpAnimation',function(data){
            console.log("=====收到特殊牌型播放动画===========");
            //特殊牌型索引
            self.spAmIndex = 0;
            //播放特殊牌型动画
            self.schedule(self.startSpAnimation,2);
        });

        //更新打枪分数
        this.node.on("upScore",function(data){
            var localSeat = cc.vv.gameNetMgr.getLocalIndex(data.detail.seat);
            var showCardView = self.showCardList[localSeat];
            showCardView.playScoreAction(data.detail.score);
        });   
    },

    /**显示牌背*/
    showCardBack:function(data)
    {
        //是否显示特殊牌型
        var bool = data.isSpCard;
        var localSeat = cc.vv.gameNetMgr.getLocalIndex(data.seat);
        console.log("=======localSeat=========",localSeat);
        var _showView = this.showCardList[localSeat];
        for( var i = 0 ; i < 3 ;i ++){
             _showView.showBack(backCardArr[i],i,bool);
        }
    },

    /**显示牌面*/
    showCard:function(obj)
    {
        var self            = this;
        var isPlayAn        = obj.bool; 
        //是否播放特殊牌型 
        self.isSpAnimation  = false;  
        self.result         = cc.vv.RichardCardManager.analysisCardResultData(obj.data);
        self.isSpAnimation  = self.result.spCardResult.length > 0;
        console.log("=====显示牌面isPlayAn===========",isPlayAn,"=======self.isSpAnimation=========",self.isSpAnimation);
        if(isPlayAn === true)
        {      
            //普通牌型数据     
            var _resultData     = cc.vv.RichardCardManager.analysisSortData(self.result);
            //排序每墩最小玩家数据
            self.resultData     = cc.vv.RichardCardManager.sortGroupValue(_resultData);
            //当前人数
            self. _currentIndex   = 0;
            //当前墩
            self._currentMound   = 0;
            self.schedule(self.playCardAnimation,1.5);         
        }
        else
        {
            for( var i = 0 ; i < self.result.length ; i ++ ){
                var _obj = data[i];
                if(data !== null)
                {
                    for( var i = 0 ; i < 3 ; i ++ ){
                       var localSeat = cc.vv.gameNetMgr.getLocalIndex(_obj.seat); 
                       var showPoker =  self.showCardList[localSeat];
                       showPoker.upMoundCardData(_obj.cardList[i],_obj.scoreList[i],i,false);
                    }
                }
            }
        }
    },

    //播放翻牌动画
    playCardAnimation:function()
    {
        var self = this;
        if(self._currentIndex >= self.result.cardResult.length ){
            self._currentMound ++;
            self._currentIndex = 0; 
        }
        if(self._currentMound > 2 ){
            self.unschedule(self.playCardAnimation);
            self. _currentIndex   = 0;
            self._currentMound    = 0;
            if(self.result.isShot === true){ 
                var shotList = self.getShotData(self.result);
                console.log("=======播放打枪动画shotList=========",shotList)
                cc.vv.gameNetMgr.dispatchEvent("upAmNodeState",{bool:true});
                cc.vv.gameNetMgr.dispatchEvent("playShotAnimation",{shotData:shotList,bool:isSpAnimation});
            }
            if(self.isSpAnimation === false){
                self.result     = [];
                self.resultData = [];  
            }             
            return;
        }

        var list          = self.resultData[self._currentMound];
        var target        = list[self._currentIndex];
        if(target){
            var localSeat = cc.vv.gameNetMgr.getLocalIndex(target.seat);
            var showPoker =  self.showCardList[localSeat];
            showPoker.upMoundCardData(target.card,target.type,target.score,self._currentMound,true);
        }
        self._currentIndex ++;
    },

    removeShowView:function(){
        this.unschedule(this.playCardAnimation);
        this.unschedule(this.startSpAnimation);
        this.result         = [];
        this.resultData     = []; 
        this.isSpAnimation  = false;

        for(var i = 0 ; i < 4 ; i ++){
            var _node = this.showCardList[i];
            for( var j = 0 ; j < 3 ;j ++){

                _node.showBack(backCardArr[j],j);
            }
            _node.hide();
        }
    },

    //播放特殊牌型动画
    startSpAnimation:function(){
        if(this.spAmIndex >= this.result.spCardResult.length){
            this.unschedule(this.playCardAnimation);
            this.unschedule(this.startSpAnimation);
            this.result         = [];
            this.resultData     = []; 
            this.isSpAnimation  = false;         
        }else{
            var spData = this.result.spCardResult[this.spAmIndex];
            cc.vv.gameNetMgr.dispatchEvent("playSpAm",{spData:spData});
            this.spAmIndex ++;
        }
    },

    //获取所有的打枪动画 顺序按服务端发送座位号开始 逐一播完每个玩家
    getShotData:function(data){
        var arr = [];
        for( var i = 0 ; i < data.length ; i ++)
        {
            var obj = data[i];
            if(obj){
                for(var j = 0 ;j < obj.shotList.length ; j ++){
                    var shotData = obj.shotList[j];
                    if(shotData){
                       arr.push(shotData) 
                    }
                }
            }
        }
        return arr;
    },
});
