var MJ_JIN = 37;

cc.Class({
    extends: cc.Component,

    properties: {
        cardAtlas: {
            default:null,
            type:cc.SpriteAtlas
        },
        _sides:null
    },
    
    onLoad:function(){
        if(cc.vv == null){
            return;
        }
        this._sides = ["myself","right","up","left"];
        cc.vv.xmssManger  = this;
    },
            
    getAudioURLByMJID:function(id){
        var jin = cc.vv.gameNetMgr.jin;
        if (id === MJ_JIN) {
            id = jin;
        } else if (id === jin) {
            id = MJ_JIN;
        }
        return "mj/" + id + ".mp3";
    },
        
    sortMJ:function(mahjongs){
        var self = this;
        mahjongs.sort(function(a,b){
            if (a === 37) {
                return -1;
            }
            if (b === 37) {
                return 1;
            }
            return a - b;
        });
    },
    
    getSide:function(localIndex){
        return this._sides[localIndex];
    }
});
