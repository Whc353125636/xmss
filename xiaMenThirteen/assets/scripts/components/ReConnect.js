cc.Class({
    extends: cc.Component,

    properties: {
        _reconnect:null,
        _lblTip:null,
        _lastPing:0,
    },

    onLoad: function () {
        this._reconnect = cc.find("Canvas/reconnect");
        this._lblTip = cc.find("Canvas/reconnect/tip").getComponent(cc.Label);
        var self = this;
        
        var fnTestServerOn = function(){
            cc.vv.net.test(function(ret){
               if(ret){
                    cc.director.loadScene('hall');                
               }
               else{
                   setTimeout(fnTestServerOn,3000);
               }
            });
        }
        
        var fn = function(data){
            self.node.off('disconnect',fn);
            self._reconnect.active = true;
            fnTestServerOn();
        };
        this.node.on('disconnect',fn);
    },

    update: function (dt) {
        if(this._reconnect.active){
            var t = Math.floor(Date.now() / 1000) % 4;
            this._lblTip.string = "与服务器断开连接，正在尝试重连";
            for(var i = 0; i < t; ++ i){
                this._lblTip.string += '.';
            }
        }
    },
});
