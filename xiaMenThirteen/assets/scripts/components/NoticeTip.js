cc.Class({
    extends: cc.Component,

    properties: {
        _tip:null,
        _bg:null,
        _info:null,
        _tipTime:-1,
    },

    onLoad: function () {
        this._tip = cc.find("Canvas/time_notice");
        this._tip.active = false;
        
        this._info = cc.find("Canvas/time_notice/info").getComponent(cc.Label);
        this._bg = cc.find("Canvas/time_notice/bg");
        
        var self = this;
        this.node.on('push_notice',function(data){
            var data = data.detail;
            self._tip.active = true;
            self._tipTime = data.time;
            self._info.string = "当局将于"+data.time + "秒后结束";
            self._bg.width = self._info.node.width + 20;
        });
    },
    
    update: function (dt) {
       if(this._tipTime > 0){
           this._tipTime -= dt;
           if(this._tipTime < 0){
               this._tip.active = false;
           }
       }
    },
});
