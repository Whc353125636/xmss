cc.Class({
    extends: cc.Component,

    properties: {
        pos:null,
    },

    addClickEvent:function(node,target,component,handler){
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },
    
    addSlideEvent:function(node,target,component,handler){
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var slideEvents = node.getComponent(cc.Slider).slideEvents;
        slideEvents.push(eventHandler);
    },

    extChildren: function (parent, count, posfun) {
        var pos = this.pos;
        if (!pos) {
            pos = this.pos = cc.p();
        }

        var tmp = parent.children[0], newTmp;
        pos.x = tmp.x;
        pos.y = tmp.y;
        for (var i = 0; i < count - 1; ++i) {
            newTmp = cc.instantiate(tmp);
            posfun(pos, i + 1);
            newTmp.x = pos.x;
            newTmp.y = pos.y;
            parent.addChild(newTmp);
        }
    },

});
