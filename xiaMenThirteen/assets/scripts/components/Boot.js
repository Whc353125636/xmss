cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad: function () {
        if (cc.sys.isMobile) {
            cc.director.loadScene("update");
        } else {
            cc.director.loadScene("loading");
        }
    }
});
