cc.Class({
    extends: cc.Component,

    properties: {
        dataEventHandler: null,
        roomId: null,
        maxNumOfGames: 0,
        numOfGames: 0,

        seatIndex: -1,      //获取自己seat数据的索引
        seats: null,
        gamestate: "",
        isOver: false,
        dissoveData: null,
    },
    
    reset:function(){
        this.gamestate = "";
        this.curaction = null;

        if (!this.seats) {
            return;
        }
        for(var i = 0; i < this.seats.length; ++i){        
            this.seats[i].folds = [];
            this.seats[i].ready = false;
        }
    },
    
    clear:function(){
        this.dataEventHandler = null;
        if(this.isOver == null){
            this.seats = null;
            this.roomId = null;
            this.maxNumOfGames = 0;
            this.numOfGames = 0;        
        }
    },
    
    dispatchEvent:function(event,data){
        if(this.dataEventHandler){
            this.dataEventHandler.emit(event,data);
        }    
    },
    
    //获取玩家座位索引
    getSeatIndexByID:function(userId){
        for(var i = 0; i < this.seats.length; ++i){
            var s = this.seats[i];
            if(s.userid == userId){
                return i;
            }
        }
        return -1;
    },
    
    isOwner:function(){
        return this.seatIndex == 0;   
    },
    
    getSeatByID:function(userId){
        var seatIndex = this.getSeatIndexByID(userId);
        var seat = this.seats[seatIndex];
        return seat;
    },
    
    getSelfData:function(){
        return this.seats[this.seatIndex];
    },
    
    getLocalIndex:function(index){
        var ret = (index - this.seatIndex + 4) % 4;
        return ret;
    },
    
    getWanfa:function(){
        var conf = this.conf;
        if(conf && conf.jushu!=null){
            var strArr = ["厦门麻将"];
            strArr.push(conf.jushu + "局");
            strArr.push(conf.big ? "有大牌" : "无大牌");
            strArr.push("游金" + conf.yjbase + "倍");
            return strArr.join(" ");
        }
        return "";
    },
    
    initHandlers:function()
    {
        var self = this;
        cc.vv.net.addHandler("login_result",function(data){   

            console.log("============data.errcode==============",data.errcode);

            if(data.errcode === 0){
                self.reset();
                var data = data.data;
                self.roomId = data.roomid;
                self.conf = data.conf;
                self.maxNumOfGames = data.conf.jushu;
                self.numOfGames = data.numofgames;
                self.seats = data.seats;
                self.seatIndex = self.getSeatIndexByID(cc.vv.userMgr.userId);
                self.isOver = false;
                cc.director.loadScene("mjgame");
            }
            else if(data.errcode  === 1){
                self.gamestate   = data.state;
                var data = data.data;
                self.roomId = data.roomid;
                self.conf = data.conf;
                self.maxNumOfGames = data.conf.jushu;
                self.numOfGames = data.numofgames;
                self.seats = data.seats;
                self.seatIndex = self.getSeatIndexByID(cc.vv.userMgr.userId);
                self.isOver = false;
                cc.director.loadScene("mjgame");  

                //加载场景需要时间 故延迟时间处理
                setTimeout(function(){
                    if(data.recover.is_settle === false) //牌阶段
                    {
                         //更新玩家信息
                        for(var i = 0; i < self.seats.length ; i ++){
                            var seatData = self.seats[i];
                            self.dispatchEvent('user_state_changed',seatData);
                        }
                        //更新牌数据
                        self.dispatchEvent('game_sync',{syncData:data.recover});      
                    }
                    else //结算状态
                    { 
                        cc.vv.gameNetMgr.dispatchEvent("gameOver");
                        var results = data.recover.settle.results;
                        console.log("=====data.results==========",data.results);
                        console.log("=====data.endinfo==========",data.endinfo);
                        for(var i = 0; i <  self.seats.length; ++i){
                            self.seats[i].score = results.length == 0? 0:results[i].total_score;
                        }
                        self.dispatchEvent('game_over',results);
                        if( data.recover.settle.endinfo){
                            self.isOver = true;
                            self.dispatchEvent('game_end', data.recover.settle.endinfo);    
                        }
                        self.reset();
                        for(var i = 0; i <  self.seats.length; ++i){
                            self.dispatchEvent('user_state_changed',self.seats[i]);    
                        }
                    }
                },200);
                               
            }
            else{
                 console.log("============错误的标识是========",data.errmsg);
            }
        });

        cc.vv.net.addHandler("exit_result",function(data){
            console.log("=============exit_result============");
            self.roomId = null;
            self.seats = null;
        });
        
        cc.vv.net.addHandler("exit_notify_push",function(data){
           console.log("=============exit_notify_push============");
           var userId = data;
           var s = self.getSeatByID(userId);
           if(s != null){
               s.userid = 0;
               s.name = "";
               self.dispatchEvent("user_state_changed",s);
           }
        });
        
        cc.vv.net.addHandler("dispress_push",function(data){
            console.log("*****************dispress_push***************");
            self.roomId = null;
            self.seats = null;
        });
                
        //服务器断开连接
        cc.vv.net.addHandler("disconnect",function(data){
            console.log("=============服务器断开连接============");
            if(self.roomId == null){
                cc.director.loadScene("hall");
            }else{
                if(self.isOver === false){
                    cc.vv.userMgr.oldRoomId = self.roomId;
                    self.dispatchEvent("disconnect");                    
                }else{
                    self.roomId = null;
                }
            }
        });
        
        //玩家进入游戏
        cc.vv.net.addHandler("new_user_comes_push",function(data)
        {
            var seatIndex = data.seatindex;
            if(self.seats[seatIndex].userid > 0){
                self.seats[seatIndex].online = true;
            }else{
                data.online = true;
                self.seats[seatIndex] = data;
            }
            self.dispatchEvent('new_user',self.seats[seatIndex]);
        });
        
        //更新玩家在线状态
        cc.vv.net.addHandler("user_state_push",function(data){
            var userId = data.userid;
            var seat = self.getSeatByID(userId);
            seat.online = data.online;
            self.dispatchEvent('user_state_changed',seat);
        });
        
        //玩家准备
        cc.vv.net.addHandler("user_ready_push",function(data){
            console.log("=============收到玩家准备消息============");
            var userId = data.userid;
            var seat = self.getSeatByID(userId);
            seat.ready = data.ready;
            self.dispatchEvent('user_state_changed',seat);
        });

        //开始发牌 获取自己手牌数据
        cc.vv.net.addHandler("game_holds_push",function(data)
        {
            var seat = self.seats[self.seatIndex]; 
            seat.holds = data;           
            for(var i = 0; i < self.seats.length; ++i){
                var s = self.seats[i]; 
                s.ready = false;
            }
            self.dispatchEvent('game_holds');
        });
        
        //游戏开始
        cc.vv.net.addHandler("game_begin_push",function(data){
            self.gamestate = "begin";
            self.dispatchEvent('game_begin');
        });
        
        //游戏正在进行中
        cc.vv.net.addHandler("game_playing_push",function(data){
            self.gamestate = "playing"; 
        });
        
        // //断线重连
        // cc.vv.net.addHandler("game_sync_push",function(data){
        //     console.log("=============断线重连============");
        //     self.gamestate   = data.state;
        //     //更新局数
        //     self.dispatchEvent('game_num');
        //     //更新玩家信息
        //     for(var i = 0; i < self.seats.length ; i ++){
        //         var seatData = self.seats[i];
        //         self.dispatchEvent('user_state_changed',seatData);
        //     }
        //     //更新牌数据
        //     self.dispatchEvent('game_sync',{syncData:data});
        // });
        
        //更新游戏局数
        cc.vv.net.addHandler("game_num_push",function(data){
            self.numOfGames = data;
            self.dispatchEvent('game_num');
        });

        cc.vv.net.addHandler("game_over_push",function(data){
            console.log("============游戏结束============");
            cc.vv.gameNetMgr.dispatchEvent("gameOver");
            var results = data.results;
            console.log("=====data.results==========",data.results);
            console.log("=====data.endinfo==========",data.endinfo);
            for(var i = 0; i <  self.seats.length; ++i){
                self.seats[i].score = results.length == 0? 0:results[i].total_score;
            }
            self.dispatchEvent('game_over',results);
            if(data.endinfo){
                self.isOver = true;
                self.dispatchEvent('game_end',data.endinfo);    
            }
            self.reset();
            for(var i = 0; i <  self.seats.length; ++i){
                self.dispatchEvent('user_state_changed',self.seats[i]);    
            }
        });  
        
        cc.vv.net.addHandler("chat_push",function(data){
            self.dispatchEvent("chat_push",data);    
        });
        
        cc.vv.net.addHandler("quick_chat_push",function(data){
            self.dispatchEvent("quick_chat_push",data);
        });
        
        cc.vv.net.addHandler("emoji_push",function(data){
            self.dispatchEvent("emoji_push",data);
        });
        
        //更新玩家解散房间选择状态
        cc.vv.net.addHandler("dissolve_notice_push",function(data){
            self.dissoveData = data;
            self.dispatchEvent("dissolve_notice",data);
        });
        
        cc.vv.net.addHandler("dissolve_cancel_push",function(data){
            self.dissoveData = null;
            self.dispatchEvent("dissolve_cancel",data);
        });
        
        cc.vv.net.addHandler("voice_msg_push",function(data){
            self.dispatchEvent("voice_msg",data);
        });

        //========================出牌操作===================================//

        //自己出牌结果
        cc.vv.net.addHandler("outcard_response",function(data){
            self.dispatchEvent("outcardResult",data);
        });

        //广播别的玩家摆牌
        cc.vv.net.addHandler("broadcast_one_outcard_push",function(data){
            if(data.seat === self.seatIndex){
                return;
            }else{
                cc.vv.gameNetMgr.dispatchEvent("moveCandView",{seat:data.seat});
                //显示扇形面板
                cc.vv.gameNetMgr.dispatchEvent("showBack",{seat:data.seat,isSpCard:false});
            }
        });
        
        //所有玩家理牌完成,开始比牌
        cc.vv.net.addHandler("broadcast_all_outcard_push",function(data){
            self.dispatchEvent("finishPutCard",{data:data,bool:true});
        });
    },
  
    connectGameServer:function(data){
        this.dissoveData = null;
        cc.vv.net.ip = data.ip + ":" + data.port;
        console.log(cc.vv.net.ip);
        var self = this;

        var onConnectOK = function(){
            console.log("onConnectOK");
            var sd = {
                token:data.token,
                roomid:data.roomid,
                time:data.time,
                sign:data.sign,
            };
            cc.vv.net.send("login",sd);
        };
        
        var onConnectFailed = function(){
            console.log("failed.");
            cc.vv.wc.hide();
        };
        cc.vv.wc.show("正在进入房间");
        cc.vv.net.connect(onConnectOK,onConnectFailed);
    }
});
