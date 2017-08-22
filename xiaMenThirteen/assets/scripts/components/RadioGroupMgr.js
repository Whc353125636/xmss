cc.Class({
    extends: cc.Component,

    properties: {
        _groups:null
    },

    init: function ()
    {
        this._groups = {};
    },
    
    add:function(radioButton)
    {
        var groupId = radioButton.groupId; 
        var buttons = this._groups[groupId];
        if(buttons == null){
            buttons = [];
            this._groups[groupId] = buttons; 
        }
        buttons.push(radioButton);
    },
    
    del:function(radioButton)
    {
        var groupId = radioButton.groupId;
        var buttons = this._groups[groupId];
        if(buttons == null){
            return; 
        }
        var idx = buttons.indexOf(radioButton);
        if(idx != -1){
            buttons.splice(idx,1);            
        }
        if(buttons.length == 0){
            delete this._groups[groupId]   
        }
    },
    
    check:function(radioButton)
    {
        var groupId = radioButton.groupId;
        var buttons = this._groups[groupId];
        if(buttons == null){
            return; 
        }
        for(var i = 0; i < buttons.length; ++i){
            var btn = buttons[i];
            if(btn == radioButton){
                btn.check(true);
            }else{
                btn.check(false);
            }
        }        
    },

    getGroupButton:function(radioButton)
    {
        var groupId = radioButton.groupId;
        var buttons = this._groups[groupId];
        return buttons;
    },

    getRadioSelectedIndex: function (radios)
    {
        for(var i = 0; i < radios.length; ++i){
            if(radios[i].checked){
                return i;
            }
        }
        return -1;
    },

});
