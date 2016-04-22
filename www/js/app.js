/**
 * Created by STORM on 2/8/2016.
 */

angular.module('orderingApp', ['ionic','orderingApp.controllers','orderingApp.services','orderingApp.factories','jett.ionic.filter.bar','ngOpenFB'])

    .run(function($ionicPlatform, $ionicPopup, gStates, ngFB, $rootScope, $ionicModal, $state) {
        $ionicPlatform.ready(function() {
            ngFB.init({appId : FB_APP_ID});
            // Hide the Splash Screen
            if(navigator.splashscreen){
                setTimeout(function () {
                    navigator.splashscreen.hide();
                }, 100);
            }

            // Detect of Network Connection
            if (window.Connection) {
                // checkConnection();
                if (navigator.connection.type == Connection.NONE) {
                    G_NETSTATE = STATE.NO_INTERNET;
                    //alert("Connect detect : " + STATE.NO_INTERNET);
                }else{
                    G_NETSTATE = STATE.STATE_OK;
                    //alert("Connect detect : " + STATE.STATE_OK);
                }
            }

            function checkConnection() {
                var networkState = navigator.connection.type;

                var states = {};
                states[Connection.UNKNOWN]  = 'Unknown connection';
                states[Connection.ETHERNET] = 'Ethernet connection';
                states[Connection.WIFI]     = 'WiFi connection';
                states[Connection.CELL_2G]  = 'Cell 2G connection';
                states[Connection.CELL_3G]  = 'Cell 3G connection';
                states[Connection.CELL_4G]  = 'Cell 4G connection';
                states[Connection.CELL]     = 'Cell generic connection';
                states[Connection.NONE]     = 'No network connection';

                $ionicPopup.alert({
                    title : 'OrderingApp',
                    template : 'ConnectionType: ' + states[networkState]
                });
            }

            //------------------------------------------------------------

            if(window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if(window.StatusBar) {
                StatusBar.styleDefault();
            }

            // Push Register part -------------------------------------
            if (window.plugins && window.plugins.pushNotification) {
                if (ionic.Platform.isAndroid()){
                    window.plugins.pushNotification.register(
                        function(result) {
                            //alert('Push Register : ' + result);
                        },
                        function() {
                            alert('Push Register Error!');
                        },
                        {
                            "senderID": GCM_SENDER_ID,
                            "ecb": "onNotificationGCM"
                        });
                }else if (ionic.Platform.isIOS()){
                    window.plugins.pushNotification.register(
                        function(token){
                            // $ionicPopup.alert({
                            //     title : 'OrderingApp',
                            //     template : 'DeviceID : ' + token
                            // });
                            GCM_DEVICE_TOKEN = token;
                        },
                        function(){},
                        {
                            "badge": true,
                            "sound": true,
                            "alert": true,
                            "ecb":"onNotificationAPN"
                        });
                }
            }

            // OneSignal_Push Config---------------------------------
            var notificationOpenedCallback = function(jsonData) {
                //alert('didReceiveRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
                $rootScope.order = jsonData.additionalData;
                $ionicModal.fromTemplateUrl('templates/push-confirm-popup.html', {
                    scope: $rootScope,
                    animation: 'slide-in-up'
                }).then(function(modal) {
                    modal.show();
                    $rootScope.modal = modal;
                });
                $rootScope.offConfirm = function(){
                    $rootScope.modal.hide();
                }
            };

            if (window.plugins && window.plugins.OneSignal){
                //alert('INIT OK!');
                window.plugins.OneSignal.init(ONE_SIGNAL_ID,
                    {googleProjectNumber: GCM_SENDER_ID},
                    notificationOpenedCallback);

                // Show an alert box if a notification comes in when the user is in your app.
                window.plugins.OneSignal.enableInAppAlertNotification(true);
            }

            //window.plugins.OneSignal.getIds(function(ids) {
            //    alert("PlayerId: " + ids.userId + "PushToken: " + ids.pushToken);
            //    //document.getElementById("GameThrivePlayerId").innerHTML = "PlayerId: " + ids.playerId;
            //    //document.getElementById("GameThrivePushToken").innerHTML = "PushToken: " + ids.pushToken;
            //    console.log('getIds: ' + JSON.stringify(ids));
            //});
        });

    })

    .config(function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('sideMenu',{
                cache: false,
                url : '/side-menu',
                templateUrl : 'templates/side-menu.html',
                controller : 'sideMenuCtrl'
            })
            .state('sideMenu.homeScreen',{
                url : '/home-screen',
                views : {
                    'mainContainer' : {
                        templateUrl : 'templates/home-screen.html',
                        controller : 'homeScreenCtrl'
                    }
                }
            })
            .state('sideMenu.profile',{
                url: '/profile',
                views: {
                    'mainContainer' :{
                        templateUrl: 'templates/my-account-profile.html',
                        controller: 'profileCtrl'
                    }
                }
            })
            .state('sideMenu.setting',{
                url: '/setting',
                views: {
                    'mainContainer' :{
                        templateUrl: 'templates/my-account-setting.html',
                        controller: 'settingCtrl'
                    }
                }
            })
            .state('sideMenu.address-book',{
                url: '/address-book',
                views: {
                    'mainContainer' :{
                        templateUrl: 'templates/my-address-book.html',
                        controller: 'addressCtrl'
                    }
                }
            })
            .state('sideMenu.myOrder',{
                url: '/my-order',
                views: {
                    'mainContainer' :{
                        templateUrl: 'templates/my-order.html',
                        controller: 'orderCtrl'
                    }
                }
            })
            .state('sideMenu.orderDetail',{
                url: '/order-detail',
                views: {
                    'mainContainer':{
                        templateUrl: 'templates/my-order-detail.html',
                        controller: 'orderDetailCtrl'
                    }
                }
            })
            .state('ordering',{
                //cache: false,
                url: '/ordering',
                templateUrl: 'templates/order-home.html',
                controller: 'orderingCtrl'
            })
            .state('restaurantSearch',{
                url: '/search-rest',
                templateUrl: 'templates/order-rest-search.html',
                controller: 'searchCtrl'
            })
            .state('ordering.detailRest',{
                url: '/detail-rest',
                views: {
                    'orderContainer' :{
                        templateUrl: 'templates/order-rest-menu.html',
                        controller: 'detailRestCtrl'
                    }
                }
            })
            .state('ordering.detailMenu',{
                url: '/detail-menu',
                views: {
                    'orderContainer' :{
                        templateUrl: 'templates/order-rest-menu-detail.html',
                        controller: 'detailMenuCtrl'
                    }
                }
            })

            .state('ordering.checkOut',{
                url: '/order-checkout',
                views: {
                    'orderContainer' :{
                        templateUrl: 'templates/order-checkout.html',
                        controller: 'checkOutCtrl'
                    }
                }
            })

            .state('signUp',{
                url: '/sign-up',
                templateUrl: 'templates/sign-up.html',
                controller: 'signUpCtrl'
            })

            .state('signUp.register',{
                url: '/register',
                views: {
                    'userContainer' :{
                        templateUrl: 'templates/register.html',
                        controller: 'registerCtrl'
                    }
                }
            })

            .state('finalCheckOut',{
                cache: false,
                url: '/order-final-checkout',
                templateUrl: 'templates/order-checkout-popup.html',
                controller: 'finalCheckOutCtrl'
            });
        $urlRouterProvider.otherwise('/side-menu/home-screen');
    })

    .constant('shopSettings',{

        payPalSandboxId :'Aar8HZzvc5NztVWodTBpOiOod9wWrBDrJUjyvRr4WsxcCD28xYig7oecfYsqxQUDu5QHptPpSALirxZD',

        payPalProductionId : 'production id here',

        payPalEnv: 'PayPalEnvironmentSandbox', // for testing production for production

        payPalShopName : 'OrderingCo.Shop',

        payPalMerchantPrivacyPolicyURL : 'url to policy',

        payPalMerchantUserAgreementURL : 'url to user agreement'

    });

