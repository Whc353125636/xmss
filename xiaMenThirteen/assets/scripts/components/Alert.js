cc.Class({
    extends: cc.Component,

    properties: {
        _alert:null,
        _btnOK:null,
        _btnCancel:null,
        _title:null,
        _content:null,
        _onok:null,
        _cancelFun:null,
    },

    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        this._alert = cc.find("Canvas/alert");
        this._title = cc.find("Canvas/alert/title").getComponent(cc.Label);
        this._content = cc.find("Canvas/alert/content").getComponent(cc.Label);
        
        this._btnOK = cc.find("Canvas/alert/btn_ok");
        this._btnCancel = cc.find("Canvas/alert/btn_cancel");
        
        cc.vv.utils.addClickEvent(this._btnOK,this.node,"Alert","onBtnClicked");
        cc.vv.utils.addClickEvent(this._btnCancel,this.node,"Alert","onBtnClicked");
        
        this._alert.active = false;
        cc.vv.alert = this;
    },
    
    onBtnClicked:function(event){
         cc.vv.audioMgr.playSFX("btnClick.mp3");
        if(event.target.name == "btn_ok"){
            if(this._onok){
                this._onok();
            }
        }else if(event.target.name == "btn_cancel"){
            if(this._cancelFun){
               this._cancelFun();
            }
        }
        this._alert.active = false;
        this._onok = null;
        this._cancelFun = null;
    },
    
    show:function(title,content,onok,needcancel,cancelFun){
        this._alert.active = true;
        this._onok = onok;
        this._cancelFun = cancelFun;
        this._title.string = title;
        this._content.string = content;
        if(needcancel){
            this._btnCancel.active = true;
            this._btnOK.x = -150;
            this._btnCancel.x = 150;
        }
        else{
            this._btnCancel.active = false;
            this._btnOK.x = 0;
        }
    },
    
    onDestory:function(){
        if(cc.vv){
            cc.vv.alert = null;    
        }
    }

});
