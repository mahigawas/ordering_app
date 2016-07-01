/**
 * Created by STORM on 2/8/2016.
 */
angular.module('orderingApp.services',[])

    //From Home to Near Resturant
    .service('gNearService', function() {
        var gNearService = this;
        gNearService.sharedObject = {};

        gNearService.getData = function(){
            return gNearService.sharedObject;
        };

        gNearService.setData = function(value){
            gNearService.sharedObject = value;
        }
    })

    .service('gMyLatLng',function(){

        var latlngData = {};
        this.setData = function(obj) {
            latlngData = obj;
        };
        this.getData = function() {
            return latlngData;
        };
    })

    .service('gUserData',function(){

        var userData = {};
        this.setData = function(obj) {
            userData = obj;
        };
        this.getData = function() {
            return userData;
        };
    })

    // Object Array of All Business -------------------------
    .service('gAllBusiness',function(){

        var businessData = {};
        this.setData = function(obj) {
            businessData = obj;
        };
        this.getData = function() {
            return businessData;
        };
    })

    //From restaurant searchList to item
    .service('gCurRestaurant', function() {
        var gCurRestaurant = this;
        gCurRestaurant.sharedObject = {};

        gCurRestaurant.getData = function(){
            return gCurRestaurant.sharedObject;
        };

        gCurRestaurant.setData = function(value){
            gCurRestaurant.sharedObject = value;
        }
    })

    .service('gCurDishList', function() {
        var gCurDishList = this;
        gCurDishList.sharedObject = {};

        gCurDishList.getData = function(){
            return gCurDishList.sharedObject;
        };

        gCurDishList.setData = function(value){
            gCurDishList.sharedObject = value;
        }
    })

    .service('gDeliveryComment', function(){
        var gComment = this;
        gComment.sharedObject = {};

        gComment.getData = function(){
            return gComment.sharedObject;
        };

        gComment.setData = function(value){
            gComment.sharedObject = value;
        }
    })

    .service('gOrder',function(){
        var gOrder = [];
        this.setData = function(obj) {
            gOrder = obj;
        };
        this.getData = function() {
            return gOrder;
        };
    })

    .service('gBusinessData',function(){
        var gBusinessData = {};
        this.setData = function(obj) {
            gBusinessData = obj;
        };
        this.getData = function() {
            return gBusinessData;
        };
    })
    .service('gSingleOrderData',function(){
        var gSingleOrderData = {};
        this.setData = function(obj) {
            gSingleOrderData = obj;
        };
        this.getData = function() {
            return gSingleOrderData;
        };
    })
    .service('gStates',function(){
        var gState = {};
        this.setState = function(obj) {
            gState = obj;
        };
        this.getState = function() {
            return gState;
        };
    });