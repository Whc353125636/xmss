cc.Class({
    extends: cc.Component,

    editor: {
        menu: "Game/OnBack"
    },

    properties: {
        backBtn: {
            default: null,
            type: cc.Node
        }
    },

    onLoad: function () {
        cc.vv.utils.addClickEvent(this.backBtn,this.node,"OnBack","onBtnClicked");        
    },
    
    onBtnClicked:function(event){
        cc.vv.audioMgr.playSFX("btnClick.mp3");
        if(event.target == this.backBtn){
            this.node.active = false;
        }
    }

});
