var spacePos = [-20,25,-20];
cc.Class({
    extends: cc.Component,

    properties: {
        index:0,
    },

    onLoad: function () {
        this.index = 0;
    },

    init:function(idx){
        this.index = idx;
        this.hide(); 
    },

    reset:function(){
        this.node.x = 0;
        this.node.y = 0;
        this.hide();
    },

    hide:function(){
        this.node.active = false;
    },

    show:function(){
        this.node.active = true;
    },

    startAn:function(idx){
        var _space  = spacePos[idx];
        switch(idx){
            case 0:
                this.node.y = this.index *_space;
                this.node.x = 0;
                break;
            case 1:
                this.node.x = this.index *_space;
                 this.node.y = 0;
                break;
            case 2:
                this.node.y = this.index *_space;
                 this.node.x = 0;
                break;
        }
        this.show();
    },
});
