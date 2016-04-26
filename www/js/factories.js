/**
 * Created by STORM on 2/12/2016.
 */

angular.module('orderingApp.factories',['ngResource'])

    .factory('AllBusinessApi', function($resource){
        return $resource('http://ionicapp.orderingco.com/ionicapp/allbusiness.php',{
            location:'@location',
            deliveryType:'@deliveryType',
            category:'@categories',
            city:0,
            filters:'@filter',
            whereall:'@whereall'
        },{
            charge: {method:'POST'}
        });
    })
    .factory('FetchAllBusinessMenuApi', function($resource){
        return $resource('http://ionicapp.orderingco.com/ionicapp/fetchallbusinessmenu.php',{
            businessid:'@id',
            deliverytype:'@type',
            whereall:'@where'
        },{
            charge: {method:'POST'}
        });
    })
    .factory('BusinessInfoApi', function($resource){
        return $resource('http://ionicapp.orderingco.com/ionicapp/businessinfo.php',{
            businessid:'@id'
        },{
            charge: {method:'POST'}
        });
    })
    .factory('ProductOptionApi', function($resource){
        return $resource('http://ionicapp.orderingco.com/ionicapp/productoption.php',{
            extras_id:[],
            dish_id:''
        },{
            charge: {method:'POST'}
        });
    })
    .factory('GetUserByIdApi', function($resource){
        return $resource('http://ionicapp.orderingco.com/ionicapp/userbyid.php',{
            id:''
        },{
            charge: {method:'POST'}
        });
    })
    .factory('PlaceOrderApi', function($resource){
        return $resource('http://ionicapp.orderingco.com/ionicapp/placeorder.php',{
            id:'',
            data:'',
            ordercomment:''
        },{
            charge: {method:'POST'}
        });
    })
    .factory('PlaceOrderApi2', function($resource){
        return $resource('http://ionicapp.orderingco.com/ionicapp/place_order.php',{
            user_id:'',
            user_city:'',
            placed_data:''
        },{
            charge: {method:'POST'}
        });
    })
    .factory('CheckOutInfoApi', function($resource){
        return $resource('http://ionicapp.orderingco.com/ionicapp/checkoutinfo.php',{

        },{
            charge: {method:'POST'}
        });
    })
    .factory('CityApi', function($resource){
        return $resource('http://ionicapp.orderingco.com/ionicapp/city.php',{
            country : '@countryID'
        },{
            charge: {method:'POST'}
        });
    })
    .factory('UserRegisterApi', function($resource){
        return $resource('http://ionicapp.orderingco.com/ionicapp/register.php',{
            name        : '@name',
            lastname    : '@lName' ,
            lastname2   : '@lName2' ,
            email       : '@Email' ,
            password    : '@Password' ,
            address     : '@Address' ,
            colony      : '@Colony' ,
            zip         : '@Zip' ,
            country     : '@Country' ,
            city        : '@City' ,
            tel         : '@Tel' ,
            cel         : '@Cel' ,
            api         : '@Api',
            imgpath     : '@URL',
            level       : '@level'
        },{
            charge: {method:'POST'}
        });
    })
    .factory('UpdateUserApi', function($resource){
        return $resource('http://ionicapp.orderingco.com/ionicapp/updateuserbyid.php',{
            id          : '@userID',
            name        : '@name',
            lastname    : '@lName' ,
            lastname2   : '@lName2' ,
            email       : '@Email' ,
            password    : '@Password' ,
            address     : '@Address' ,
            colony      : '@Colony' ,
            zip         : '@Zip' ,
            country     : '@Country' ,
            city        : '@City' ,
            tel         : '@Tel' ,
            cel         : '@Cel' ,
            api         : '@Api',
            imgpath     : '@URL'
        },{
            charge: {method:'POST'}
        });
    })
    .factory('SignInApi', function($resource){
        return $resource('http://ionicapp.orderingco.com/ionicapp/login.php',{
            email       : '@Email' ,
            password    : '@Password'
        },{
            charge: {method:'POST'}
        });
    })
    .factory('MyOrderApi', function($resource){
        return $resource('http://ionicapp.orderingco.com/ionicapp/myorder.php',{
            usr : '@userId'
        },{
            charge: {method:'POST'}
        });
    })
    .factory('SingleOrderApi', function($resource){
        return $resource('http://ionicapp.orderingco.com/ionicapp/singleorder.php',{
            id:'@orderID'
        },{
            charge: {method:'POST'}
        });
    })
    .factory('PushUserApi', function($resource){
        return $resource('http://ionicapp.orderingco.com/ionicapp/gcm_user.php',{
            user_id : '@userID',
            device_id : '@deviceID',
            kind : '@deviceKind'
        },{
            charge: {method:'POST'}
        });
    })
    .factory('PushStateApi', function($resource){
        return $resource('http://ionicapp.orderingco.com/ionicapp/gcm_push_setting.php',{
            user_id : '@userID',
            login_status : '@loginStatus'
        },{
            charge: {method:'POST'}
        });
    })
    .factory('ionicReady', function($ionicPlatform) {
        var readyPromise;

        return function () {
            if (!readyPromise) {
                readyPromise = $ionicPlatform.ready();
            }
            return readyPromise;
        };
    })
    // GeoCoding with Geolocation and GoogleMaps
    .factory('GeolocationSvc', [
        '$q', '$window',
        function($q, $window) {
            return function() {
                var deferred = $q.defer();

                if(!$window.navigator) {
                    deferred.reject(new Error('Geolocation is not supported'));
                } else {
                    var positionOptions = {timeout: 15000, enableHighAccuracy: true};
                    $window.navigator.geolocation.getCurrentPosition(function(position) {
                        deferred.resolve({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        });
                        /*deferred.resolve({
                            lat: 38.019968,
                            lng: 114.332657
                        });*/
                       // console.log('Lat : ' + position.coords.latitude+ "__"+'Lng : '+position.coords.longitude);
                    }, deferred.reject, positionOptions);
                }

                return deferred.promise;
            };
        }])

    .factory('AddressLookupSvc', [
        '$q', '$http', 'GeolocationSvc',
        function($q, $http, GeolocationSvc) {
            var MAPS_ENDPOINT = 'https://maps.google.com/maps/api/geocode/json?latlng={POSITION}&sensor=false';

            return {
                urlForLatLng: function(lat, lng) {
                    return MAPS_ENDPOINT.replace('{POSITION}', lat + ',' + lng);
                },

                lookupByLatLng: function(lat, lng) {
                    var deferred = $q.defer();
                    var url = this.urlForLatLng(lat, lng);

                    $http.get(url).success(function(response) {
                        // hacky
                        var zipCode;
                        angular.forEach(response.results, function(result) {
                            if(result.types[0] === 'postal_code') {
                                zipCode = result.address_components[0].short_name;
                            }
                        });
                        deferred.resolve(zipCode);
                    }).error(deferred.reject);

                    return deferred.promise;
                },

                lookupByAddress: function(lat, lng) {
                    var deferred = $q.defer();
                    var url = this.urlForLatLng(lat, lng);
                    $http.get(url).success(function(response) {
                        // hacky
                        var address; 
                        var state = false;
                        angular.forEach(response.results, function(result) {
                            if (state == false){
                                if (result.types[0] === 'street_address'){
                                address = result.formatted_address;
                                    state = true;
                            }else if (result.types[0] === 'locality'){
                                address = result.formatted_address;
                                    state = true;
                                }else if (result.types[0] === 'postal_code'){
                                address = result.formatted_address;
                                    state = true;
                                }    
                            }
                        });
                        deferred.resolve(address);                        
                    }).error(deferred.reject);

                    return deferred.promise;
                },

                lookup: function() {
                    var deferred = $q.defer();
                    var self = this;

                    GeolocationSvc().then(function(position) {
                        //deferred.resolve(self.lookupByLatLng(position.lat, position.lng));
                        deferred.resolve({
                            address : self.lookupByAddress(position.lat, position.lng),
                            location : position
                        });
                    }, deferred.reject);

                    return deferred.promise;
                }
            };
        }
    ])
    .factory('PaypalService', ['$q', '$ionicPlatform', 'shopSettings', '$filter', '$timeout', function ($q, $ionicPlatform, shopSettings, $filter, $timeout) {
        var init_defer;
        /**
         * Service object
         * @type object
         */
        var service = {
            initPaymentUI: initPaymentUI,
            createPayment: createPayment,
            configuration: configuration,
            onPayPalMobileInit: onPayPalMobileInit,
            makePayment: makePayment
        };
        /**
         * @ngdoc method
         * @name initPaymentUI
         * @methodOf app.PaypalService
         * @description
         * Inits the payapl ui with certain envs.
         *
         *
         * @returns {object} Promise paypal ui init done
         */
        function initPaymentUI() {
            init_defer = $q.defer();
            $ionicPlatform.ready().then(function () {
                var clientIDs = {
                    "PayPalEnvironmentProduction": shopSettings.payPalProductionId,
                    "PayPalEnvironmentSandbox": shopSettings.payPalSandboxId
                };
                PayPalMobile.init(clientIDs, onPayPalMobileInit);
            });
            return init_defer.promise;
        }
        /**
         * @ngdoc method
         * @name createPayment
         * @methodOf app.PaypalService
         * @param {string|number} total total sum. Pattern 12.23
         * @param {string} name name of the item in paypal
         * @description
         * Creates a paypal payment object
         *
         *
         * @returns {object} PayPalPaymentObject
         */
        function createPayment(total, name) {
            // "Sale == > immediate payment
            // "Auth" for payment authorization only, to be captured separately at a later time.
            // "Order" for taking an order, with authorization and capture to be done separately at a later time.
            var payment = new PayPalPayment("" + total, "USD", "" + name, "Sale");
            return payment;
        }
        /**
         * @ngdoc method
         * @name configuration
         * @methodOf app.PaypalService
         * @description
         * Helper to create a paypal configuration object
         *
         *
         * @returns {object} PayPal configuration
         */
        function configuration() {
            // for more options see `paypal-mobile-js-helper.js`
            var config = new PayPalConfiguration({merchantName: shopSettings.payPalShopName, merchantPrivacyPolicyURL: shopSettings.payPalMerchantPrivacyPolicyURL, merchantUserAgreementURL: shopSettings.payPalMerchantUserAgreementURL});
            return config;
        }
        function onPayPalMobileInit() {
            $ionicPlatform.ready().then(function () {
                // must be called
                // use PayPalEnvironmentNoNetwork mode to get look and feel of the flow
                PayPalMobile.prepareToRender(shopSettings.payPalEnv, configuration(), function () {
                    $timeout(function () {
                        init_defer.resolve();
                    });
                });
            });
        }
        /**
         * @ngdoc method
         * @name makePayment
         * @methodOf app.PaypalService
         * @param {string|number} total total sum. Pattern 12.23
         * @param {string} name name of the item in paypal
         * @description
         * Performs a paypal single payment
         *
         *
         * @returns {object} Promise gets resolved on successful payment, rejected on error
         */
        function makePayment(total, name) {
            var defer = $q.defer();
            total = $filter('number')(total, 2);
            $ionicPlatform.ready().then(function () {
                PayPalMobile.renderSinglePaymentUI(createPayment(total, name), function (result) {
                    $timeout(function () {
                        defer.resolve(result);
                    });
                }, function (error) {
                    $timeout(function () {
                        defer.reject(error);
                    });
                });
            });
            return defer.promise;
        }
        return service;
    }]);
