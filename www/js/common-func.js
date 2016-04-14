/**
 * Created by STORM on 2/8/2016.

var SEVER_API_KEY_CURRENT = 'AIzaSyCH4hL3Mc7jh8wejEe3MBLDRe68MwoJujc';
var SENDER_ID_CURRENT = '1021116265386';
*/

var ROOT_URL = 'http://ionicapp.orderingco.com/ionicapp';

var GCM_SENDER_ID = '1021116265386';
var ONE_SIGNAL_ID = '189153bf-6f7b-4e2c-87ce-7fb4a15d475f';
var GCM_DEVICE_TOKEN = '';

var FB_APP_ID = '739943399474623';//'225514411127555';

var STATE = {                   // App State
    PROFILE : 'userProfileState',
    MY_ORDER : 'myOrderState',
    ORDERING : 'orderingState',
    MENU : 'homeScreenState',
    NO_INTERNET : 'NoInternetConnection',
    STATE_OK : 'ConnectionOk'
};
var CURRENCY = '$';             // Currency of Current Business
var USER_STATE = 'SIGN_UP';     // State of User's such as Login, SignUp, Guest

var AVATAR_LOAD = true;
var G_NETSTATE = 'OK';
var LOGIN_STATE = false;

var STORE_VAL = {
    USR_ID : 'user_id',
    PUSH : 'push_state',
    LOGIN : 'login_state'
};

//FastClick.attach(document.body, options);

Date.prototype.Format = function(fmt)
{ //author: meizz
    var hours,ap;
    if (this.getHours() >= 12){
        hours = this.getHours() - 12;
        ap = 'PM';
    }else {
        hours = this.getHours();
        ap = 'AM';
    }
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : hours,                              //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds(),             //毫秒
        "P"  : ap
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
};
//
//FastClick.attach(document.body,{
//   excludeNode : '^pac-'
//});

window.onNotification = function(e){

    switch(e.event){
        case 'registered':
            if(e.regid.length > 0){

                var device_token = e.regid;
                RequestsService.register(device_token).then(function(response){
                    alert('registered!');
                });

            }
            break;

        case 'message':
            alert('msg received: ' + e.message);
            /*
             {
             "message": "Hello this is a push notification",
             "payload": {
             "message": "Hello this is a push notification",
             "sound": "notification",
             "title": "New Message",
             "from": "813xxxxxxx",
             "collapse_key": "do_not_collapse",
             "foreground": true,
             "event": "message"
             }
             }
             */
            break;

        case 'error':
            alert('error occured');
            break;

    }
};
function onNotificationGCM (e){
    switch( e.event )
    {
        case 'registered':
            if (e.regid.length > 0) {
                //alert(e.regid);
                GCM_DEVICE_TOKEN = e.regid;
            }
            break;

        case 'message':
            //alert("What is it?");

            break;

        case 'error':

            alert(e.message);
            break;

        default:
            break;
    }
}
