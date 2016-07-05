/**
 * Created by STORM on 2/8/2016.
 */

angular.module('orderingApp.controllers',['ngOpenFB'])

    .controller('sideMenuCtrl', function($scope, $state, $http, $ionicModal, $ionicPopup, $ionicSideMenuDelegate, $ionicPlatform, gUserData, $ionicHistory,gStates, $filter, $rootScope, Logout){
        $scope.$on('$ionicView.enter',function(){
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
             $ionicSideMenuDelegate.canDragContent(false);
            $scope.state.loginState = LOGIN_STATE;
        });

        $scope.state = {
            loginState : LOGIN_STATE
        };

        $scope.getLogState = function () {
            return LOGIN_STATE;
        };

        $scope.onGoMyProfile = function(){
            gStates.setState(STATE.PROFILE);
            if (!LOGIN_STATE){
                $state.go('signUp');
            }else {
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $state.go('sideMenu.profile');
            }
        };
        $scope.onGoMyOrder = function(){
            gStates.setState(STATE.MY_ORDER);
            if (!LOGIN_STATE){
                $state.go('signUp');
            }else {
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $state.go('sideMenu.myOrder');
            }
        };

        $scope.openFacebook = function() {
            window.open('https://www.facebook.com/TalabateyIQ/?fref=ts', '_blank', 'location=no');
       }
       $scope.openYouTube = function() {
         window.open('https://www.youtube.com/channel/UCfYFecRakE9CWCfABGHUyYg', '_blank', 'location=no');
       }
       $scope.openAboutUs = function() {
         window.open('http://www.talabatey.com', '_blank', 'location=no');
       }

        $scope.onSignOut = function () {
            var promptPopup = $ionicPopup.confirm({
                    title: $filter('translate')('OrderingApp'),
                    template: $filter('translate')('You will logout from app, are you sure ?'),
                    cancelType: 'button-stable',
                    okText: $filter('translate')('OK'),
                    cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right',
                    cancelText: $filter('translate')('Cancel')
                });
            promptPopup.then(function(res) {
                if (res) {

                    Logout.charge({id: localStorage.getItem(STORE_VAL.USR_ID)},function (s) {
                        if (s.status == true){

                            LOGIN_STATE = false;
                            $scope.state.loginState = LOGIN_STATE;
                            localStorage.setItem(STORE_VAL.LOGIN, 'false');
                            localStorage.setItem(STORE_VAL.USR_ID, '');

                            var buff = {};
                            gUserData.setData(buff);
                            // $ionicSideMenuDelegate.toggleLeft();
                            $ionicHistory.nextViewOptions({
                                historyRoot: true,
                                disableAnimate: true,
                                expire: 300
                            });

                        }else {
                            MyAlert.show("Error : " + s.message);
                        }
                        },function (e) {
                            MyAlert.show(JSON.stringify(e));
                    })

                    // $state.go('sideMenu.homeScreen');
                }
                ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? $ionicSideMenuDelegate.toggleRight() : $ionicSideMenuDelegate.toggleLeft()
                $state.go('sideMenu.homeScreen');
            })
        }
    })

    .controller('homeScreenCtrl', function($scope, $state, $rootScope, $http, $filter, $ionicPlatform, $ionicLoading, $ionicPopup, GetUserByIdApi, $ionicModal, $ionicHistory, gNearService, gAllBusiness, AllBusinessApi, gMyLatLng, gStates, PushUserApi, ionicReady, gUserData, GeolocationSvc, AddressLookupSvc, NeighborListApi, MyLoading, MyAlert, CountryApi, CityApi, langSettings){

        $scope.gPlace;          // geoPlace Variable AutoComplete
        $scope.neighborMenuList = [];
        $scope.isArabic = (['ar', 'kr'].indexOf($rootScope.lang) != -1)? true : false;


        $rootScope.user_id = localStorage.getItem(STORE_VAL.USR_ID)
        // alert(localStorage.getItem(STORE_VAL.USR_ID))

        if(localStorage.getItem(STORE_VAL.USR_ID)){
            LOGIN_STATE = true
            if (!gUserData.getData().id) {
                GetUserByIdApi.charge({
                    id : $rootScope.user_id
                },function(res){
                    gUserData.setData(res.register[0]);
                })
            }
        }

        $scope.myOrder = {
            orderType : 'delivery',
            curAddress : '',
            neighborId : '',
            cityId : '',
            location :{
                latitud : 40.7127837,
                longitud : -74.00594130000002,
                zipcode : -1,
                zoom : 15
            }
        };
        $scope.location = null;

        $scope.orderTypelist = [
            {name:"Delivery", value:'delivery', selected:'selected'}/*,
             {name:"Pickup", value:'pickup', selected:''},
             {name:"Reservation", value:'reservation', selected:''}*/
        ];
        $scope.show = function() {
            $ionicLoading.show({
                template: '<p>{{"Searching..." | translate}}</p><ion-spinner icon="ripple" class="spinner-assertive"></ion-spinner>'
            });
        };
        $scope.hide = function(){
            $ionicLoading.hide();
        };

        $ionicHistory.clearHistory();       // initialize Clear Histories
        $scope.$on('$ionicView.enter',function(){
            //alert('Entered');
            // if (typeof gUserData.getData().id == 'undefined'){
            //     //alert(localStorage.getItem(STORE_VAL.USR_ID));
            //     if (localStorage.getItem(STORE_VAL.USR_ID) != null && localStorage.getItem(STORE_VAL.USR_ID) != ''){
            //         $scope.show();
            //         GetUserByIdApi.charge({
            //             id : localStorage.getItem(STORE_VAL.USR_ID)
            //         }, function(resp){
            //             gUserData.setData(resp.register[0]);
            //             LOGIN_STATE = true;
            //             $scope.myOrder.curAddress = resp.register[0].address;
            //             $scope.hide();
            //         });
            //     }else{
            //         $scope.myOrder.curAddress = '';
            //     }
            // }else {
            //     $scope.myOrder.curAddress = gUserData.getData().address;
            // }
            if (typeof $rootScope.buyerInfo == 'undefined'){

                $rootScope.buyerInfo = {
                    id : "",
                    address :"",
                    city :"",
                    cityname :"",
                    tax : "",
                    taxtype : "",
                    deliveryType :"",
                    deliverydate :"ASAP",
                    comments : "",
                    name :"",
                    lastname2 :"",
                    email :"",
                    api :"",
                    colony :"",
                    tel :"",
                    checkoutfields : [
                        "Phone",
                        "Receive SMS",
                        "Tip For The Driver",
                        "Discount Coupon",
                        "ChackoutMap",
                        "Name",
                        "Last Name",
                        "Email",
                        "Full Address",
                        "APT\/Suit",
                        "Area \/ Neighborhood"
                    ]
                };
            }
            // Fetching Neighborhood Areas.
            fetchNeighborhoodArea();
            getCountries();
        });

        function fetchNeighborhoodArea() {
            MyLoading.show('Getting Menu...');
            NeighborListApi.charge({lang: langSettings[$rootScope.lang]},function (s) {
                if (s.status == true){
                    $scope.neighborMenuListAll = s.register;
                }else {
                    MyAlert.show("Error : " + s.message);
                }
            },function (e) {
                MyLoading.hide();
                //MyAlert.show(JSON.stringify(e));
            })
        }

        function getCountries() {
            CountryApi.charge({lang: langSettings[$rootScope.lang]},function (s) {
                if (s.status == true){
                    $scope.countries = s.country;
                    getCities($scope.countries[0].id);
                }else {
                    MyLoading.hide();
                    //MyAlert.show("Error : " + s.message);
                }
            },function (e) {
                MyLoading.hide();
                //MyAlert.show(JSON.stringify(e));
            })
        }
        function getCities(id) {
            CityApi.charge({
                country : id,
                lang : langSettings[$rootScope.lang]
            },function (s) {
                MyLoading.hide();
                if (s.status == true){
                    $scope.cities = s.city;
                }else {
                    MyLoading.hide();
                    //MyAlert.show("Error : " + s.message);
                }
            },function (e) {
                MyLoading.hide();
                //MyAlert.show(JSON.stringify(e));
            })
        }

        $scope.selectCity = function () {
            if (typeof $scope.cities == 'undefined') return;
            $scope.myOrder.neighborId = null;
            var i = 0, len = $scope.cities.length;
            for (; i < len; i++){
                if ($scope.cities[i].id = $scope.myOrder.cityId) {
                    $scope.curCity = $scope.cities[i];
                    break;
                }
            }
            $scope.neighborMenuList = [];
            var j = 0; leng = $scope.neighborMenuListAll.length;
            for(; j < leng; j++){
                if ($scope.neighborMenuListAll[j].city == $scope.curCity.id){
                    $scope.neighborMenuList.push($scope.neighborMenuListAll[j]);
                }
            }
        };

        $scope.selectArea = function (id) {
            if (typeof $scope.neighborMenuList == 'undefined') return;
            var i = 0, len = $scope.neighborMenuList.length;
            for (; i < len; i++){
                if ($scope.neighborMenuList[i].id = id) {
                    return $scope.neighborMenuList[i];
                }
            }
        };

        //---No Internet Connection------------------
        $rootScope.netModalState = false;
        $ionicModal.fromTemplateUrl('templates/no-connection.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal3 = modal;
        });
        $scope.openModal = function() {
            $scope.modal3.show();
            $rootScope.netModalState = false;
        };
        $scope.closeModal = function() {
            $scope.modal3.hide();
        };

        $scope.onReStart = function(){
            //$state.go('sideMenu');
            //$ionicHistory.clearHistory();
            setTimeout(function (){
                navigator.app.loadUrl("file:///android_asset/www/index.html");
            }, 100);
        };

        ionicReady().then(function(){           // This function only once called at start app.
            //$ionicLoading.show({
            //    template:'<p>Initializing...</p><ion-spinner icon="lines" class="spinner-energized"></ion-spinner>'
            //});
            if (G_NETSTATE == STATE.NO_INTERNET){
                $scope.openModal();
            }else if (G_NETSTATE == STATE.STATE_OK) {
                $scope.closeModal();
            }

        });

        /*$ionicPlatform.ready(function(){
            //alert('Your Platform is Ready!' + gStates.getState());
            if (G_NETSTATE == STATE.NO_INTERNET){
                $scope.openModal();
            }
        });*/

        setInterval(function(){
            if (window.Connection) {
                if (navigator.connection.type == Connection.NONE) {
                    G_NETSTATE = STATE.NO_INTERNET;
                    $rootScope.netModalState = true;
                   // alert("Connect detect ok!");
                }else {
                    G_NETSTATE = STATE.STATE_OK;
                }
            }
              if (G_NETSTATE == STATE.NO_INTERNET){
                if ($rootScope.netModalState){
                    $rootScope.netModalState = false;
                    $scope.openModal();
                }else{
                    $scope.closeModal();
                }
            }
        }, 2000);



        //--------------------------------------------------------------------------------------------------------

        $scope.findRest = function () {
          var vCountry = $scope.myOrder.neighborId;
            if(vCountry == '' || vCountry == null){
                $ionicPopup.alert({
                    title : $filter('translate')('OrderingApp'),
                    template : $filter('translate')('Please Select your Area'),
                    okText: $filter('translate')('OK')
                });
                return;
            }
            var vCity = $scope.myOrder.cityId;
            if(vCity == ''){
                $ionicPopup.alert({
                    title : $filter('translate')('OrderingApp'),
                    template : $filter('translate')('Please Select your City'),
                    okText: $filter('translate')('OK')
                });
                return;
            }
            console.log($scope.myOrder.neighborId.name);
            localStorage.setItem("currentArea", $scope.myOrder.neighborId.name);
            $scope.show($ionicLoading);
            /*var geoCoder = new google.maps.Geocoder();
            geoCoder.geocode( { 'address': vCountry}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {

                    // Set to Location Information ----------
                    $scope.myOrder.location.lat = results[0].geometry.location.lat();
                    $scope.myOrder.location.long = results[0].geometry.location.lng();
                    $scope.myOrder.location.zip = results[0].address_components[0].long_name;

                    var myLatLng = {};
                    myLatLng.lat = $scope.myOrder.location.lat;
                    myLatLng.lng = $scope.myOrder.location.long;
                    gMyLatLng.setData(myLatLng);

                    // Request to Find Restaurant ----------
                    $scope.findRestaurant();
                }
                else {
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title : 'OrderingApp',
                        template : 'Geocode was not successful for the following reason: ' + status
                    });
                }
            });*/
            $scope.curArea = $scope.selectArea($scope.myOrder.neighborId.id);
            //console.log(JSON.stringify($scope.myOrder.neighborId));
            //gUserData.setData($scope.myOrder.neighborId);


            $scope.findRestaurant();
        };

        $scope.findRestaurant = function(){

            var params = {
                "whereall":{
                    "country":"1",
                    "city":$scope.curCity.id,
                    "delivery_neighborhoodStaus":1,
                    "delivery_neighborhood":$scope.curArea.name,
                    "delivery_neighborhoodid":$scope.curArea.id,
                    "currency":null,
                    "ga":"",
                    "cityname": $scope.curCity.name,
                    "collecttype": $scope.myOrder.orderType,
                    "reservestatus": $scope.myOrder.orderType,
                    "address":"2",
                    "resturant":"",
                    "cuisines":"",
                    "rhour":-1,
                    "rmin":-1,
                    "location": JSON.stringify($scope.myOrder.location),
                    "approved":true,
                    "zipcode":-1
                },
                "location": JSON.stringify($scope.myOrder.location),
                "deliveryType" : $scope.myOrder.orderType,
                "category" :'',
                "city" : parseInt($scope.curCity.id),
                "filters" : false,
                "lang": langSettings[$rootScope.lang]
            };

            AllBusinessApi.charge(
                JSON.stringify(params),
                function(data){
                if (data.status == true){
                    $ionicLoading.hide();

                    gAllBusiness.setData(data);

                    //---After response from server---
                    var responseData = {};
                    responseData.nearAddress = $scope.curArea.name;
                    responseData.nearCount = gAllBusiness.getData().business.length;
                    responseData.orderType = $scope.myOrder.orderType;
                    responseData.whereAll = '';
                    gNearService.setData(responseData);

                    $state.go('restaurantSearch');

                }else {
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'OrderingApp',
                        template: 'SearchFailed! Can not find near Restaurants!'
                    });
                }
            });

        };

        //Get Current Location
        $scope.getCurLocation = function(){
            $scope.show($ionicLoading);
            GeolocationSvc().then(function(position) {

                $scope.hide();

                $scope.myOrder.location.latitud = position.lat;
                $scope.myOrder.location.longitud = position.lng;

                /*AddressLookupSvc.lookupByAddress(position.lat, position.lng).then(function(addr) {
                    $ionicLoading.hide();
                    $scope.location = {
                        address : addr,
                        location : { lat : position.lat, lng : position.lng }
                    };
                    gMyLatLng.setData($scope.location.location);
                    $scope.myOrder.curAddress = $scope.location.address;
                    /!*$ionicPopup.alert({
                        title : 'Location Information',
                        template : 'Latitude : ' + $scope.location.location.lat +'\n'+
                        'Longitude : ' + $scope.location.location.lng + '\n' +
                        'Address : ' + $scope.location.address
                    });*!/

                },function(error){
                    $scope.hide();
                    $scope.myOrder.curAddress = 'Location not found';
                    $ionicPopup.alert({
                        title : "ERROR!",
                        template : "Getting Location Error!"
                    });
                });*/

            },function(err){
                $scope.hide();
                $ionicPopup.alert({
                    title : $filter('translate')("ERROR!"),
                    template : err.message,
                    okText: $filter('translate')('OK'),
                    cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right'
                }).then(function(){
                        //GPS enabled?????
                        var locationConfig = window.plugins.locationAndSettings;
                        locationConfig.switchToLocationSettings(function(result){},function(errer){ console.log(errer); });
                });
            });

        };

        $scope.onAutoCompleteAddress = function() {
            setTimeout(function() {
                if (typeof document.getElementsByClassName('backdrop')[0] != 'undefined' &&
                    typeof document.getElementsByClassName('pac-container')[0] != 'undefined'){
                    for (var i = 0; i < document.getElementsByClassName('pac-container').length; i++){
                        document.getElementsByClassName('pac-container')[i].setAttribute('data-tap-disabled', true);
                    }
                    for (i = 0; i < document.getElementsByClassName('backdrop').length; i++){
                        document.getElementsByClassName('backdrop')[i].setAttribute('data-tap-disabled', true);
                    }
                }
            }, 100);
        }

    })

    .controller('profileCtrl', function($scope, $state, $ionicLoading, $ionicPopup, gMyLatLng, UpdateUserApi, gUserData, $http, gStates, $filter){

        $scope.show = function() {
            $ionicLoading.show({
                template: '<p>{{ "Updating..." | translate }}</p><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner>'
            });
        };
        $scope.hide = function(){
            $ionicLoading.hide();
        };

        $scope.$on('$ionicView.beforeEnter', function(){
            $scope.fbUserState = USER_STATE;
            var gUser = gUserData.getData();

            gUser = gUserData.getData();
            //Get Current Location
            $scope.fbUserState = USER_STATE;
            $ionicLoading.show();
            var options = { enableHighAccuracy: true };
            navigator.geolocation.getCurrentPosition(
                function(obj){
                    // Save My Location --------------------
                    var myLatLng = {};
                    myLatLng.lat = obj.coords.latitude;
                    myLatLng.lng = obj.coords.longitude;
                    gMyLatLng.setData(myLatLng);
                    //alert(myLatLng.lat + ',' + myLatLng.lng);
                    $scope.gMap = new GoogleMap();
                    var latLng = gMyLatLng.getData();
                    $ionicLoading.hide();
                    $scope.gMap.initialize('profile-map', latLng.lat, latLng.lng, 15);
                    //$scope.loadMap();
                },
                function (e) {
                    alert('get location error');
                },
                options
            );
            /*var posOptions = {timeout: 10000, enableHighAccuracy: false};
            $cordovaGeolocation
                .getCurrentPosition(posOptions)

                .then(function (position) {
                    var lat  = position.coords.latitude;
                    var long = position.coords.longitude;
                    console.log(lat + '   ' + long);
                    var myLatLng = {};
                    myLatLng.lat = position.coords.latitude;
                    myLatLng.lng = position.coords.longitude;
                    gMyLatLng.setData(myLatLng);

                    $scope.gMap = new GoogleMap();
                    var latLng = gMyLatLng.getData();
                    $ionicLoading.hide();
                    $scope.gMap.initialize('profile-map', latLng.lat, latLng.lng, 15);

                }, function(err) {
                    console.log(err)
                });*/

            //$scope.loadMap = function(){};

            $scope.dummy = 'img/signup-avatar.png';

            var picUrl = '';
            if (USER_STATE == 'FB_USER'){
                picUrl = gUser.profilepic;
            }else {
                picUrl = ROOT_URL + gUser.profilepic;
            }
            $scope.updateUser = {
                name        : gUser.name,
                lastname    : gUser.lastname ,
                lastname2   : gUser.lastname2 ,
                email       : gUser.email ,
                password    : gUser.password ,
                address     : gUser.address ,
                colony      : gUser.colony ,
                zip         : gUser.zip ,
                country     : gUser.country ,
                city        : gUser.city ,
                tel         : gUser.tel ,
                cel         : gUser.cel ,
                api         : gUser.api,
                imgpath     : picUrl
            };
        });

        //------------------------------
        $scope.updateProfile = function () {
            $scope.show($ionicLoading);
            if ($scope.updateUser == undefined) return;

            UpdateUserApi.charge({
                id          : gUserData.getData().id,
                name        : $scope.updateUser.name,
                lastname    : gUserData.getData().lastname ,
                lastname2   : gUserData.getData().lastname2 ,
                email       : $scope.updateUser.email,
                password    : $scope.updateUser.password ,
                address     : $scope.updateUser.address,
                colony      : gUserData.getData().colony,
                zip         : gUserData.getData().zip,
                country     : gUserData.getData().country,
                city        : gUserData.getData().city,
                tel         : $scope.updateUser.tel,
                cel         : $scope.updateUser.cel,
                api         : $scope.updateUser.api,
                imgpath     : ''
            }, function(res){
                $scope.hide();
                if (res.status == true) {
                    $ionicPopup.alert({
                        title : $filter('translate')('OrderingApp'),
                        template : $filter('translate')('User Profile updated!'),
                        okText: $filter('translate')('OK'),
                        cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right'
                    });
                    $scope.updateUser.id = localStorage.getItem(STORE_VAL.USR_ID);
                    gUserData.setData($scope.updateUser);
                }else {
                    /*$ionicPopup.alert({
                        title : 'OrderingApp',
                        template : 'Error!'
                    });*/
                }
            })
        };

        $scope.onAutoCompleteAddress = function() {
            setTimeout(function() {
                if (typeof document.getElementsByClassName('backdrop')[0] != 'undefined' &&
                    typeof document.getElementsByClassName('pac-container')[0] != 'undefined'){
                    for (var i = 0; i < document.getElementsByClassName('pac-container').length; i++){
                        document.getElementsByClassName('pac-container')[i].setAttribute('data-tap-disabled', true);
                    }
                    for (i = 0; i < document.getElementsByClassName('backdrop').length; i++){
                        document.getElementsByClassName('backdrop')[i].setAttribute('data-tap-disabled', true);
                    }
                }
            }, 100);
        }

    })

    .controller('orderCtrl', function($scope, $state, $ionicLoading,$ionicScrollDelegate, $ionicPopup, $ionicHistory, $filter, gUserData, gStates,gSingleOrderData, MyOrderApi, SingleOrderApi){
        $scope.$on('$ionicView.beforeEnter', function(){
            $ionicScrollDelegate.scrollTop();
            $scope.loadOrderData();
        });
        $scope.show = function() {
            $ionicLoading.show({
                template: '<p>{{ "Getting Data..." | translate }}</p><ion-spinner icon="ripple" class="spinner-assertive"></ion-spinner>'
            });
        };
        $scope.hide = function(){
            $ionicLoading.hide();
        };
        //-- Getting OrderData from DB ---------------------
        $scope.myOrders = [];
        $scope.loadOrderData = function(){
            $scope.show($ionicLoading);
            var cUser = gUserData.getData();
            MyOrderApi.charge({
                usr : cUser.id
            }, function(res){
                $scope.hide();
                if (res.status == true){
                    $scope.myOrders = res.orders;
                    if ($scope.myOrders.length == 0){
                        $ionicPopup.alert({
                            title : $filter('translate')('OrderingApp'),
                            template : $filter('translate')('Already you have never been ordered!. Please...!'),
                            okText: $filter('translate')('OK'),
                            cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right'
                        });
                    }
                }else {

                }
            });
        };
        $scope.loadOrderData();
        $scope.orderDetail = {};
        $scope.orderViewMore = function(orderNum){

            $scope.show($ionicLoading);
            SingleOrderApi.charge({
                id : orderNum
            }, function(res){
                $scope.hide();
                if (res.status == true){
                    gSingleOrderData.setData(res.orders);
                    $state.go('sideMenu.orderDetail');
                }else {
                    $ionicPopup.alert({
                        title : $filter('translate')('OrderingApp'),
                        template : $filter('translate')('Getting Failed!'),
                        okText: $filter('translate')('OK'),
                        cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right'
                    });
                }
            });
        }

        $scope.gotoHome = function(){
            $ionicHistory.clearCache().then(function(){$state.go('sideMenu.homeScreen')});
        };
    })

    .controller('orderDetailCtrl', function($scope, $state, $filter, gUserData, gSingleOrderData){

        $scope.$on('$ionicView.beforeEnter',function() {
            $scope.myCurOrder = gSingleOrderData.getData();
            $scope.myOrderId = $scope.myCurOrder.id;
            $scope.myOrderDetail = JSON.parse($scope.myCurOrder.data);

            $scope.payMethod = '';

            angular.forEach($scope.myOrderDetail.business[0].paymethod, function (value, key) {
                if (value == true) {
                    $scope.payMethod = key;
                }
            });
        });

        $scope.goOrder = function(){
            $state.go('sideMenu.myOrder');
        }
    })

    .controller('addressCtrl', function($scope, $state, $filter){

    })

    .controller('settingCtrl', function($scope, $state, $ionicLoading, $filter, PushStateApi){
        $scope.$on('$ionicView.beforeEnter', function(){
            //alert('PUSH :' + localStorage.getItem(STORE_VAL.PUSH));
            if (localStorage.getItem(STORE_VAL.PUSH) == null){
                $scope.pushState = {curState:'Enabled', checked:true};
            }else if (localStorage.getItem(STORE_VAL.PUSH) == 'true'){
                $scope.pushState = {curState:'Enabled', checked:true};
            }else {
                $scope.pushState = {curState:'Disabled', checked:false};
            }
        });
        $scope.getLoginState = function(){
            return LOGIN_STATE;
        }
        $scope.pushChanged = function(){
            $ionicLoading.show();
            var log_status = 1;
            if(!$scope.pushState.checked){
                $scope.pushState.curState = 'Disabled';
                log_status = 0;
            }else {
                $scope.pushState.curState = 'Enabled';
                log_status = 1;
            }
            PushStateApi.charge({
                user_id : localStorage.getItem(STORE_VAL.USR_ID),
                login_status : log_status
            }, function(res){
                $ionicLoading.hide();
            });
            localStorage.setItem(STORE_VAL.PUSH, $scope.pushState.checked);
        };
    })

    .controller('orderingCtrl', function($scope, $state, $ionicHistory, $filter){

    })

    .controller('languageSetting', function($scope, $state, $ionicHistory, $rootScope, $translate, $ionicSideMenuDelegate){

        $scope.$on('$ionicView.enter', function(){
            $ionicSideMenuDelegate.canDragContent(false);
        });

        $scope.setLanguage = function(language){
            localStorage.setItem("language", language)
            $rootScope.lang = localStorage.getItem('language') || 'ar'
            $translate.use($rootScope.lang);
            $state.go('sideMenu.homeScreen')
        }
    })

    .controller('searchCtrl', function($scope, $ionicLoading, $ionicPopup, $ionicHistory, $ionicScrollDelegate, $ionicFilterBar, $state, $filter, gNearService, gCurRestaurant, gAllBusiness, FetchAllBusinessMenuApi, gStates, BusinessInfoApi, langSettings, $rootScope){

        $scope.$on('$ionicView.beforeEnter', function(){
            $ionicScrollDelegate.scrollTop();
            $scope.loadData();
        });
        $scope.show = function() {
            $ionicLoading.show({
                template: '<p>{{ "Loading..." | translate }}</p><ion-spinner icon="ripple" class="spinner-assertive"></ion-spinner>'
            });
        };

        $scope.hide = function(){
            $ionicLoading.hide();
        };

        $scope.loadData = function () {
            $scope.nearAddress = gNearService.getData().nearAddress;
            $scope.nearCount = gNearService.getData().nearCount;

            $scope.resturantlist = [];
            $scope.resturantlist = gAllBusiness.getData().business;

            $scope.rateAry = [];
            for (var j = 0; j < $scope.resturantlist.length; j++){
                $scope.rateAry.push($scope.getRateState($scope.resturantlist[j].review.rating));
            }
            $scope.rateDisAry = [
                {rate:'stars-dis'},
                {rate:'stars-dis'},
                {rate:'stars-dis'},
                {rate:'stars-dis'},
                {rate:'stars-dis'}
            ];

            $scope.openState = false;
        };

        //$scope.loadData();

        //----------------------------------
        gStates.setState(STATE.MENU);
        //----------------------------------

        $scope.getDeliveryFee = function (zone) {
            var zoneJson = JSON.parse(zone);
            var zone1 = zoneJson.zone1;
            return zone1.price;
        };

        $scope.getRateState = function (rNum){
            var rateAry = [];
            for (var i = 0; i < 5; i++){
                if (i < (5 - rNum)){
                    rateAry.push({rate:'stars-dis'});
                }else {
                    rateAry.push({rate:'stars'});
                }
            }
            return rateAry;
        };



        $scope.onRestaurantItem = function(selRestaurant){

            // Detect of Open & Close time zone ------------

            if (selRestaurant.open == false){
                $ionicPopup.alert({
                    //title : 'OrderingApp',
                    title : $filter('translate')('Open & Close time'),
                    template : '\<center\>' + selRestaurant.opentime + ' - ' + selRestaurant.closetime + '\<\center\>',
                    okText: $filter('translate')('OK'),
                    cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right'
                });
                return;
            }

            //-------------------------------------

            $scope.show($ionicLoading);
            FetchAllBusinessMenuApi.charge({
                businessid:selRestaurant.id,
                deliverytype:gNearService.getData().deliveryType,
                whereall:gNearService.getData().whereAll,
                lang:langSettings[$rootScope.lang]
            },function(data){
                $scope.hide($ionicLoading);
                var buffObj = {};
                buffObj.id = selRestaurant.id;
                buffObj.name = selRestaurant.name;
                buffObj.info = data;
                buffObj.header = selRestaurant.headerurl;
                buffObj.logo = selRestaurant.logourl;
                buffObj.restData = selRestaurant;
                buffObj.deliveryFee = selRestaurant.shipping;
                gCurRestaurant.sharedObject = buffObj;
                // Setting Currency of Business
                CURRENCY = selRestaurant.currency;
                // Go to current Restaurant Detail page ---
                $state.go('ordering.detailRest');
            });
        };

        $scope.searchText = '';
        var filterBarInstance;

        $scope.showFilterBar = function () {
            filterBarInstance = $ionicFilterBar.show({
                items: $scope.resturantlist,
                update: function (filteredItems) {
                    $scope.resturantlist = filteredItems;
                    $scope.nearCount = filteredItems.length;
                },
                filterProperties: 'name'
            });
        };

        $scope.gotoHome = function(){
            $ionicHistory.clearCache().then(function(){$state.go('sideMenu.homeScreen')});
        };
    })

    .controller('detailRestCtrl', function($scope, $state, $ionicPopup, $ionicHistory, $filter, gCurRestaurant, gAllBusiness, gCurDishList, gOrder, $rootScope){

        $scope.$on('$ionicView.beforeEnter',function(){
            $scope.item = gCurRestaurant.getData();
            $scope.HeaderTitle = $scope.item.name;
            $scope.HeaderUrl = "http://order.talabatey.com/" + $scope.item.header;
            $scope.LogoUrl = $scope.item.logo;

            $scope.resMenulist = [];
            $scope.resMenulist = $scope.item.info.categorynameid;
        });

        $scope.goDetailMenu = function(item){
            var allFood = $scope.item.info.menulist[0];
            var curDishList = [];
            for (var i = 0, len = allFood.dish.length; i < len; i++){
                if( item.id == allFood.dish[i].category ){
                    curDishList.push(allFood.dish[i]);
                }
            }
            var buffObj = {};
            buffObj.title = item.name;
            buffObj.info = curDishList;
            gCurDishList.setData(buffObj);

            $state.go('ordering.detailMenu');
        };

        $scope.backToRestaurant = function () {
            if (gOrder.getData().length == 0){
                $state.go('restaurantSearch');
            }else{
                var promptPopup = $ionicPopup.confirm({
                    title: $filter('translate')('OrderingApp'),
                    template: $filter('translate')('Do you want to cancel current order?'),
                    cancelType: 'button-stable',
                    okText: $filter('translate')('OK'),
                    cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right',
                    cancelText: $filter('translate')('Cancel')
                });
                promptPopup.then(function(res) {
                    if (res) {
                        console.log('Pressed OK!');
                        var ary = [];
                        gOrder.setData(ary);
                        gCurRestaurant.setData({});
                        $ionicHistory.clearHistory();
                        $ionicHistory.clearCache();
                        $state.go('restaurantSearch');
                    } else {
                        console.log('Pressed CANCEL!');
                    }
                });
            }
        }
    })

    .controller('detailMenuCtrl', function($scope, $state, $ionicLoading, $ionicPopup, $ionicModal, ProductOptionApi, gOrder, gCurDishList, $filter, langSettings, $rootScope, $ionicHistory, gCurRestaurant){
        $scope.show = function() {
            $ionicLoading.show({
                template: '<p>{{ "Searching..." | translate }}</p><ion-spinner icon="ripple" class="spinner-assertive"></ion-spinner>'
            });
        };
        $scope.hide = function(){
            $ionicLoading.hide();
        };
        $scope.HeaderTitle = gCurDishList.getData().title;

        $scope.resSubMenulist = [];
        $scope.resSubMenulist = gCurDishList.getData().info;
        $scope.selectedFood = {};

        $scope.$on('$ionicView.beforeEnter', function(){
            $scope.initMyDish();
            $ionicModal.fromTemplateUrl('templates/order-product-option-popup.html', {
              scope: $scope,
              animation: 'slide-in-up',
              controller: 'pOptionCtrl'
            }).then(function(modal) {
              $scope.modal = modal;
            });
        });

        //----------------------------------------------------------------------------
        $scope.initMyDish = function(){
            $scope.productOptionList = {};
            $scope.C_OState = {
                check : 'yes',
                optional : '1'
            };

            if (gOrder.getData().length == 0){
                $scope.dishes = [];
                $scope.allDishCount = 0;
            }else {
                $scope.dishes = gOrder.getData();
                $scope.allDishCount = $scope.dishes.length;
            }

            $scope.myDish = {
                id : '',
                name : '',
                psettingval : '',
                price : 0,
                ingredients : '',
                options : '',
                optionsOnlytext : '',
                optionsChoiceId : '',
                quantity : 1,
                nofgty : '1',
                hiddengty_status : '0',
                total : 0,
                points : null,
                extras : [],
                extraModel : [],
                comments : ''
            };
            if ($scope.tempCPrice != null && $scope.tempPrice != null){
                $scope.tempPrice.length = 0;
                $scope.tempCPrice.length = 0;
                $scope.tempOptions.length = 0;
            }
        };

        //$scope.initMyDish();    // Initial MyDish Object

        $scope.pOptionModel = {};
        $scope.newModelProduct = function (proOptList) {
            for(var i = 0, len = proOptList.length; i < len; i++){
                var cond = proOptList[i].conditional;
                var maxSelNum = parseInt(proOptList[i].maxsel);
                if (maxSelNum != 1){
                    //$scope.pOptionModel['data_'+proOptList[i].id] = {};
                    var tmObj = {};
                    tmObj.condition = cond;
                    tmObj.value = {};

                    for (var j = 0, slen = proOptList[i].choices.length; j < slen; j++){
                        //$scope.pOptionModel['data_'+proOptList[i].id]['model_'+proOptList[i].choices[j].id] = false;
                        tmObj.value['model_'+proOptList[i].choices[j].id] = false;
                    }
                    $scope.pOptionModel['data_'+proOptList[i].id] = tmObj;
                }else {
                    var tObj = {};
                    tObj.condition = cond;
                    tObj.value = 'none';
                    //$scope.pOptionModel['data_'+proOptList[i].id] = 'none';
                    $scope.pOptionModel['data_'+proOptList[i].id] = tObj;
                }
            }
            $scope.myDish.price = $scope.oriPrice;
            $scope.myDish.total = $scope.oriPrice;
            $scope.calcPrice = $scope.oriPrice;
        };

        // Click to Single Dish------------------------------------------------
        $scope.onProductOption = function(foodItem){
            $scope.show($ionicLoading);
            $scope.selectedFood = foodItem;
            var extraIdAry = [];
            $scope.oriPrice = parseFloat(foodItem.price);
            // Json to String -------------
            var tmpStr = (foodItem.extras).replace(/[^0-9,]/g, "");
            // String to String Array --------------
            extraIdAry = tmpStr.split(",");
            //---getting extra list from System ---------------------------------
            ProductOptionApi.charge({
                extras_id : extraIdAry,
                dish_id : foodItem.id,
                lang : langSettings[$rootScope.lang]
            },function(data){
                if (data.status == true){
                    $scope.hide($ionicLoading);
                    //alert("Getting Product Option List. Success!!");
                    //var proOptList = data.options[0];
                    var proOptList = detectCondition(data.options[0].options);
                    $scope.newModelProduct(proOptList);
                    $scope.productOptionList = data.options[0];
                    $scope.productOptionList.options = proOptList;
                    $scope.modal.show();
                }else{
                    $scope.hide($ionicLoading);
                    /*$ionicPopup.alert({
                     title: 'No Options!'
                     });*/
                    $scope.productOptionList = $scope.selectedFood;
                    $scope.myDish.total = parseFloat($scope.selectedFood.price);
                    $scope.calcPrice = parseFloat($scope.selectedFood.price);

                    $scope.modal.show();                    //Display Product Option Screen
                }
            });
        };

        function detectCondition(optList) {
            var buffAry = [];
            var buffCondAry = [];
            for (var i = 0; i < optList.length; i++){
                if (optList[i].conditional === "no"){
                    buffAry.push(optList[i]);
                }else {
                    buffCondAry.push(optList[i]);
                }
            }
            var addedAry = buffAry;
            // If condition Array have some, find the parent of condition option, and insert after parent----
            if (buffCondAry.length != 0){
                for (i = 0; i < buffAry.length; i++) {
                    var condOptID = null;
                    if(buffAry[i].choices.length == 2){
                        for ( var j = 0, len = buffAry[i].choices.length; j < len; j++ ) {
                            if (typeof buffAry[i].choices[j].conditionoptionid != 'undefined') {
                                condOptID = buffAry[i].choices[j].conditionoptionid[0];
                            }
                        }
                        // after parent, insert the condObj
                        for (j = 0; j < buffCondAry.length; j++){
                            if (buffCondAry[j].id == condOptID) {
                                addedAry.splice(i+1,0,buffCondAry[j]);
                            }
                        }
                    }
                }
            }

            return addedAry;
        }

        $scope.offProductOption = function(){
            $scope.initMyDish();
            $scope.modal.hide();                             //Close Product Option Screen
        };

        $scope.cancelAllOrder = function(){

            var promptPopup = $ionicPopup.confirm({
                title: $filter('translate')('OrderingApp'),
                template: $filter('translate')('Do you want to cancel current order?'),
                cancelType: 'button-stable',
                okText: $filter('translate')('OK'),
                cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right',
                cancelText: $filter('translate')('Cancel')
            });
            promptPopup.then(function(res) {
                if (res) {
                    console.log('Pressed OK!');
                    var ary = [];
                    gOrder.setData(ary);
                    $scope.initMyDish();
                    $scope.modal.hide();
                    $state.go('restaurantSearch');
                } else {
                    console.log('Pressed CANCEL!');
                }
            });
        }

        // Total Price Calculating ----------------------
        $scope.tempCPrice = [];
        $scope.tempOptions = [];
        $scope.onCheckOption = function (option, item) {            ///  Implements price and data in Radio Option
            if ($scope.pOptionModel['data_'+option.id]['value']['model_'+item.id] === true){
                $scope.calcPrice += parseFloat(item.price);
                $scope.myDish.total = $scope.calcPrice; // calculate Total Price
                $scope.myDish.extras.push(item);
                var bOption = {};
                bOption.id = item.id;
                bOption.option = option;
                bOption.choice = item;
                bOption.prefix = '';
                $scope.tempOptions.push(bOption);
            }else {
                $scope.calcPrice -= parseFloat(item.price);
                $scope.myDish.total = $scope.calcPrice; // calculate Total Price

                var items = $scope.myDish.extras;
                var remIndex = items.map(function(a) {return a.id; }).indexOf(item.id);
                items.splice(remIndex,1);

                var items1 = $scope.tempOptions;
                var remIndex1 = items1.map(function(a) {return a.id; }).indexOf(item.id);
                items1.splice(remIndex1,1);
            }
        };
        $scope.tempPrice = [];
        $scope.listIndex = 0;
        $scope.onClickOptions = function (option,item, index) {        ///  Implements price and data in Radio Option
            if (item.name == 'Yes'){
                $scope.productOptionList.options[index + 1].conditional = 'no';
                $scope.pOptionModel['data_'+$scope.productOptionList.options[index + 1].id].condition = 'no';
                return;
            }else if(item.name == 'No'){
                $scope.productOptionList.options[index + 1].conditional = 'yes';
                $scope.pOptionModel['data_'+$scope.productOptionList.options[index + 1].id].condition = 'yes';
                return;
            }
            var state = false;
            for (var i = 0, len = $scope.tempPrice.length; i < len; i++){
                if ($scope.tempPrice[i].option.id == option.id){
                    $scope.calcPrice -= parseFloat($scope.tempPrice[i].choice.price);
                    $scope.calcPrice += parseFloat(item.price);
                    $scope.myDish.total = $scope.calcPrice; // calculate Total Price
                    $scope.tempPrice[i].choice = item;
                    state = false;
                    break;
                }else{
                    state = true;
                }
            }
            if (state == true || $scope.tempPrice.length == 0){
                var buffObj = {
                    option : option,
                    choice : item
                };
                $scope.tempPrice.push(buffObj);
                $scope.calcPrice += parseFloat(buffObj.choice.price); // Calc Price
                $scope.myDish.total = $scope.calcPrice; // calculate Total Price
                $scope.myDish.extras.push(item);

                var bOption = {};
                bOption.id = item.id;
                bOption.option = option;
                bOption.choice = item;
                bOption.prefix = $filter('translate')('Please choose your ');
                $scope.tempOptions.push(bOption);
            }
        };

        //-----------------------------------------------------------------
        $scope.onPlusQuantity = function(){
            $scope.myDish.quantity++;
            $scope.myDish.total = $scope.calcPrice * $scope.myDish.quantity;
        };
        $scope.onMinusQuantity = function(){
            if($scope.myDish.quantity == 1){
                return;
            }
            $scope.myDish.quantity--;
            $scope.myDish.total = $scope.calcPrice * $scope.myDish.quantity;
        };

        function checkPOptioins() {
            var goState = true;
            angular.forEach($scope.pOptionModel, function(value, key){
                if (goState){
                    if (value.condition === 'no'){
                        if (value.value === 'none'){

                            goState = false;
                        }else {
                             var cnt = 0;
                             var cntIn = 0;
                             angular.forEach(value.value, function(value, key){
                                 cnt++;
                                 if (value == false) {
                                     cntIn++;
                                 }
                             });

                             if (cnt != 0 && cnt == cntIn) goState = false;
                        }
                    }
                }
            });
            return goState;
        }

        //-----------------------------------------------------------------
        $scope.onAddToCart = function (obj) {

            // Check Required Field -----------

            if (!checkPOptioins()) {
                $ionicPopup.alert({
                    title : $filter('translate')('OrderingApp'),
                    template : '\<center\>{{ "Please Select Required Options" | translate}}\<\/center\>',
                    okText: $filter('translate')('OK'),
                    cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right',
                });
                return;
            }

            $scope.myDish.id = $scope.selectedFood.id;
            $scope.myDish.name = $scope.selectedFood.name;
            $scope.myDish.price = $scope.selectedFood.price;
            $scope.allDishCount++;
            var buffObj = {};
            buffObj['id'] = obj.id;
            buffObj['option'] = $scope.pOptionModel;
            $scope.myDish.extraModel.push(buffObj);

            var bOptions = '';
            var bChoice = '';
            var bChoiceId = '';
            var len = $scope.tempOptions.length;
            for (var i = 0; i < len; i++){
                bOptions += '_@_'+$scope.tempOptions[i].prefix + $scope.tempOptions[i].option.name+'@u@'+$scope.tempOptions[i].choice.name;
                if (i == 0){
                    bChoice += ''+$scope.tempOptions[i].choice.name;
                    bChoiceId += ''+$scope.tempOptions[i].choice.id;
                }else {
                    bChoice += ',' + $scope.tempOptions[i].choice.name;
                    bChoiceId += ','+ $scope.tempOptions[i].choice.id;
                }
            }

            $scope.myDish.options = bOptions;
            $scope.myDish.optionsOnlytext = bChoice;
            $scope.myDish.optionsChoiceId = bChoiceId;

            $scope.dishes.push($scope.myDish);
            gOrder.setData($scope.dishes);
            $scope.initMyDish();
            $scope.modal.hide();
        };

        //----------------------------------------------------------------------------

        $scope.prices = {
            breadList: 'bl',
            sizeList: 'sl',
            sauceList: 'sul'
        };

        $scope.onViewOrder = function(){
            if (gOrder.getData().length == 0){
                $ionicPopup.alert({
                    title : $filter('translate')('Your Cart is Empty!'),
                    okText: $filter('translate')('OK'),
                    cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right',
                })
            }else{
                $state.go('ordering.checkOut');
            }
        }
    })

    .controller('pOptionCtrl', function ($scope, $state) {
        $scope.$on('$ionicView.enter', function() {
            // Code you want executed every time view is opened
            console.log('Opened!')
        });
    })

    .controller('checkOutCtrl',function($scope, $state, $rootScope, $ionicLoading, $ionicModal, $ionicPopup, $ionicHistory, $filter, gNearService,gDeliveryComment, gAllBusiness, gCurRestaurant, gOrder, gUserData, gBusinessData, CheckOutInfoApi, GetUserByIdApi, gStates){

        $scope.show = function() {
            $ionicLoading.show({
                template: '<p>{{ "GettingData..." | translate }}</p><ion-spinner icon="ripple" class="spinner-assertive"></ion-spinner>'
            });
        };
        $scope.hide = function(){
            $ionicLoading.hide();
        };

        $scope.$on('$ionicView.beforeEnter', function(){
           initOrderData();
        });

        function initOrderData () {
            $scope.c_unit = CURRENCY;
            // Getting Current Business Information -------------
            $scope.curBusiness = gCurRestaurant.getData();
            $scope.curBusinessInfo = $scope.curBusiness.restData;

            $scope.curMyDishes = gOrder.getData();
            $scope.deliveryFee = $scope.curBusiness.deliveryFee;
            $scope.delivery = {
                comments : ''
            };

             if ($scope.curBusinessInfo.minimum == "") $scope.curBusinessInfo.minimum = "0";
            $scope.minimumPrice = parseFloat($scope.curBusinessInfo.minimum);
            $scope.subTotal = 0;

            for (var i = 0, len = $scope.curMyDishes.length; i < len; i++) {
                $scope.subTotal += $scope.curMyDishes[i].total;
            }

            $scope.calcTotalPrice = 0;
            var feePro = parseFloat($scope.curBusinessInfo.servicefee) * 0.01;
            $scope.serviceFee = $scope.subTotal * feePro;

            // Relation of Tax --------------------------
            var taxPro = parseFloat($scope.curBusinessInfo.tax) * 0.01;
            $scope.taxPrice = $scope.subTotal * taxPro;

            $scope.tax = [
                { id : 1, val : 'Tax not included on price'},
                { id : 2, val : 'Tax included on price'}
            ];

            $scope.taxType = $scope.tax[parseInt($scope.curBusinessInfo.taxtype) - 1].val;
            if ($scope.curBusinessInfo.taxtype == '2'){
                $scope.calcTotalPrice = $scope.subTotal + $scope.serviceFee + parseFloat($scope.deliveryFee);
            }else {
                $scope.calcTotalPrice = $scope.subTotal + $scope.serviceFee + parseFloat($scope.deliveryFee) + $scope.taxPrice;
            }

            $scope.businessData = {
                Total : $scope.calcTotalPrice,
                business : [],
                buyer : {},
                customslug : $scope.curBusinessInfo.customslug,
                discountprice : 0,
                grandtotal : $scope.calcTotalPrice,
                reserve : {},
                reserveFee : 0,
                reservePrice : {},
                reserveQty : {},
                reservepaymethod : {
                    "payu":false,
                    "cash":false,
                    "card":false,
                    "paypal":false,
                    "paypaladaptive":false,
                    "authorize":false,
                    "braintree":false,
                    "mercury":false,
                    "worldpay":false,
                    "mercadopago":false,
                    "transactium":false,
                    "pexpress":false,
                    "maksekeskus":false,
                    "voguepay":false,
                    "skrill":false,
                    "payeezy":false,
                    "stripe":false,
                    "paypalpro":false,
                    "paygistix":false
                },
                reservepaymethoddetails : {
                    "payu":true,
                    "cash":true,
                    "card":false,
                    "paypal":false,
                    "paypaladaptive":true,
                    "authorize":false,
                    "braintree":false,
                    "mercury":false,
                    "worldpay":false,
                    "mercadopago":false,
                    "transactium":false,
                    "pexpress":false,
                    "maksekeskus":false,
                    "voguepay":false,
                    "skrill":false,
                    "payeezy":false,
                    "stripe":true,
                    "paypalpro":true,
                    "paygistix":true
                },
                reservestatus : false,
                servicefee : $scope.curBusinessInfo.servicefee,
                servicefeeTotal : ($scope.serviceFee).toFixed(2),
                servicefeeTotal1 : ($scope.serviceFee).toFixed(2),
                tax : ($scope.taxPrice).toFixed(2),
                total : $scope.subTotal + $scope.serviceFee,
                twilioenabledclient : false,
                searchinfo : {}
            };

            $scope.singleBusiness = {
                id : $scope.curBusinessInfo.id,
                name : $scope.curBusinessInfo.name,
                tel : $scope.curBusinessInfo.tel,
                email : $scope.curBusinessInfo.email,
                paymethod : {
                    "cash":false,
                    "card":false,
                    "paypal":false,
                    "paypaladaptive":false,
                    "authorize":false,
                    "braintree":false,
                    "mercury":false,
                    "worldpay":false,
                    "mercadopago":false,
                    "transactium":false,
                    "pexpress":false,
                    "maksekeskus":false,
                    "voguepay":false,
                    "skrill":false,
                    "payeezy":false,
                    "payu":false
                },
                paymethoddetail : {
                    "cash":true,
                    "card":false,
                    "paypal":false,
                    "paypaladaptive":false,
                    "authorize":false,
                    "braintree":false,
                    "mercury":false,
                    "worldpay":false,
                    "mercadopago":false,
                    "transactium":false,
                    "pexpress":false,
                    "maksekeskus":false,
                    "voguepay":false,
                    "skrill":false,
                    "payeezy":false,
                    "payu":false
                },
                shipping : $scope.curBusinessInfo.shipping,
                minimum: $scope.curBusinessInfo.minimum,
                dishes : [],
                twiliophone : $scope.curBusinessInfo.twiliophone,
                twilioenabled : $scope.curBusinessInfo.twilioenabled,
                acceptsms : $scope.curBusinessInfo.acceptsms
            };

            $rootScope.buyerInfo = {
                id : "",
                address :"",
                city :"",
                cityname :"",
                tax :$scope.curBusinessInfo.tax,
                taxtype :$scope.curBusinessInfo.taxtype,
                deliveryType :"",
                deliverydate :"ASAP",
                comments : "",
                name :"",
                lastname2 :"",
                email :"",
                api :"",
                colony :"",
                tel :"",
                checkoutfields : [
                    "Phone",
                    "Receive SMS",
                    "Tip For The Driver",
                    "Discount Coupon",
                    "ChackoutMap",
                    "Name",
                    "Last Name",
                    "Email",
                    "Full Address",
                    "APT\/Suit",
                    "Area \/ Neighborhood"
                ]
            };
        }

        $scope.updateOrderData = function () {
            $scope.singleBusiness.dishes = $scope.curMyDishes;
            $scope.businessData.business.push($scope.singleBusiness);
            $scope.businessData.buyer = $rootScope.buyerInfo;
            //$scope.businessData.taxPrice = $scope.taxPrice;
            //$scope.businessData.taxType = $scope.curBusinessInfo.taxtype;
            gBusinessData.setData($scope.businessData);
        };

        // Checking User Information--------------------------
        $scope.onFinalCheckOut = function(){

            gStates.setState(STATE.ORDERING);

            $scope.updateOrderData();
            if (typeof gUserData.getData().id == 'undefined' || !LOGIN_STATE){
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                gDeliveryComment.setData($scope.delivery.comments);
                $state.go('signUp');
            }else {
                $scope.show($ionicLoading);
                CheckOutInfoApi.charge({

                }, function(res) {

                    if (res.status == true) {
                        $scope.checkFields = [];
                        angular.forEach(res.checkout, function (obj) {
                            if (obj.status == true) {
                                $scope.checkFields.push(obj.field_name);
                            }
                        });
                        $rootScope.buyerInfo.id = gUserData.getData().id;          // String
                        $rootScope.buyerInfo.address = gUserData.getData().address;          // String
                        $rootScope.buyerInfo.city = gUserData.getData().city;                // Number
                        $rootScope.buyerInfo.cityname = gUserData.getData().cityname;      // String
                        //$rootScope.buyerInfo.tax = ''+$scope.taxPrice;                 // Number
                        //$rootScope.buyerInfo.taxtype = $scope.curBusinessInfo.taxtype;             // Number
                        $rootScope.buyerInfo.deliveryType = gNearService.getData().orderType;   // String
                        $rootScope.buyerInfo.deliverydate = "ASAP";     // String(date)
                        $rootScope.buyerInfo.name = gUserData.getData().name;               // String
                        $rootScope.buyerInfo.lastname2 = gUserData.getData().lastname2;         // String
                        $rootScope.buyerInfo.email = gUserData.getData().email;   // String
                        $rootScope.buyerInfo.api = gUserData.getData().api;                 // String
                        $rootScope.buyerInfo.colony = gUserData.getData().colony;            // String
                        $rootScope.buyerInfo.tel = gUserData.getData().tel;           // String
                        $rootScope.buyerInfo.checkoutfields = $scope.checkFields;
                        $rootScope.buyerInfo.comments = $scope.delivery.comments;

                        $scope.businessData.buyer = $rootScope.buyerInfo;
                        gBusinessData.setData($scope.businessData);
                        $scope.hide();
                    }
                });

                $state.go('finalCheckOut');
            }
        };
        $scope.offFinalCheckOut = function(){
            $scope.modal.hide();
        };

        // Place Order Part -------------------------
        $scope.onPlaceOrder = function () {

        };
        // Cancel Button Action ---------------------

        $scope.cancelOrder = function(){

            var promptPopup = $ionicPopup.confirm({
                title: $filter('translate')('OrderingApp'),
                template: $filter('translate')('Do you want to cancel current order?'),
                cancelType: 'button-stable',
                okText: $filter('translate')('OK'),
                cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right',
                cancelText: $filter('translate')('Cancel')
            });
            promptPopup.then(function(res) {
                if (res) {
                    console.log('Pressed OK!');
                    var ary = [];
                    gOrder.setData(ary);
                    $state.go('restaurantSearch');

                } else {
                    console.log('Pressed CANCEL!');
                }
            });
        }
    })

    .controller('signUpCtrl',function($scope, $state, $stateParams, $rootScope, $ionicLoading, $ionicHistory, $ionicModal, $ionicPopup, $filter, gAllBusiness, gNearService, gBusinessData, gDeliveryComment, gCurRestaurant, gOrder, gUserData, GetUserByIdApi, CheckOutInfoApi, UserRegisterApi, SignInApi, gStates, PushUserApi, ngFB, gMyLatLng, $http) {

        $scope.show = function() {
            $ionicLoading.show({
                template: '<p>{{ "GettingData..." | translate }}</p><ion-spinner icon="ripple" class="spinner-assertive"></ion-spinner>'
            });
        };
        $scope.hide = function(){
            $ionicLoading.hide();
        };

        $scope.$on('$ionicView.enter',function(){
           initVariable();
        });
        // init variables -------------------------------
        function initVariable () {
            $scope.signUpUser = {
                name        : $stateParams.name || '',
                lastname    : '' ,
                lastname2   : '' ,
                email       : '' ,
                password    : '' ,
                address     : '' ,
                colony      : '' ,
                zip         : '' ,
                country     : '' ,
                city        : '' ,
                tel         : '' ,
                cel         : '' ,
                api         : '',
                imgpath     : '',
                level       : '',
                mobile      : $stateParams.mobile_number || '',
                registration_code : ''
            };

            $scope.signInUser = {
                email : '',
                pwd : ''
            };
        }
        initVariable();
        // Buyer Info Setting ---------------------------
        var nearService = gNearService.getData();
        $scope.allData = gBusinessData.getData();
        //if (typeof $scope.allData.buyer != 'undefined'){
        //    $scope.buyerInfo = $scope.allData.buyer;
        //}else {
        //    $scope.buyerInfo = {};
        //}

        $scope.buyerInfoSetting = function (userID) {
            $scope.show($ionicLoading);
            // Getting CheckOut Fields and Setting the Buyer Data
            if (userID == '-1'){
                /*GetUserByIdApi.charge({
                    id : '-1'
                },function(res){
                    $scope.hide();
                    if (res.status == true){
                        gUserData.setData(res.register[0]);
                        $scope.setBuyer();
                        $state.go('finalCheckOut');
                    }
                });*/

                gUserData.setData($scope.signInUser);
                $scope.setBuyer();
            }else {
                $scope.setBuyer();
            }
        };

        $scope.setBuyer = function () {
            CheckOutInfoApi.charge({
            }, function(res){
                if (res.status == true){
                    $scope.checkFields = [];
                    angular.forEach(res.checkout, function(obj){
                        if (obj.status == true){
                            $scope.checkFields.push(obj.field_name);
                        }
                    });
                    $scope.hide();
                    // Setting User's Informations------------------------
                    $rootScope.buyerInfo.id = gUserData.getData().id;
                    $rootScope.buyerInfo.address = gUserData.getData().address;          // String
                    $rootScope.buyerInfo.city = gUserData.getData().city;                // Number
                    $rootScope.buyerInfo.cityname = gUserData.getData().cityname;      // String
                    //$rootScope.buyerInfo.tax = "1";                                     // Number
                    //$rootScope.buyerInfo.taxtype = "1";                                  // Number
                    $rootScope.buyerInfo.deliveryType = nearService.orderType;           // String
                    $rootScope.buyerInfo.deliverydate = "ASAP";                          // String(date)
                    $rootScope.buyerInfo.name = gUserData.getData().name;               // String
                    $rootScope.buyerInfo.lastname2 = gUserData.getData().lastname2;         // String
                    $rootScope.buyerInfo.email = gUserData.getData().email;              // String
                    $rootScope.buyerInfo.api = gUserData.getData().api;                 // String
                    $rootScope.buyerInfo.colony = gUserData.getData().colony;            // String
                    $rootScope.buyerInfo.tel = gUserData.getData().tel;                  // String
                    $rootScope.buyerInfo.checkoutfields = $scope.checkFields;
                    $rootScope.buyerInfo.comments = gDeliveryComment.getData();

                    // Setting Business Data ---------------------------------
                    $scope.allData.buyer = $rootScope.buyerInfo;
                    gBusinessData.setData($scope.allData);

                    if (gStates.getState() == STATE.PROFILE){
                        $ionicHistory.nextViewOptions({
                            disableBack: false
                        });
                        $state.go('sideMenu.profile');
                    }else if(gStates.getState() == STATE.MY_ORDER) {
                        $ionicHistory.nextViewOptions({
                            disableBack: false
                        });
                        $state.go('sideMenu.myOrder');
                    }else if (gStates.getState() == STATE.ORDERING) {
                        $state.go('finalCheckOut');
                    }
                    $scope.offSigninPopup();

                }else {
                    var promptPopup = $ionicPopup.prompt({
                        title: $filter('translate')('OrderingApp'),
                        template: $filter('translate')('Failed with Getting User Data. Try again?'),
                        okText: $filter('translate')('OK'),
                        cancelText: $filter('translate')('Cancel'),
                        cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right',
                        cancelType: 'button-stable'
                    });
                    promptPopup.then(function(res) {
                        if (res) {
                            console.log('Pressed OK!');
                            if (res == ''){
                                $scope.buyerInfoSetting('1');
                            }else {
                                $scope.buyerInfoSetting(res);
                            }
                        } else {
                            console.log('Pressed CANCEL!');
                        }
                    });
                }
            });
        };
        //-------------------------------------------------
        $scope.onClickBack = function () {
            if (gStates.getState() == STATE.ORDERING){
                $ionicPopup.confirm({
                    title : $filter('translate')('OrderingApp'),
                    template : $filter('translate')('Are you cancel your Order!'),
                    cancelType: 'button-stable',
                    okText: $filter('translate')('OK'),
                    cancelText: $filter('translate')('Cancel'),
                    cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right'
                }).then(function(res){
                    if (res){
                        console.log('Pressed OK!');
                        var ary = [];
                        gOrder.setData(ary);
                        //$ionicHistory.clearCache();
                        //$ionicHistory.clearHistory();
                        $ionicHistory.nextViewOptions({
                            disableBack: false
                        });
                        $state.go('sideMenu.homeScreen');
                    }else {

                    }
                });
            }else {
                $ionicHistory.nextViewOptions({
                    disableBack : false
                });
                $state.go('sideMenu.homeScreen');
            }
        };
        $scope.onClickCheckOut = function () {
            $state.go('finalCheckOut');
        };

        // ------ Implement of Sign-in Popup ------------------------------
        $ionicModal.fromTemplateUrl('templates/sign-in.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });
        $scope.onSigninPopup = function(){
            $scope.modal.show();
        };
        $scope.offSigninPopup = function(){
            $scope.modal.hide();
        };

        // LOGIN PART -------------------------------------------------------

        $scope.signIn = function () {
            if ($scope.signInUser.email == '' || $scope.signInUser.pwd == '' ) {
                $ionicPopup.alert({
                    title : $filter('translate')('OrderingApp'),
                    template : $filter('translate')('Please Fill Required Fields!'),
                    okText: $filter('translate')('OK'),
                    cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right'
                });
                return;
            }

            $scope.show($ionicLoading);
            SignInApi.charge({
                email : $scope.signInUser.email,
                pwd : $scope.signInUser.pwd
            }, function (res){
                //$scope.hide();
                if (res.status == true){
                    // Getting User by ID -------------------------------------------
                    USER_STATE = 'LOGIN';
                    LOGIN_STATE = true;

                    getUserInformation(res.id);

                    localStorage.setItem(STORE_VAL.USR_ID, res.id);
                    localStorage.setItem(STORE_VAL.LOGIN, true);
                    //--------------------------------------------------
                }else {
                    $scope.hide();
                    $ionicPopup.alert({
                        title : $filter('translate')('OrderingApp'),
                        template : $filter('translate')('Invalid user data. Please try again'),
                        okText: $filter('translate')('OK'),
                        cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right'
                    });
                }
            })
        };

        // Get User and Setting Buyer information by ID ----------------

        function getUserInformation ( usr_id ) {

                    // Registration of Device Token --------------------
            var device_kind = 0;
            if (ionic.Platform.isIOS()){
                device_kind = 1;
            }else{
                device_kind = 0;
            }
             //alert("kind" + device_kind + "user" + usr_id + "device_id" + GCM_DEVICE_TOKEN);
            if (GCM_DEVICE_TOKEN != ''){
                PushUserApi.charge({
                    user_id : usr_id,
                    device_id : GCM_DEVICE_TOKEN,
                    kind : device_kind
                },function(res){
                     console.log("Device_REG_RESP : "+JSON.stringify(res));
                });
            }

            GetUserByIdApi.charge({
                id : usr_id
            },function(res){
                $scope.hide();
                gUserData.setData(res.register[0]);        // Setting User Data
                if (USER_STATE == 'FB_USER'){
                    var buffUser = gUserData.getData();
                    buffUser.profilepic = $scope.fbImagePath;
                    gUserData.setData(buffUser);
                }
                if (res.register[0].address != ''){
                    //gMyLatLng.setData(getLocationFromAddress(res.register[0].address));         // Get My Location from full address
                }

                $scope.buyerInfoSetting(usr_id); // BuyerInfoSetting

            });

        }

        // ------ Implement of Register Popup ------------------------------
        $ionicModal.fromTemplateUrl('templates/register.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal1 = modal;
        });
        $scope.onRegPopup = function(){
            $scope.modal1.show();
        };
        $scope.offRegPopup = function(){
            $scope.modal1.hide();
        };


        $scope.onClickSignUpNextStep = function () {
            if ($scope.signUpUser.name == '' || $scope.signUpUser.mobile_number == '') {
                $ionicPopup.alert({
                    title : $filter('translate')('OrderingApp'),
                    template : $filter('translate')('Please Fill Required Fields!'),
                    okText: $filter('translate')('OK'),
                    cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right'
                });
                return;
            } else if (/\D/.test($scope.signUpUser.mobile_number)){
                $ionicPopup.alert({
                    title : $filter('translate')('OrderingApp'),
                    template : $filter('translate')('Please Enter only numbers'),
                    okText: $filter('translate')('OK'),
                    cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right'
                });
                return
            } else if ($scope.signUpUser.mobile_number.indexOf('07') != 0 || $scope.signUpUser.mobile_number.length != 11){
                $ionicPopup.alert({
                    title : $filter('translate')('OrderingApp'),
                    template : $filter('translate')('Please enter correct mobile number'),
                    okText: $filter('translate')('OK'),
                    cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right'
                });
                return
            }

            var promptPopup = $ionicPopup.confirm({
                title: $filter('translate')('OrderingApp'),
                template: "<h5>" + $filter('translate')('Please confirm your name and mobile number') + "</h5><div>" + $filter('translate')('Name') + ": " + $scope.signUpUser.name + "</div><div>" + $filter('translate')('Mobile Number') + ": " +  $scope.signUpUser.mobile_number + "</div>",
                cancelType: 'button-stable',
                okText: $filter('translate')('OK'),
                cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right',
                cancelText: $filter('translate')('Cancel')
            });

             promptPopup.then(function(res) {
                if (res) {
                    hash = sha512('St49tOr03sXa82jAx83r' + $scope.signUpUser.mobile_number)
                    $http({
                        method: 'POST',
                        url: 'http://order.talabatey.com/m_api/v1/requestcode/',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'},
                        transformRequest: function(obj) {
                            var str = [];
                            for(var p in obj)
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                            return str.join("&");
                        },
                        data: {
                        msisdn : $scope.signUpUser.mobile_number,
                        hash: hash
                        }
                    }).then(function (res) {     //first function "success"
                        $state.go('nextStep', {name: $scope.signUpUser.name, mobile_number: $scope.signUpUser.mobile_number});
                    }, function (err) {          //second function "error"
                        $ionicPopup.alert({
                            title : $filter('translate')('OrderingApp'),
                            template : $filter('translate')('Failed to get registration code')
                        })
                    });

                } else {

                }
            });




        };
        //-------------------------------------------------------------------
        $scope.onClickSignUp = function () {
            // if ($scope.signUpUser.name == '' || $scope.signUpUser.mobile_number == '' || $scope.signUpUser.registration_code == '') {
            //     $ionicPopup.alert({
            //         title : 'OrderingApp',
            //         template : 'Please Fill Required Fields!'
            //     });
            //     return;
            // }
            USER_STATE = 'SIGNUP';
            hash = sha512('St49tOr03sXa82jAx83r' + $scope.signUpUser.mobile + $scope.signUpUser.registration_code)
            $http({
                method: 'POST',
                url: 'http://order.talabatey.com/m_api/v1/verify/',
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'},
                transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                data: {
                msisdn : $scope.signUpUser.mobile,
                pin: $scope.signUpUser.registration_code,
                hash: hash
                }
            }).then(function (res) {     //first function "success"
                LOGIN_STATE = true;
                a = $ionicPopup.alert({
                    title : $filter('translate')('OrderingApp'),
                    template : $filter('translate')('Thanks')+ ' ' + $scope.signUpUser.name + ', ' + $filter('translate')('your registration is done successfully'),
                    okText: $filter('translate')('OK'),
                    cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right'
                });

                a.then(function(res) {
                    if (res) {
                        onRegister()
                        $state.go('sideMenu.homeScreen');
                    }
                })
            }, function (err) {          //second function "error"
                $ionicPopup.alert({
                    title : $filter('translate')('OrderingApp'),
                    template : $filter('translate')('Register Failed! please try again later.'),
                    okText: $filter('translate')('OK')
                })
            });

        };

        function onRegister () {
        // function onRegister = function () {
            $scope.signUpUser.level = '3';
            $scope.show($ionicLoading);
            UserRegisterApi.charge({
                name        : $scope.signUpUser.name,
                lastname    : $scope.signUpUser.lastname ,
                lastname2   : $scope.signUpUser.lastname2 ,
                email       : $scope.signUpUser.email,
                password    : $scope.signUpUser.password ,
                address     : $scope.signUpUser.address,
                colony      : $scope.signUpUser.colony,
                zip         : $scope.signUpUser.zip,
                country     : '1',
                city        : '1',
                tel         : $scope.signUpUser.tel,
                cel         : $scope.signUpUser.mobile,
                api         : $scope.signUpUser.api,
                imgpath     : '',
                level       : $scope.signUpUser.level
            }, function(res){

                if (res.status == true) {
                    LOGIN_STATE = true;
                    localStorage.setItem(STORE_VAL.USR_ID, res.id);
                    getUserInformation(res.id);
                }else {
                    $scope.hide();
                    $ionicPopup.alert({
                        title : 'OrderingApp',
                        template : 'Register Failed! please try again later.',
                        okText: $filter('translate')('OK'),
                        cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right'
                    });
                }
            })
        };

        $scope.onClickGuest = function() {
            if (gStates.getState() == STATE.PROFILE){
                $ionicHistory.nextViewOptions({
                    disableBack: false
                });
                $state.go('sideMenu.homeScreen');
            }else if(gStates.getState() == STATE.MY_ORDER) {
                $ionicHistory.nextViewOptions({
                    disableBack: false
                });
                $state.go('sideMenu.homeScreen');
            }else if (gStates.getState() == STATE.ORDERING) {
                //$scope.buyerInfoSetting('-1'); // BuyerInfoSetting
                USER_STATE = 'GUEST';
                $scope.signUpUser.id = '-1';
                gUserData.setData($scope.signUpUser);
                $scope.setBuyer();

                //$state.go("finalCheckOut");
            }
        };

        // FB Login Part --------------------------------------------------

        $scope.fbLogin = function () {

            ngFB.login({scope: 'email,public_profile,publish_actions,user_location'}).then(
                function (response) {
                    if (response.status === 'connected') {
                        LOGIN_STATE = true;
                        USER_STATE = 'FB_USER';
                        console.log('Facebook login succeeded');
                        $scope.getFBProfile();

                    } else {
                        alert('Facebook login failed');
                    }
                });
        };

        $scope.getFBProfile = function () {
            $scope.show($ionicLoading);
            ngFB.api({
                path : '/me',
                params : {fields: 'id,name,email,location'}
            }).then(
                function (user) {
                    $scope.user = user;
                    $scope.setUserToBuyer(user);
                },
                function (error) {
                    alert('FB error : ' + error.message);
                    $scope.hide();
                }
            )
        };

        $scope.setUserToBuyer = function (user) {

            var nameAry = (user.name).split(" ");
            $scope.signUpUser.name = nameAry[0];
            $scope.signUpUser.lastname = nameAry[1];
            $scope.signUpUser.email = user.email;
            $scope.signUpUser.password = 'fbuser';
            $scope.fbImagePath = 'http://graph.facebook.com/'+ user.id +'/picture?width=270&height=270';

            SignInApi.charge({
                email : user.email,
                pwd : 'fbuser'
            },function(res){
                if (res.status){
                    getUserInformation(res.id);
                }else {
                    $scope.onRegister();
                }
            });
        };

        //-------------------------------------------------------------------
    })

    .controller('registerCtrl',function($scope, $state, $ionicModal, gAllBusiness, gCurRestaurant, gOrder) {

    })

    .controller('finalCheckOutCtrl', function($scope, $state, $ionicScrollDelegate, $ionicLoading, $ionicModal, $ionicPopup, $ionicHistory, $filter, gNearService, gAllBusiness, gCurRestaurant, gOrder, gUserData, gBusinessData, PlaceOrderApi, PlaceOrderApi2, gMyLatLng, PaypalService, UpdateUserApi, $rootScope) {

        $scope.show = function() {
            $ionicLoading.show({
                template: '<p>{{ "Ordering..." | translate }}</p><ion-spinner icon="lines" class="spinner-assertive"></ion-spinner>'
            });
        };
        $scope.hide = function(){
            $ionicLoading.hide();
        };

        $scope.c_unit = CURRENCY;           // Currency Format
        $scope.userState = USER_STATE;

        // Part of Display for map ---------------------------------------------------

        $scope.$on('$ionicView.beforeEnter', function(){
            $ionicScrollDelegate.scrollTop();
            // $scope.loadMap();
            initVariables();
        });
        $scope.gMap2 = new GoogleMap();
        $scope.loadMap = function(){
            var latLng = gMyLatLng.getData();
            $scope.gMap2.initialize('map2', latLng.lat, latLng.lng, 15);
        };

        //---------------------------------------------------------------------

        $scope.cancelOrder = function(){

            var promptPopup = $ionicPopup.confirm({
                title: $filter('translate')('OrderingApp'),
                template: $filter('translate')('Do you want to cancel current order?'),
                cancelType: 'button-stable',
                okText: $filter('translate')('OK'),
                cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right',
                cancelText: $filter('translate')('Cancel')
            });
            promptPopup.then(function(res) {
                if (res) {
                    console.log('Pressed OK!');
                    var ary = [];
                    gOrder.setData(ary);
                    $state.go('restaurantSearch');

                } else {
                    console.log('Pressed CANCEL!');
                }
            });
        }

        function initVariables(){
            $scope.data = {
                driveTips: '0.00'
            };

            $scope.finalCheckout = {
                specialcomment : ''
            };

            $scope.paymentModel = {
                val : $filter('translate')('none'),
                model : $filter('translate')('Please select')
            };

            $scope.order_buyer = gUserData.getData();
            // Getting Current Business Data from Cache ------------------
            $scope.curBusiness = gBusinessData.getData();

            $scope.subTotalPrice = $scope.curBusiness.total;
            $scope.totalPrice = $scope.curBusiness.total;
            $scope.curBusinessInfo = gCurRestaurant.getData().restData;
            $scope.deliveryFee = gCurRestaurant.getData().deliveryFee;

            //$scope.curStreet = $scope.curBusinessInfo.street + ', ' + gNearService.getData().nearAddress;
            $scope.curStreet = gNearService.getData().nearAddress;
            if ($scope.order_buyer.address === null || $scope.order_buyer.address === undefined) {
                $scope.order_buyer.address = localStorage.getItem("currentArea");
                console.log($scope.order_buyer.address);
            }

            $scope.taxPrice = parseFloat($scope.curBusiness.tax);

            $scope.driverTipsList = [
                { text: "0%", value: '0.00' },
                { text: "10%", value:($scope.totalPrice * 0.10).toFixed(2)},
                { text: "15%", value:($scope.totalPrice * 0.15).toFixed(2)},
                { text: "20%", value:($scope.totalPrice * 0.20).toFixed(2)},
                { text: "25%", value:($scope.totalPrice * 0.25).toFixed(2)}
            ];

            $scope.changedRadioValue();

            /// Fetching Order Data ----------------------------------------------

            $scope.curBusiness.Total = (parseFloat($scope.orderTotal)).toFixed(2);
            $scope.curBusiness.grandtotal = $scope.curBusiness.Total;

            if (LOGIN_STATE) {
                if (USER_STATE == 'FB_USER'){
                  /*  $ionicPopup.alert({
                        title : 'OrderingApp',
                        subTitle : 'Welcome to login!',
                        template : "User : " + $scope.order_buyer.email
                    })*/;
                }else {
                  /*  $ionicPopup.alert({
                        title : 'OrderingApp',
                        subTitle : 'Welcome to login!',
                        template : "User : " + $scope.order_buyer.email + "\r\nPassword : " + $scope.order_buyer.password
                    })*/;
                }
            }
            /// -------------------- ----------------------------------------------
        }

        $scope.changedRadioValue = function()
        {
            if ($scope.curBusinessInfo.taxtype == '2'){
                $scope.orderTotal = parseFloat($scope.totalPrice) + parseFloat($scope.deliveryFee) + parseFloat($scope.data.driveTips); // Total Price for Ordering
            }else {
                $scope.orderTotal = parseFloat($scope.totalPrice) + parseFloat($scope.deliveryFee) + parseFloat($scope.data.driveTips) + $scope.taxPrice; // Total Price for Ordering
            }
            //$scope.orderTotal = parseFloat($scope.orderTotal) + parseFloat($scope.data.driveTips);
        };

        $scope.onClickDetail = function ()
        {
            $state.go('ordering.checkOut');
        };

        // Order Confirm Part ------------------------
        $ionicModal.fromTemplateUrl('templates/order-confirm-popup.html', {
            scope: $scope,
            animation: 'slide-in-up',
            hardwareBackButtonClose: false
        }).then(function(modal) {
            $scope.modal1 = modal;
        });
        $scope.onConfirm = function(){
            $scope.modal1.show();
            //$scope.offCheckOut();
        };
        $scope.offConfirm = function(){
            $scope.onGoToHome();
            $scope.modal1.hide();
        };
        $scope.onGoToHome = function(){
            $ionicHistory.clearHistory();
            $ionicHistory.clearCache().then(function(){ $state.go('sideMenu.homeScreen')});
            //$state.go('sideMenu.homeScreen');
        };

        //For send notification
        $scope.sendConfirmNotification = function(){
            //console.log("in sendConfirmNotification");
            /*window.plugins.OneSignal.enableInAppAlertNotification(true);
            window.plugins.OneSignal.enableNotificationsWhenActive(true);

            window.plugins.OneSignal.getIds(function(ids) {
                //console.log(ids.userId);
              var notificationObj = { contents: {en: "Your Order is confirmed !"},
                                      include_player_ids: [ids.userId],
                                     isIos:true,
                                     isAndroid:true};
              window.plugins.OneSignal.enableInAppAlertNotification(true);
              window.plugins.OneSignal.enableNotificationsWhenActive(true);
              window.plugins.OneSignal.postNotification(notificationObj,
                function(successResponse) {
                  //console.log("Notification Post Success:", successResponse);
                },
                function (failedResponse) {
                  //console.log("Notification Post Failed: ", failedResponse);
                  //alert("Notification Post Failed:\n" + JSON.stringify(failedResponse));
                }
              );
            });*/
        }

        $scope.fieldDetect = function( str ) {
            /*$ionicPopup.alert({
                title : $filter('translate')('OrderingApp'),
                template : str
            });*/
            $ionicScrollDelegate.scrollTop();
        };

        //---Payment select Part ---------------------- , card on delivery, and paypal

        $scope.payment = [
            { val : 'cash', name : 'Cash on delivery', img : 'img/cash-icon.png'},
            { val : 'card', name : 'Card on delivery', img : 'img/debit-icon.png'},
          //  { val : 'paypal', name : 'Paypal', img : 'img/paypal-icon.png'}
        ];

        /// Paypal ------------------------
        $scope.onClickMethod = function ( item ) {

            if (item.val == 'paypal'){
                //$scope.onClickPaypal();
                $ionicLoading.show();
                PaypalService.initPaymentUI().then(function () {
                    $ionicLoading.hide();
                    PaypalService.makePayment($scope.orderTotal, 'Total Amount').then(function (response) {
                        $ionicPopup.alert({
                            title : $filter('translate')("OrderingApp"),
                            template : 'Success'+JSON.stringify(response),
                            okText: $filter('translate')('OK'),
                            cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right'
                        });
                        //alert('Success'+JSON.stringify(response));
                        $scope.paymentModel.val = 'Paid with PayPal';
                        $scope.curBusiness.business[0].paymethod.paypal = true;
                        $scope.curBusiness.business[0].paymethoddetail.paypaladaptive = true;
                        $scope.modal2.hide();
                    }, function (error) {
                        $scope.paymentModel = {
                            val : $filter('translate')('none'),
                            model : $filter('translate')('Please select')
                        };
                        $ionicPopup.alert({
                            title : $filter('translate')("OrderingApp"),
                            template : $filter('translate')('Transaction Canceled'),
                            okText: $filter('translate')('OK'),
                            cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right'
                        });
                        //alert('Transaction Canceled');
                    });
                });
            }else{
                $scope.paymentModel.val = item.val;
            }
        };

        //-------------------------------------------------------------------------------

        $ionicModal.fromTemplateUrl('templates/payment-select-popup.html', {
            scope: $scope,
            animation: 'slide-in-left'
        }).then(function(modal) {
            $scope.modal2 = modal;
        });
        $scope.onPaymentPopup = function(){
            $scope.modal2.show();
        };
        $scope.offPaymentPopup = function(){
            if ($scope.paymentModel.val === 'none') {
                $ionicPopup.alert({
                    title : $filter('translate')('OrderingApp'),
                    template : $filter('translate')('Please select Payment Method!'),
                    okText: $filter('translate')('OK'),
                    cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right'
                });
                return;
            }
            $scope.curBusiness.business[0].paymethod[$scope.paymentModel.val] = true;
            $scope.curBusiness.business[0].paymethoddetail[$scope.paymentModel.val] = true;
            $scope.modal2.hide();
        };

        //---------------------------------------------

        $scope.placedData = {};
        $scope.placeOrderNow = function () {

            if ($scope.order_buyer.name == '' || $scope.order_buyer.email == '' ||
                $scope.order_buyer.address == '' || $scope.order_buyer.tel == '') {
                $scope.fieldDetect('Please Fill Required Fields!');
                return;
            }
            // }else if ($scope.paymentModel.val == 'none'){
            //     $scope.fieldDetect('Please Select your Payment Method');
            //     return;
            // }
            // Update Buyer Info=
            $scope.curBusiness.buyer.name = $scope.order_buyer.name;
            $scope.curBusiness.buyer.email = $scope.order_buyer.email;
            $scope.curBusiness.buyer.address = $scope.order_buyer.address;
            $scope.curBusiness.buyer.street = $scope.order_buyer.address;
            $scope.curBusiness.buyer.tel = $scope.order_buyer.cel;
            $scope.curBusiness.buyer.tips = $scope.data.driveTips;
            $scope.curBusiness.buyer.api = $scope.finalCheckout.specialcomment;
            $scope.curBusiness.Total = $scope.orderTotal;
            $scope.curBusiness.total = $scope.orderTotal;

            $scope.curBusiness.buyer.cityname = 'New York';
            /*$scope.curBusiness.grandtotal = $scope.orderTotal;

            $scope.curBusiness.buyer.reference = '';
            $scope.curBusiness.buyer.cel = "34";
            $scope.curBusiness.buyer.cp = "";
            $scope.curBusiness.buyer.zip = "10009";
            $scope.curBusiness.buyer.zipcode = "10009";
            $scope.curBusiness.buyer.countryname = "United States";

            $scope.curBusiness.buyer.deliveryType = "delivery";
            $scope.curBusiness.buyer.deliverydate = "ASAP";
            $scope.curBusiness.buyer.checkoutfields = [
                "Name",
                "Email",
                "Full Address",
                "Phone",
                "Takeout Date",
                "Tip For The Driver",
                "Discount Coupon"
            ];*/

            if (USER_STATE != 'GUEST'){
                /*$scope.show($ionicLoading);

                UpdateUserApi.charge({
                    id : $scope.order_buyer.id,
                    name : $scope.order_buyer.name,
                    lastname : $scope.order_buyer.lastname,
                    lastname2 : $scope.order_buyer.lastname2,
                    email : $scope.order_buyer.email,
                    password : $scope.order_buyer.password,
                    address : $scope.order_buyer.address,
                    colony : $scope.order_buyer.colony,
                    zip : $scope.order_buyer.zip,
                    country : '1',
                    city :  '1',
                    tel : $scope.order_buyer.tel,
                    cel : $scope.order_buyer.cel,
                    api : '',
                    imgpath : ''
                }, function(res){

                    var str = JSON.stringify($scope.curBusiness);
                    gBusinessData.setData($scope.curBusiness);

                    PlaceOrderApi.charge({
                        id : gUserData.getData().id,
                        data : str,
                        ordercomment : $scope.finalCheckout.specialcomment
                    }, function(res){
                        $scope.hide();
                        if (res.status == true) {
                            $scope.placedData = res;
                            // All Order data init
                            initOrderData();
                            $scope.onConfirm();
                        }else{
                            $ionicPopup.alert({
                                title : 'OrderingApp',
                                template : 'Failed Place Order!! ^o^'
                            })
                        }
                    });
                });*/

            }else {
                $scope.order_buyer.cityname = '';
                gUserData.setData($scope.order_buyer);
                $scope.curBusiness.buyer.id = '-1';
                $scope.curBusiness.buyer.cityname = 'New York';
                $scope.curBusiness.buyer.city = '1';
            }

            $scope.show($ionicLoading);

            var str = JSON.stringify($scope.curBusiness);
            gBusinessData.setData($scope.curBusiness);

            PlaceOrderApi.charge({
                id : gUserData.getData().id,
                data : str,
                ordercomment : $scope.finalCheckout.specialcomment
            }, function(res){
                $scope.hide();
                if (res.status == true) {
                    $scope.placedData = res;
                    // All Order data init
                    initOrderData();
                    $scope.onConfirm();
                    $scope.sendConfirmNotification();
                }else{
                    $ionicPopup.alert({
                        title : $filter('translate')('OrderingApp'),
                        template : 'Failed Place Order!! ^o^',
                        okText: $filter('translate')('OK'),
                        cssClass: ['ar', 'kr'].indexOf($rootScope.lang) > -1 ? 'right_to_left' : 'left_to_right'
                    })
                }
            });
        };

        function initOrderData(){
            //$ionicHistory.clearCache();
            //$ionicHistory.clearHistory();
            var ary = [];
            gOrder.setData(ary);
            gBusinessData.setData({});
            gCurRestaurant.setData({});
            gAllBusiness.setData({});
        }

        $scope.onAutoCompleteAddress = function() {
            setTimeout(function() {
                if (typeof document.getElementsByClassName('backdrop')[0] != 'undefined' &&
                    typeof document.getElementsByClassName('pac-container')[0] != 'undefined'){
                    for (var i = 0; i < document.getElementsByClassName('pac-container').length; i++){
                        document.getElementsByClassName('pac-container')[i].setAttribute('data-tap-disabled', true);
                    }
                    for (i = 0; i < document.getElementsByClassName('backdrop').length; i++){
                        document.getElementsByClassName('backdrop')[i].setAttribute('data-tap-disabled', true);
                    }
                }
            }, 100);
        }
    })

    .controller('checkDetailCtrl',function($scope, $ionicLoading, $compile){

    })

    .controller('MapCtrl', function($scope, $ionicLoading, $compile) {
        //function initialize() {
        //    var myLatlng = new google.maps.LatLng(40.7313848,-73.9849459);
        //
        //    var mapOptions = {
        //        center: myLatlng,
        //        zoom: 16,
        //        mapTypeId: google.maps.MapTypeId.ROADMAP
        //    };
        //    var map = new google.maps.Map(document.getElementById("map"),
        //        mapOptions);
        //
        //    //Marker + infowindow + angularjs compiled ng-click
        //    var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
        //    var compiled = $compile(contentString)($scope);
        //
        //    var infowindow = new google.maps.InfoWindow({
        //        content: compiled[0]
        //    });
        //
        //    var marker = new google.maps.Marker({
        //        position: myLatlng,
        //        map: map,
        //        title: 'Uluru (Ayers Rock)'
        //    });
        //
        //    google.maps.event.addListener(marker, 'click', function() {
        //        infowindow.open(map,marker);
        //    });
        //
        //    $scope.map = map;
        //}
        //google.maps.event.addDomListener(window, 'load', initialize);
        //
        //$scope.centerOnMe = function() {
        //    if(!$scope.map) {
        //        return;
        //    }
        //
        //    $scope.loading = $ionicLoading.show({
        //        content: 'Getting current location...',
        //        showBackdrop: false
        //    });
        //
        //    navigator.geolocation.getCurrentPosition(function(pos) {
        //        $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        //        $scope.loading.hide();
        //    }, function(error) {
        //        alert('Unable to get location: ' + error.message);
        //    });
        //};
        //
        //$scope.clickTest = function() {
        //    alert('Example of infowindow with ng-click')
        //};

    })

    .controller('MapCtrl2', function($scope, $ionicLoading, $compile) {

    })

    .directive('googleplace', function() {
        return {
            require: 'ngModel',
            scope: {
                ngModel: '=',
                details: '=?'
            },
            link: function(scope, element, attrs, model) {
                var options = {
                    types: [],
                    componentRestrictions: {}
                };

                scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

                google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
                    scope.$apply(function() {
                        scope.details = scope.gPlace.getPlace();
                        model.$setViewValue(element.val());
                    });
                });

                // Auto Complete -- Remove long Touch on Google Place DropDown menu ------
                /*setTimeout(function() {
                    if (typeof document.getElementsByClassName('backdrop')[0] != 'undefined' &&
                        typeof document.getElementsByClassName('pac-container')[0] != 'undefined'){

                        document.getElementsByClassName('backdrop')[0].setAttribute('data-tap-disabled', true);
                        document.getElementsByClassName('pac-container')[0].setAttribute('data-tap-disabled', true);

                    }
                }, 500);*/
            }
        };
    })

    .directive('errSrc', function() {
        return {
            link: function(scope, element, attrs) {
                element.bind('error', function() {
                    if (attrs.src != attrs.errSrc) {
                        attrs.$set('src', attrs.errSrc);
                    }
                });
            }
        }
    })

    .directive('imageonload', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.bind('load', function() {
                    alert('image is loaded');
                    AVATAR_LOAD = true;
                });
                element.bind('error', function(){
                    alert('image could not be loaded');
                    scope.$on('$ionicView.loaded',function(){
                        alert("");
                    });
                    AVATAR_LOAD = false;
                });
            }
        };
    })

    .directive('myRepeat', [ '$animate', function($animate) {

        var updateScope = function(scope, index, valueIdentifier, value, key, arrayLength) {
            scope[valueIdentifier] = value;
            scope.$index = index;
            scope.$first = (index === 0);
            scope.$last = (index === (arrayLength - 1));
            scope.$middle = !(scope.$first || scope.$last);
            scope.$odd = !(scope.$even = (index&1) === 0);
        };

        return {
            restrict: 'A',
            transclude: 'element',
            compile: function($element, $attrs) {

                var expression = $attrs.myRepeat;

                var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)?\s*$/);

                var valueIdentifier = match[1];
                var collection = match[2];

                return function($scope, $element, $attr, ctrl, $transclude) {

                    $scope.$watchCollection(collection, function(collection) {
                        var index, length,
                            previousNode = $element[0],
                            collectionLength,
                            key, value;

                        collectionLength = collection.length;

                        for (index = 0; index < collectionLength; index++) {
                            key = index;
                            value = collection[key];

                            $transclude(function(clone, scope) {
                                $animate.enter(clone, null, angular.element(previousNode));
                                previousNode = clone;
                                updateScope(scope, index, valueIdentifier, value, key, collectionLength);
                            });

                        }
                    });

                }
            }
        }

    }])

    .directive('select', function($interpolate) {
        return {
            restrict: 'E',
            require: 'ngModel',
            link: function(scope, elem, attrs, ctrl) {
                var defaultOptionTemplate;
                scope.defaultOptionText = attrs.defaultOption || 'Select...';
                defaultOptionTemplate = '<option value="" disabled selected style="display: none;">{{defaultOptionText}}</option>';
                elem.prepend($interpolate(defaultOptionTemplate)(scope));
            }
        };
    });;
