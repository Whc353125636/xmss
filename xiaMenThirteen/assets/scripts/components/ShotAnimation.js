
var bulletUrl = "bulletAm_";
var gunUrl    = "gunAm_";
//打枪
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function ()
    {
        console.log("====================初始化打枪动画=================");
        this.shotAnimation = cc.find("Canvas/shotAnimation");

        var gunNode = this.shotAnimation.getChildByName("gunNode");
        cc.vv.utils.extChildren(gunNode, 4, (pos,i)=>{(i === 1) && (pos.x = 400,pos.y = 185);(i === 2) 
            &&(pos.x = 0,pos.y = 350);(i ===3)&&(pos.x = -400,pos.y=185)});
        //4方位打枪节点
        this.gunNodeList = gunNode.children;

        var bulletNode = this.shotAnimation.getChildByName("bulletNode");
        cc.vv.utils.extChildren(bulletNode, 4, (pos,i)=>{(i === 1) && (pos.x = 400,pos.y = 185);(i === 2) 
            &&(pos.x = 0,pos.y = 350);(i ===3)&&(pos.x = -400,pos.y=185)});
        //4方位子弹节点
        this.bulletNodeList = bulletNode.children;

        //4方位子弹动画
        this.bulletList = [];
        //4方位打枪动画
        this.gunList    = [];
        //总打枪次数
        this.shotLen    = 0;
        //打枪数据
        this.shotData   = null;

        for( var i = 0 ; i < 4 ; i ++ )
        {
            //子弹动画
            var bulletAnNode    = this.bulletNodeList[i];
            bulletAnNode.active = false;
            var bulletAnimation = bulletAnNode.getComponent(cc.Animation); 
            bulletAnimation.on('finished',this.bulletAnCallBack,this);
            this.bulletList.push(bulletAnNode);
            //打枪动画
            var gunAnNode     = this.gunNodeList[i];
            var gunAnimation  = gunAnNode.getComponent(cc.Animation);
            gunAnNode.active  = false;
            gunAnimation.on('finished',this.gunAnCallBack,this);
            this.gunList.push(gunAnNode);
        }
        this.initEventHandlers();
    },

    initEventHandlers:function()
    {
        var self = this;
        self.node.on('playShotAnimation',function(data){
            self.shotLen    = 0;
            self.shotData   = [];
            //是否需要播放特殊牌型动画
            self.isSpAnimation = false;
            self.shotData   = data.detail.shotData;
            //特殊牌型数据
            self.isSpAnimation = data.detail.bool;
            self.startAnimaton();
        });

        self.node.on('gameOver',function(data){
            self.unschedule(self.playAnimation);
            self.restAmNodeState();
        });
    },

    startAnimaton:function(){
        if(this.shotLen >= this.shotData.length){
            this.unschedule(this.playAnimation);
            this.restAmNodeState();
            //如果有特殊牌型 这里需要执行特殊牌型动画
            if(this.isSpAnimation > 0){
                console.log("=====发送特殊牌型动画===========");
                cc.vv.gameNetMgr.dispatchEvent("playSpAnimation");
            }
            //设置动画节点状态
            cc.vv.gameNetMgr.dispatchEvent("upAmNodeState",{bool:false});
            return;
        }
        this.schedule(this.playAnimation,2);
    },

    playAnimation:function(){
        var obj = this.shotData[this.shotLen];
        if(obj){
            console.log("===========播放打枪动画============");
            //打枪者
            var dSeat = cc.vv.gameNetMgr.getLocalIndex(obj.dShot);
            //被打者
            var bSeat = cc.vv.gameNetMgr.getLocalIndex(obj.bShot);
            //动画路径
            var shotUrl   = gunUrl + dSeat + "_"+bSeat;
            //打枪动画节点
            var _gunNode   = this.gunList[dSeat];
            _gunNode.active = true;
            //子弹动画节点
            var _bulletNode = this.bulletList[bSeat];
            _bulletNode.active = true;
            //播放打枪动画
            _gunNode.getComponent(cc.Animation).play(shotUrl);
            //被打者减去的总分 没有计算打枪的乘积 打完一枪 自己的分数应在加一次被打者的分数
            if(obj.dShot === cc.vv.gameNetMgr.seatIndex || obj.bShot === cc.vv.gameNetMgr.seatIndex){
                cc.vv.gameNetMgr.dispatchEvent("upScore",{score:obj.shotSocre,seat:cc.vv.gameNetMgr.seatIndex});
            }
            //播放子弹动画
            _bulletNode.getComponent(cc.Animation).play(bulletUrl+bSeat);        
        }
    },

    //子弹
    bulletAnCallBack:function(event){
        var bSeat = event.target.name.name.split("_")[1];
        var _node = this.bulletList[bSeat];
        _node.getComponent(cc.Animation).stop();
        _node.active = false;
        console.log("=====子弹动画完成==========",bSeat);
    },

    //打枪
    gunAnCallBack:function(event){
        var dSeat = event.target.name.split("_")[1];
        var _node = this.gunList[dSeat];
        _node.getComponent(cc.Animation).stop();
        _node.active = false;
        this.shotLen ++;
        console.log("=====打枪动画完成==========",this.shotLen);
    },

    restAmNodeState:function(){
        for( var i = 0 ; i < 4 ; i ++ ){
            var gun     = this.gunList[i];
            var bullet  = this.bulletList[i];
            gun.active  = false;
            bullet.active = false;
        }
    },
})