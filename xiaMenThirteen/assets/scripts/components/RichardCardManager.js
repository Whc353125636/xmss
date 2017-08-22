 /**牌型名字*/
 var cardTypeNameArr = [ "wulong","onePair","twoDouble","threeStrip","straight",
                        "sameFlower","calabash","IronBranch","StraightFlush","fiveSame"
                      ];
//理牌中心
cc.Class({
    extends: cc.Component,

    properties: 
    {
        //头 中 尾 牌数据
        headCardArr:[],
        middleCardArr:[],
        tailCardArr:[],
        //选择升起的数据
        checkUpCard:[],
        putCardData:[],
        cardUrl:"poker_t_",
    },

    init: function ()
    {
        //  牌路径
        this.cardUrl            = "poker_t_";
        //头 中 尾 牌数据
        this.headCardArr        = [];
        this.middleCardArr      = [];
        this.tailCardArr        = [];
        //选择升起的数据
        this.checkUpCard        = [];
        //自己摆放的数据
        this.putCardData        = [];
    },

    getMoundCardData:function(mound)
    {
        var arr = [];
        switch(mound)
        {
            case 0:
                arr = this.headCardArr;
                break;
            case 1:
                arr = this.middleCardArr;
                break;
            case 2:
                arr = this.tailCardArr;
                break;
        }
        // console.log("===当前派墩牌===",mound,arr);
        return arr;
    },

    clearMoundCardData:function(mound)
    {
        switch(mound)
        {
            case 0:
                this.headCardArr = [];
                break;
            case 1:
                this.middleCardArr = [];
                break;
            case 2:
                this.tailCardArr = [];
                break;
        }
    },

    upMoundCardData:function(mound,arr)
    {
        switch(mound)
        {
            case 0:
                this.headCardArr = arr;
                break;
            case 1:
                this.middleCardArr = arr;
                break;
            case 2:
                this.tailCardArr = arr;
                break;
        }
    },

    getCheckUpCard:function()
    {
        return this.checkUpCard;
    },

    /**
    * 获取花色
    * @ [0,1,2,3] [方 梅 红 黑]
    */
    getCardFlorerColor:function(value)
    {
        var flowerColor = value >> 4;
        return flowerColor;
    },
    
    /**
    * 获取牌值
    */
    getCardValue:function(value)
    {
        var cardValue = value & 0x0F ;
        return cardValue;
    },

    /**排序从小到大*/
    cardValeSmallSort:function(a,b)
    {
        return a.cardValue - b.cardValue;
    },
    
     /**排序从大到小*/
    cardValeBigSort:function(a,b)
    {
        return b.cardValue - a.cardValue;
    },

    //更新选择牌组数据 bool true 增加
    upCheckCardData:function(data,bool)
    {
        var cardData = this.checkUpCard;
        for( var i = 0; i < data.length ; i ++)
        {
            var _value = data[i];
            var _index = cardData.indexOf(_value);
            if(_index === -1){
                if(bool === true){
                    cardData.push(_value);
                }
            }else{
                if(bool === false){
                    cardData.splice(_index,1);
                }
            }
        }
    },

    //更新手牌 bool true 增加
    upHandCardData:function(data,bool)
    {
        for( var i = 0; i < data.length ; i ++)
        {
            var _value = data[i];
            var _index = data.indexOf(_value);
            if(_index === -1){
                if(bool === true){
                    cardData.push(_value);
                }
            }else{
                if(bool === false){
                    cardData.splice(_index,1);
                }
            }
        }
    },

    //所有墩是否摆好
    getTypeButtonState:function(){
        if( this.headCardArr.length === 3 && this.middleCardArr.length === 5 && this.tailCardArr.length === 5){
            return true;
        }else{
            return false;
        }
    },

    //回收按钮状态
    getRetrieveState:function(){
        if( this.headCardArr.length > 0  || this.middleCardArr.length > 0 || this.tailCardArr.length > 0 ){
            return true;
        }else{
            return false;
        }
    },

    /**当前牌墩是否已满 */
    isMoundCardFull:function(mound){
        var moundCard = this.getMoundCardData(mound);
        var len = 0;
        switch(mound){
            case 0:
                 len = 3;
                 break;
            case 1:
                 len = 5;
                 break;
            case 2:
                 len = 5;
                 break;     
        }
        if(moundCard.length === len ){
            return true;
        }else{
            return false;
        }
    },

    conversionObj:function(arr)
    {
        var obj = {};
        obj.len = arr.length;     
        for( var i = 0; i < arr.length; i ++ )
        {
            var value = arr[i];
            obj["p"+(i+1)] = {cardValue:value}
        }
        return obj;
    },

    /**转换int数据*/
    conversionNumber:function(obj)
    {   
        var arr = [];
        var len = obj.len;
        while(obj.len > 0){
            var _value = obj["p"+obj.len].cardValue;
            arr.push(_value);
            obj.len --;
        }
        obj.len = len;
        return arr;
    },

    /**转换obj数据*/
    creatorTarget:function(arr)
    {
        var targetArr = [];
        for(var i = 0 ; i < arr.length ; i ++)
        {
            var cardNum    = arr[i];
            var flower     = this.getCardFlorerColor(cardNum);
            var cardValue  = this.getCardValue(cardNum);
            var obj        = {flower:flower,cardValue:cardValue,cardNum:cardNum};
            targetArr.push(obj);
        }
        return targetArr;
    },

    /**
     * 获取最佳牌型
     */ 
    getBestCardArr:function(cardTypeName,cardArr)
    {
        var self = this;
        var bestCardArr = null;
        switch(cardTypeName)
        {
            case "wulong":
                bestCardArr = self.findAllWuLong(cardArr);
                break;
            case "onePair":
                bestCardArr = self.findAllOneDouble(cardArr);
                break;
            case "twoDouble":
                bestCardArr = self.findAllTwoDouble(cardArr);
                break;
            case "threeStrip":
                bestCardArr = self.findAllSanTiao(cardArr);
                break;
            case "straight":
                bestCardArr = self.findAllStraight(cardArr);
                break;
            case "sameFlower":
                bestCardArr = self.findAllTongHua(cardArr);
                break;
            case "calabash":
                bestCardArr = self.findAllCalabash(cardArr);
                break;
            case "IronBranch":
                bestCardArr = self.findAllTieZhi(cardArr);
                break;
            case "StraightFlush" :
                bestCardArr = self.findAllSequence(cardArr);
                break;
            case "fiveSame":
                bestCardArr = self.findAllWuTong(cardArr);
                break;
        }
        return bestCardArr;
    },

    /**
     * 获取牌型名字
     */
    getTypeName:function(cardArr)
    {
        var self = this;
        if(self.typeOfWuTong(cardArr))
            return "fiveSame";
        else if(self.typeOfSequence(cardArr))
            return "StraightFlush";
        else if(self.typeOfTieZhi(cardArr))
            return "IronBranch";
        else if(self.typeOfCalabash(cardArr))
            return "calabash";
        else if(self.typeOfTongHua(cardArr))
            return "sameFlower";
        else if(self.typeOfStraight(cardArr))
            return "straight";
        else if(self.typeOfSanTiao(cardArr))
            return "threeStrip";
        else if(self.typeOfTwoDouble(cardArr))
            return "twoDouble";
        else if(self.typeOfOneDouble(cardArr))
            return "onePair";
        else
            return "wulong";
    },

    //是否有当前牌型存在
    findTargetCardType:function(typeName,cardArr)
    {
        //是否有当前牌型
        var isCardType = false;
        switch(typeName)
        {
            case "onePair"://对子
                isCardType = this.typeOfOneDouble(cardArr);
                break;
            case "twoDouble"://两对
                isCardType = this.typeOfTwoDouble(cardArr);
                break;
            case "threeStrip"://三条
                isCardType = this.typeOfSanTiao(cardArr);
                break;
            case "straight"://顺子
                isCardType = this.typeOfStraight(cardArr);
                break;
            case "sameFlower"://同花
                isCardType = this.typeOfTongHua(cardArr);
                break;
            case "calabash"://葫芦
                isCardType = this.typeOfCalabash(cardArr);
                break;
            case "IronBranch"://铁支
                isCardType = this.typeOfTieZhi(cardArr);
                break;
            case "StraightFlush" ://同花顺
                isCardType = this.typeOfSequence(cardArr);
                break;
            case "fiveSame"://五同
                isCardType = this.typeOfWuTong(cardArr);
                break;
        }
        return isCardType;
    },

    /**获取头墩牌型名字*/
    getHeadCardTypeName:function(cardArr)
    {
        if(this.typeOfSanTiao(cardArr)){
            return cardTypeNameArr[3];
        }else if(this.typeOfOneDouble(cardArr)){
            return cardTypeNameArr[1];
        }else{
            return cardTypeNameArr[1];
        }           
    },

    /**查找所有牌型按钮*/
    findAllCardTypeBtn:function(cardArr)
    {
        var btnNameArr = cardTypeNameArr.slice();
        btnNameArr.splice(0,1);
        var allBtnStatus = [];
        for( var i = 0; i < btnNameArr.length ; i ++){
            var typeName = btnNameArr[i];
            var isHasCardType = this.findTargetCardType(typeName,cardArr);
            var obj = {typeName:typeName,status:isHasCardType};
            allBtnStatus.push(obj);
        }
        return allBtnStatus;     
    },

    /**获取最佳牌型*/
    findBestCardType:function(newCard,mound)
    {
        //最佳牌
        var bestCard        = [];
        //牌型名字
        var typeName        = "";  

        if(mound === 0)
        {
            if(newCard.length <= 3){
                bestCard = this.conversionObj(newCard);
            }else{
                typeName            = this.getHeadCardTypeName(newCard);
                var _currentCard    = this.getBestCardArr(typeName,newCard);
                bestCard            = _currentCard[0];

                if(bestCard.len < 3){ //补牌
                    var _surplusCard = this.removeFoldValue(bestCard,newCard);
                    if(_surplusCard.length > 1){
                        while(bestCard.len < 3){
                            var card = _surplusCard.shift();
                            bestCard.len ++;
                            bestCard["p" + bestCard.len] = {cardValue:card};
                        }
                    }
                }
            }
        }
        else
        {
            if(newCard.length <= 5){
               bestCard = this.conversionObj(newCard);
            }else{
                typeName            = this.getTypeName(newCard);
                var _currentCard    = this.getBestCardArr(typeName,newCard);
                bestCard            = _currentCard[0];
                if(bestCard.len < 5){ //补牌
                    var _surplusCard = this.removeFoldValue(bestCard,newCard);
                    if(_surplusCard.length > 1){
                        while(bestCard.len < 5){
                            var card = _surplusCard.shift();
                            bestCard.len ++;
                            bestCard["p" + bestCard.len] = {cardValue:card};
                        }
                    }
                }
            }
        }
        console.log("====获取最佳牌型====",bestCard);
        return bestCard;
    },

    /**获取牌型和牌数组*/
    getCardGroupData:function()
    {
        var newArr          = [];
        var groupData       = [];
        var cardObj         = {};

        for( var i = 0 ; i < 3  ; i ++ )
        {
            var cardList    = this.getMoundCardData(i);
            newArr          = newArr.concat(cardList);
            var type        = this.getTypeName(cardList);
            var index       = cardTypeNameArr.indexOf(type);
            console.log("======type=========",type,"=======index=======",index);
            var obj         = {card:cardList,type:index};
            groupData.push(obj);
        }
        cardObj.cardData   = groupData,
        cardObj.card       = newArr;
        return cardObj;
    },
 
    /**乌龙*/
    findAllWuLong:function(CardArr)
    {
        var self = this;
        var handCardArr = self.creatorTarget(CardArr);
        handCardArr.sort(self.cardValeSmallSort);
        var arr = [];
        for( var i = 0 ; i < handCardArr.length ; i ++)
        {
            var p1 = handCardArr[i];
            for( var j =i ;j < handCardArr.length; j ++)
            {
                var p2 = handCardArr[j];
                if(p1.cardValue !== p2.cardValue)
                {
                    var obj = {len:1,p1:{cardValue:p1.cardNum}};
                    arr.push(obj);
                }
            }
        }
        arr.sort(self.cardValeSmallSort);
        return arr;
    },
       
    /**对子*/
    findAllOneDouble:function(CardArr)
    {
        var self = this;
        var handCardArr = self.creatorTarget(CardArr);
        handCardArr.sort(self.cardValeBigSort);
        var arr = [];
        var len = handCardArr.length;
        for( var i = 0 ; i < len-1; i ++)
        {
            var p1 = handCardArr[i];
            var p2 = handCardArr[i+1];
            
            if(p1.cardValue === p2.cardValue)
            {
                var obj = { len:2, p1:{cardValue:p1.cardNum},
                                   p2:{cardValue:p2.cardNum}
                          };
                arr.push(obj);
            }
        }
        return arr;
    },
    
    /**两对*/
    findAllTwoDouble:function(CardArr)
    {
        var self = this;
        var handCardArr = self.creatorTarget(CardArr);
        handCardArr.sort(self.cardValeBigSort);
        var arr = [];
        var len = handCardArr.length;
        for( var i = 0 ;  i < len-1 ; i ++)
        {
            var p1 = handCardArr[i];
            var p2 = handCardArr[i+1];
            
            if(p1.cardValue === p2.cardValue)
            {
                for( var j = i ; j < len-1 ; j ++)
                {
                    var p3 = handCardArr[j];
                    var p4 = handCardArr[j+1];
                    
                    if( p2.cardValue !== p3.cardValue && p3.cardValue === p4.cardValue)
                    {
                        var obj = { len:4,p1:{cardValue:p1.cardNum},
                                          p2:{cardValue:p2.cardNum},
                                          p3:{cardValue:p3.cardNum},
                                          p4:{cardValue:p4.cardNum}
                                  };
                        arr.push(obj);
                    }
                }
            }
        }
        return arr;
    },
    
    /**三条*/
    findAllSanTiao:function(CardArr)
    {
        var self = this;
        var handCardArr = self.creatorTarget(CardArr);
        handCardArr.sort(self.cardValeBigSort);
        var arr = [];
        var len = handCardArr.length;
        for( var i = 0 ; i < len-2 ; i ++)
        {
            var p1 = handCardArr[i];
            var p2 = handCardArr[i+1];
            var p3 = handCardArr[i+2];

            if(p1.cardValue == p2.cardValue && p1.cardValue == p3.cardValue)
            {
                var obj = 
                {           len:3,p1:{cardValue:p1.cardNum},
                                  p2:{cardValue:p2.cardNum},
                                  p3:{cardValue:p3.cardNum}
                    
                };
                arr.push(obj);
            }
        }
        return arr;
    },
    
    /**顺子*/
    findAllStraight:function(CardArr)
    {
        var self = this;
        var handCardArr = self.creatorTarget(CardArr);
        var cardDataArr = self.deleteSameCard(handCardArr);
        cardDataArr.sort(self.cardValeBigSort);
        var arr = [];
        var len = cardDataArr.length;
        if(len >= 5)
        {
            for( var i = 0 ; i < len ;i ++)
            {
                if(len - i > 4)
                {
                    var p1 = cardDataArr[i];
                    var p2 = cardDataArr[i+1]; 
                    if( (p1.cardValue - p2.cardValue === 1) && (p2.cardValue - cardDataArr[i+4].cardValue === 3))
                    {
                        var p3  = cardDataArr[i+2];
                        var p4  = cardDataArr[i+3];
                        var p5  = cardDataArr[i+4];
                         
                        var obj = { len:5,  p1:{cardValue:p1.cardNum},
                                            p2:{cardValue:p2.cardNum},
                                            p3:{cardValue:p3.cardNum},
                                            p4:{cardValue:p4.cardNum},
                                            p5:{cardValue:p5.cardNum}
                              };
                     arr.push(obj);
                    } 
                }
                var AStraight = self.getAStraight(cardDataArr);
                if(AStraight.length >= 5){                
                    var p1 = AStraight[0];//A
                    var p2 = AStraight[4];//2
                    var p3 = AStraight[3];//3
                    var p4 = AStraight[2];//4
                    var p5 = AStraight[1];//5
                    var obj = { len:5,      p1:{cardValue:p1.cardNum},
                                            p2:{cardValue:p2.cardNum},
                                            p3:{cardValue:p3.cardNum},
                                            p4:{cardValue:p4.cardNum},
                                            p5:{cardValue:p5.cardNum}
                              };
                    arr.push(obj);
                }
            }      
        }
        return arr; 
    },
     
    /**同花*/
    findAllTongHua:function(CardArr)
    {
        var self = this;
        var handCardArr = self.creatorTarget(CardArr);
        handCardArr.sort(self.cardValeBigSort);

        var blackColor = [];
        var redColor = [];
        var plumColor = [];
        var diamondsColor = [];
        
        var allFlowerArr = []; 
        var arr = [];    
        
        for( var i = 0 ; i < handCardArr.length ; i ++ ){
            var card = handCardArr[i];
            if(card.flower === 3){
                blackColor.push(card);
            }else if(card.flower === 2){
                redColor.push(card);
            }else if(card.flower === 1){
                plumColor.push(card);
            }else if(card.flower === 0){
                diamondsColor.push(card);
            }
        }
        console.log("==blackColor===",blackColor,"==redColor==")
        allFlowerArr = [blackColor,redColor,diamondsColor,plumColor];
        for( var j = 0 ; j < allFlowerArr.length ; j ++)
        {
            var cardArr = allFlowerArr[j];
            var len = cardArr.length;
            if(len >= 5)
            {
                cardArr.sort(self.cardValeBigSort);
                for( var z = 0 ; z < len ; z ++)
                {
                    if(len - z > 4)
                    {
                        var p1 = cardArr[z];
                        var p2 = cardArr[z+1];
                        var p3 = cardArr[z+2];
                        var p4 = cardArr[z+3];
                        var p5 = cardArr[z+4];
                        var obj = { len:5,p1:{cardValue:p1.cardNum},
                                          p2:{cardValue:p2.cardNum},
                                          p3:{cardValue:p3.cardNum},
                                          p4:{cardValue:p4.cardNum},
                                          p5:{cardValue:p5.cardNum}
                              };
                        arr.push(obj);
                    }
                }
            }
        } 
        return arr;
    },
        
    /**葫芦*/ 
    findAllCalabash:function(CardArr)
    {
        var self = this;
        var handCardArr = self.creatorTarget(CardArr);
        handCardArr.sort(self.cardValeBigSort);
        var arr = [];
        var len = handCardArr.length;
        for( var i = len-1 ; i > 0; i -- )
        {
            var p1 = handCardArr[i];
            var p2 = handCardArr[i-1];
            if(p1.cardValue === p2.cardValue)
            {
                for(var j = 0 ; j < len - 2; j ++)
                {
                    var p3 = handCardArr[j];
                    var p4 = handCardArr[j+1];
                    var p5 = handCardArr[j+2];

                    if(p2.cardValue !== p3.cardValue && p3.cardValue === p5.cardValue)
                    {
                        var obj = { len:5,p1:{cardValue:p1.cardNum},
                                          p2:{cardValue:p2.cardNum},
                                          p3:{cardValue:p3.cardNum},
                                          p4:{cardValue:p4.cardNum},
                                          p5:{cardValue:p5.cardNum}
                            
                        };
                      arr.push(obj);
                    }
                }
            }
        }
        return arr;
    },
        
    /** 铁之*/ 
    findAllTieZhi:function(CardArr)
    {
        var self = this;
        var handCardArr = self.creatorTarget(CardArr);
        handCardArr.sort(self.cardValeBigSort);
        var arr = [];
        var len = handCardArr.length;
        for (var i = 0 ; i < len-3 ; i ++ )
        {
            var p1 = handCardArr[i];
            var p2 = handCardArr[i+1];
            var p3 = handCardArr[i+2];
            var p4 = handCardArr[i+3];
            if(p1.cardValue == p2.cardValue && p2.cardValue == p3.cardValue && p3.cardValue == p4.cardValue)
            {
                 var obj = { len:4,p1:{cardValue:p1.cardNum},
                                   p2:{cardValue:p2.cardNum},
                                   p3:{cardValue:p3.cardNum},
                                   p4:{cardValue:p4.cardNum}
                          };
                arr.push(obj);
            }
        }
        return arr;
    },
        
    /**同花顺*/
    findAllSequence:function(CardArr)
    {
        var self = this;
        var handCardArr = self.creatorTarget(CardArr);
        handCardArr.sort(self.cardValeBigSort);
        
        var blackColor = [];
        var redColor = [];
        var plumColor = [];
        var diamondsColor = [];
        
        var allFlowerArr = []; 
        var arr = [];    
        
        for( var i = 0 ; i < handCardArr.length ; i ++ ){
            var card = handCardArr[i];
            if(card.flower === 3){
                blackColor.push(card);
            }else if(card.flower === 2){
                redColor.push(card);
            }else if(card.flower === 1){
                plumColor.push(card);
            }else if(card.flower === 0){
                diamondsColor.push(card);
            }
        }
        allFlowerArr = [blackColor,redColor,diamondsColor,plumColor];
        for( var j = 0 ; j < allFlowerArr.length ; j ++)
        {
            var cardArr = allFlowerArr[j];
            var len = cardArr.length;
            if(len >= 5)
            {
                cardArr.sort(self.cardValeBigSort);
                for( var z = 0 ; z < len ; z ++)
                {
                    if(len - z > 4)
                    {
                        var p1 = cardArr[z];
                        var p2 = cardArr[z+1];
                        if((p1.cardValue - p2.cardValue === 1) && (p2.cardValue -cardArr[z+4].cardValue === 3))
                        {
                            var p3 = cardArr[z+2];
                            var p4 = cardArr[z+3];
                            var p5 = cardArr[z+4];
                            var obj = {len:5,p1:{cardValue:p1.cardNum},
                                             p2:{cardValue:p2.cardNum},
                                             p3:{cardValue:p3.cardNum},
                                             p4:{cardValue:p4.cardNum},
                                             p5:{cardValue:p5.cardNum}
                                        };
                            arr.push(obj);
                        }
                    }
                    var AStraight = self.getAStraight(cardArr);
                    if(AStraight.length >= 5){                
                    var p1 = AStraight[0];//A
                    var p2 = AStraight[4];//2
                    var p3 = AStraight[3];//3
                    var p4 = AStraight[2];//4
                    var p5 = AStraight[1];//5
                    var obj = { len:5,      p1:{cardValue:p1.cardNum},
                                            p2:{cardValue:p2.cardNum},
                                            p3:{cardValue:p3.cardNum},
                                            p4:{cardValue:p4.cardNum},
                                            p5:{cardValue:p5.cardNum}
                              };
                    arr.push(obj);
                    }
                }
            }
        }
        return arr;
    },
        
    /**五同*/
    findAllWuTong:function(CardArr)
    {
        var self = this;
        var arr = [];
        var handCardArr = self.creatorTarget(CardArr);
        handCardArr.sort(self.cardValeBigSort);
        var len = handCardArr.length;
        for( var i = 0 ; i < len-4 ; i ++ )
        {
            var p1 = handCardArr[i];
            var p2 = handCardArr[i+1];
            var p3 = handCardArr[i+2];
            var p4 = handCardArr[i+3];
            var p5 = handCardArr[i+4];
            
            if(p1.cardValue == p2.cardValue && p2.cardValue == p3.cardValue && p3.cardValue == p4.cardValue && p4.cardValue== p5.cardValue)
            {
                 var obj = {len:5,p1:{cardValue:p1.cardNum},
                                 p2:{cardValue:p2.cardNum},
                                 p3:{cardValue:p3.cardNum},
                                 p4:{cardValue:p4.cardNum},
                                 p5:{cardValue:p5.cardNum}
                };
                arr.push(obj);
            }
        }
        return arr;
    },

    typeOfWuTong:function(cardData)
    {
        var cardTargetArr = this.creatorTarget(cardData);
        cardTargetArr.sort(this.cardValeBigSort);
        if(cardTargetArr.length >= 5)
        {
            for( var i = 0 ; i < cardTargetArr.length - 4 ; i ++)
            {
                var p1 = cardTargetArr[i];
                var p2 = cardTargetArr[i+1];
                var p3 = cardTargetArr[i+4]; 
                if(p1.cardValue == p2.cardValue && p1.cardValue == p3.cardValue)
                    return true;
            }
        } 
        return false;     
    },

    typeOfSequence:function(cardData)
    {
        var self = this;
        var cardArr = self.creatorTarget(cardData);
        cardArr.sort(self.cardValeBigSort);
        if(cardArr.length >= 5)
        {
            var blackColor      = [];
            var redColor        = [];
            var plumColor       = [];
            var diamondsColor   = [];
            var flowerArr       = [];

            for( var i = 0 ; i < cardArr.length ; i ++ ){
                var card = cardArr[i];
                if(card.flower === 3){
                    blackColor.push(card);
                }else if(card.flower === 2){
                    redColor.push(card);
                }else if(card.flower === 1){
                    plumColor.push(card);
                }else if(card.flower === 0){
                    diamondsColor.push(card);
                }
            }
            flowerArr = [blackColor,redColor,plumColor,diamondsColor];
            for( var j = 0 ; j < 4 ; j ++)
            {
                var arr = flowerArr[j];
                if(arr.length >=5)
                {
                    arr.sort(self.cardValeBigSort);
                    for( var z = 0 ; z < arr.length - 4 ; z ++)
                    {
                        var p1 = arr[z];
                        var p2 = arr[z+1];
                        var p3 = arr[z+4];
                        if(p1.cardValue - p2.cardValue == 1 && p1.cardValue - p3.cardValue == 4)
                            return true;
                        var AStraight = self.getAStraight(arr);
                        if(AStraight.length >= 5)
                            return true;
                    }
                }
            }
        }
        return false;
    },

    typeOfTieZhi:function(cardData)
    {
        var self = this;
        var cardTargetArr = self.creatorTarget(cardData);
        cardTargetArr.sort(self.cardValeBigSort);
        if(cardTargetArr.length >= 4)
        {
            for(var i = 0 ; i < cardTargetArr.length -3 ; i ++ )
            {
                var p1 = cardTargetArr[i];
                var p2 = cardTargetArr[i+1];
                var p3 = cardTargetArr[i+3];
                if(p1.cardValue == p2.cardValue && p1.cardValue == p3.cardValue)
                    return true;
            }
        }
        return false;
    },

    typeOfCalabash:function(cardData)
    {
        var self = this;
        var cardTargetArr = self.creatorTarget(cardData);
        cardTargetArr.sort(self.cardValeBigSort);   
        var len = cardTargetArr.length;
        if(cardTargetArr.length >= 5)
        {
            for( var i = len-1; i > 0 ; i -- )
            {
                var p1 = cardTargetArr[i];
                var p2 = cardTargetArr[i-1];

                if(p1.cardValue === p2.cardValue)
                {
                    for( var j = 0; j < len-2 ; j ++)
                    {
                        var p3 = cardTargetArr[j];
                        var p4 = cardTargetArr[j+1];
                        var p5 = cardTargetArr[j+2]; 
                        if(p2.cardValue !== p3.cardValue && p3.cardValue == p5.cardValue)
                            return true;
                    }
                }

            }
        }
        return false;
    },

    typeOfTongHua:function(cardData)
    {
        var self = this;
        var cardTargetArr = self.creatorTarget(cardData);
        cardTargetArr.sort(self.cardValeBigSort);
        if(cardTargetArr.length >= 5)
        {
            var blackColor = [];
            var redColor = [];
            var plumColor = [];
            var diamondsColor = [];

            for( var i = 0 ; i < cardTargetArr.length ; i ++ )
            {
                var card = cardTargetArr[i];
                if(card.flower === 3){
                    blackColor.push(card);
                }else if(card.flower === 2){
                    redColor.push(card);
                }else if(card.flower === 1){
                    plumColor.push(card);
                }else if(card.flower === 0){
                    diamondsColor.push(card);
                }
            }
            if(blackColor.length >=5 || redColor.length >=5 || plumColor.length >=5 || diamondsColor.length >=5)
                return true;
        }
        return false;
    },

    typeOfStraight:function(cardData)
    {
        var self = this;
        var cardTargetArr = self.creatorTarget(cardData);
        cardTargetArr.sort(self.cardValeBigSort);
        var cardArr = self.deleteSameCard(cardTargetArr);
        if(cardArr.length >= 5)
        {
            for( var  i = 0 ; i < cardArr.length -4 ; i ++)
            {
                var p1 = cardArr[i];
                var p2 = cardArr[i+1];
                var p3 = cardArr[i+4];

                if( p1.cardValue - p2.cardValue == 1 && p2.cardValue - p3.cardValue == 3)             
                    return true;
                var AStraight = self.getAStraight(cardArr);
                if(AStraight.length >= 5)
                        return true;
            }
        }
        return false;
    },

    typeOfSanTiao:function(cardData)
    {
        var self = this;
        var cardTargetArr = self.creatorTarget(cardData);
        cardTargetArr.sort(self.cardValeBigSort);
        if(cardTargetArr.length >= 3)
        {
            for( var i = 0 ; i < cardTargetArr.length-2 ; i ++ )
            {
                if (cardTargetArr[i].cardValue == cardTargetArr[i+2].cardValue)
                    return true;
            }
        }
        return false;
    },

    typeOfTwoDouble:function(cardData)
    {
        var self = this;
        var cardTargetArr = self.creatorTarget(cardData);
        cardTargetArr.sort(self.cardValeBigSort);
        var len     = cardTargetArr.length-1;
        if(len >= 4){
            var count   = 0;
            var index   = 0;
            while( index < len){
                var p1 = cardTargetArr[index].cardValue;
                var p2 = cardTargetArr[index+1].cardValue;
                if ( p1 === p2){
                    count ++;
                    index += 2;
                }else{
                    index += 1;
                }
            }
            if(count > 1) 
                return true;
            else
                return false;
        }
    },

    typeOfOneDouble:function(cardData)
    {
        var self = this;
        var cardTargetArr = self.creatorTarget(cardData);
        cardTargetArr.sort(self.cardValeBigSort);
        if(cardTargetArr.length >= 2)
        {
            for( var i = 0 ; i < cardTargetArr.length -1 ; i ++)
            {
                if(cardTargetArr[i].cardValue === cardTargetArr[i+1].cardValue)
                return true;
            }
        }
        return false;
    },

    /**删除已选牌*/
    removeFoldValue:function(target,arr)
    {
        var cardArr = arr.slice();
        for (var key in target){
            var obj = target[key];
            var _idx = cardArr.indexOf(obj.cardValue);
            if(_idx !== -1){
                cardArr.splice(_idx,1);
            }
        }
        return cardArr;
    },

    removeArrValue:function(arr,arr1){
        var cardArr = arr1.slice();
        for( var i = 0 ; i < arr.length ; i ++ ){
            var value = arr[i];
             var _idx = arr1.indexOf(value);
            if(_idx !== -1){
                arr1.splice(_idx,1);
            }
        }   
        return arr1;
    },

     /**去除相同的牌 只留一张判断*/
    deleteSameCard:function(cardData)
    {
        var cardArr = cardData.slice();
        for(var i = 0 ; i < cardArr.length ; i ++)
        {
            var p1 = cardArr[i];
            for( var j = i + 1 ; j < cardArr.length; j ++)
            {
                var p2 = cardArr[j];
                if(p1.cardValue === p2.cardValue)
                {
                    cardArr.splice(j,1);
                    j --;
                }
            }
        }
        return cardArr;
    },

    getAStraight:function(cardList){
        var arr = [];
        for( var i = 0 ; i < cardList.length ; i ++){
            var obj = cardList[i];
            if(obj){
                if(obj.cardValue === 14 || obj.cardValue === 2 || obj.cardValue === 3 || obj.cardValue === 4 || obj.cardValue === 5)
                {
                     arr.push(obj);
                }
            }
        }
        return arr;
    },

    //获取有效的牌节点
    getEffectiveCard:function()
    {
        var handCardClass = require("MyHandCardView");
        var efCardArr = [];
        var arr = handCardClass.myCardArr
        for( var i = 0; i < arr.length; i ++){
            var _cardNode = arr[i];
            if(_cardNode && _cardNode.cardNum > 0){
                efCardArr.push(_cardNode);
            }
        }
        return efCardArr;
    },
    
    //获取有效的牌值
    getCardNum:function(targetArr){
        var cardNumArr = [];
        for(var i = 0 ; i < targetArr.length ; i ++){
            var _cardNode = targetArr[i];
            var _num = _cardNode.cardNum;
            cardNumArr.push(_num);
        }
        console.log("====有效的牌====",cardNumArr);
        return cardNumArr;
    },

    /**
     * 解析比牌结果数据
     */
    analysisCardResultData:function(result)
    {
        var len               = result.length;
        var resultData        = {};
        //是否全垒打 3个人以上才有全垒打
        resultData.swat       = false;
        //人数
        resultData.player     = len ;
        //是否打枪
        resultData.isShot     = false;
        //普通牌型数据
        var _cardResult        = [];
        //特殊牌型数据
        var _spCardResult      = [];
        //玩家总分  
        var userScoreList      = [];
        for(var z = 0 ; z < len; z ++){
            var _data = result[z];
            userScoreList.push(_data.round_score);
        }
        for( var i = 0 ; i < resultData.player ; i ++)
        {
            var data        = result[i];
            var obj         = {};
            //牌数据
            obj.cardList    = [];
            //牌型数据      
            obj.typeList    = data.card_type;
            //分数数据
            obj.scoreList   = [];
            //打枪数据
            obj.shotList    = [];
            //特殊牌型数据
            obj.specialList = [];
            obj.mySocre     = userScoreList[data.seat];
            //玩家座位
            obj.seat        = data.seat;
            //特殊牌型
            if(data.spec_scores.length > 0){
                var spDataList = [];                
                for(var z = 0; z < data.spec_scores.length ; z ++)
                {
                    var _typeArr = data.spec_scores[z];
                    if(_typeArr.length > 0){
                        var specialData = {};
                        //特殊牌型所属者
                        specialData.dseat = data.seat;
                        //特殊牌型被打者
                        specialData.bseat = _typeArr[0];
                        //特殊牌型索引
                        specialData.spType = _typeArr[1];
                        //当前玩家总分
                        specialData.totalScore = userScoreList[specialData.bseat];
                        spDataList.push(specialData)
                        obj.specialList.push(spDataList);
                    }
                }
                _spCardResult.push(obj);
                continue;
            }
            else
            {
                if(data.shot.length > 0){           
                    resultData.isShot = true;
                }
                if(len >= 3){
                    if(data.shot.length === len ){
                        resultData.swat       = true;
                    }
                }
                for( var j = 0 ; j < 3 ; j ++)
                {    
                    var _score = {};
                    //普通加分
                    _score.pScore = data.heap_scores[j][0];
                    //特殊加分
                    _score.sScore = data.heap_scores[j][1];
                    obj.scoreList.push(_score);

                    var _card = [];
                    switch(j){
                        case 0:
                            _card = data.out_card.slice(0,3);
                            break;
                        case 1:
                            _card = data.out_card.slice(3,8);
                            break;
                        case 2:
                            _card = data.out_card.slice(8,13);
                            break;
                    }           
                    obj.cardList.push(_card);
                } 
                //打枪数据 dShot打枪者 bShot被打者 shotSocre打枪分数
                for( var k = 0 ; k < data.shot.length ; k ++)
                {
                    var _shotData      = data.shot[k];
                    var shotObj        = {};
                    shotObj.dShot      = obj.seat;
                    shotObj.bShot      = _shotData[0];
                    shotObj.shotSocre  = _shotData[1];
                    obj.shotList.push(shotObj)
                }
                _cardResult.push(obj);
            }      
        }
        resultData.cardResult   = _cardResult;
        resultData.spCardResult = _spCardResult;
        return  resultData;    
    },

    //用于解析比牌 == > 排序 找出比牌先后顺序 
    analysisSortData:function(data)
    {
        var cardResult = data.cardResult;
        var arr = [];

        for(var i = 0 ; i < 3 ; i ++)
        {
            var groupList    = [];
            for( var j = 0 ; j < cardResult.length ; j ++ )
            {
                var obj     = cardResult[j];
                var group   = {};
                group.card  = obj.cardList[i];
                group.score = obj.scoreList[i];
                group.type  = obj.typeList[i];
                group.seat  = obj.seat; 
                groupList.push(group);
            }
           arr.push(groupList); 
        }
        return arr;
    },

    /**
     * 按牌面大小排序
     * @groupCard 所有牌组
     */
    sortGroupValue:function(data)
    {
        var arr = [];
        /**如果牌型相同就比最大的牌*/
        var cardTypeSort = function(a,b)
        {           
            if(a.type === b.type)
            {
                var a1 = this.creatorTarget(a.card);
                a1.sort(this.cardValeBigSort);
                var a2 = a1[0];

                var b1 = this.creatorTarget(b.card);
                b1.sort(this.cardValeBigSort);
                var b2 = b1[0];
                return a2.cardValue - b2.cardValue;
            }else{
                return a.type - b.type;
            }
        }.bind(this);   

        for( var i = 0 ; i < data.length ; i ++)
        {
            var groupList = data[i];
            groupList.sort(cardTypeSort);
            arr.push(groupList)
        } 
        console.log("=====排序后得到的数据是====",arr);
        return arr;
    }, 
});
