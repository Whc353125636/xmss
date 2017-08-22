//房费配置
var roomCoinConfig = [[14,18,24],[14,18,24],[16,21,28],[16,21,28]];

cc.Class({
    extends: cc.Component,

    properties: {

    },

    init:function()
    {
        /**
         * 四种模式参数配置
         * @type ==> 模式 0普通十三水 1坐庄十三水 2 加一色十三水 3 加一色坐庄十三水  
         * @player人数           @innings局数          @integral积分           @coin房卡数量
         * @double是否选择马牌   @cardValue马牌牌值(0 黑桃5 1黑桃10 2黑桃A)    @divide是否分摊房费 
         * @caps坐庄封顶倍数     @addflowers是否加两色 @flowers[1,0,0,0]
         */
        this.roomConfig = [
                    {integral:0,double:0,divide:0,cardValue:0},
                    {caps:0,double:0,cardValue:0},
                    {integral:0,divide:0,addflowers:0,flowers:[1,0,0,0]},
                    {caps:0,addflowers:0,flowers:[1,0,0,0]}
                 ];
        //暂时存本地只存这4个参数
        this.localData = {roomType:0,player:0,innings:0,cardValue:0};

        var data = JSON.parse(cc.sys.localStorage.getItem("localdata"));
        if(data !== null){
            this.upRoomData(data);  
        }
        else{ 
            this.Localstore();
        }
    },

    upRoomData:function(roomData)
    {       
        this.localData.player         = roomData.player;
        this.localData.innings        = roomData.innings;
        this.localData.roomType       = roomData.roomType;
    },

    //重置对应房间类型的选择数据默认选第一个
    reset:function(index)
    {
        var data = this.roomConfig(index);
        for( var key in data){
            data[key]  = 0;
        }
    },

    //计算所需房卡数量 暂时随便写一套
    calculateRoomCard:function()
    {
        var coin = 0;
        var data = this.roomConfig[this.localData.roomType];
        coin = roomCoinConfig[this.localData.roomType][this.localData.player];
        for(var key in data)
        {
            if(key === "divide")
            {
                if(data.divide > 0){
                    coin = coin / (this.roomConfig.player+1); 
                }
            }
        } 
        return coin;
    },

    Localstore:function()
    {
        cc.sys.localStorage.setItem("localdata",JSON.stringify(this.localData));
    },

});
