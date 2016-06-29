/**
 * Created by STORM on 2/8/2016.
 */

app = angular.module('orderingApp', ['ionic','orderingApp.controllers','orderingApp.services','orderingApp.factories','jett.ionic.filter.bar','ngOpenFB', 'pascalprecht.translate', 'ui.select', 'ngSanitize', 'ionic-modal-select'])

    .run(function($ionicPlatform, $ionicPopup, gStates, ngFB, $rootScope, $ionicModal, $state, $ionicHistory) {
        $ionicPlatform.ready(function() {
            $rootScope.lang = localStorage.getItem('language') || 'ar'

            // alert(typeof($rootScope.user_id))
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
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
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


        $ionicPlatform.registerBackButtonAction(function (event) {
            if ($ionicHistory.currentStateName() != 'sideMenu.homeScreen'){
                //event.preventDefault();
                var currState = $ionicHistory.currentStateName();
                  switch(currState) {
                      case "ordering.checkOut":
                      case "finalCheckOut":
                      break;
                      default:
                      $ionicHistory.backView();
                  }
            } else{
                navigator.app.exitApp()
            }
        }, 100);

    })


    .config(function($stateProvider, $urlRouterProvider, $translateProvider, $resourceProvider) {

        $stateProvider
            .state('sideMenu',{
                cache: false,
                url : '/side-menu',
                templateUrl : 'templates/side-menu.html',
                controller : 'sideMenuCtrl'
            })
            .state('sideMenu.homeScreen',{
                cache: false,
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
            .state('sideMenu.languageSetting',{
                url: '/language-settings',
                views: {
                    'mainContainer':{
                        templateUrl: 'templates/language-settings.html',
                        controller: 'languageSetting'
                    }
                }
            })
            .state('sideMenu.aboutUs',{
                url: '/about-us',
                views: {
                    'mainContainer':{
                        templateUrl: 'templates/about-us.html',
                        controller: 'sideMenuCtrl'
                    }
                }
            })
            .state('sideMenu.ourRestaurants',{
                url: '/our-restaurants',
                views: {
                    'mainContainer':{
                        templateUrl: 'templates/our-restaurants.html',
                        controller: 'sideMenuCtrl'
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

            .state('nextStep', {
                url: '/signUpCode',
                params:{name: '', mobile_number: ''},
                templateUrl: 'templates/sign-up-code.html',
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

        $translateProvider.translations('en', {
            'Address or Zip Code': 'Address or Zip Code',
            'Use my current location': 'Use my current location',
            'FIND RESTAURANTS': 'FIND RESTAURANTS',
            'Language Settings': 'Language Settings',
            'English': 'English',
            'Arabic': 'عربي',
            'Kurdish': 'كوردي',
            'Edit Account': 'Edit Account',
            'Full Name': 'Full Name',
            'Email': 'Email',
            'Password': 'Password',
            'Full Address': 'Full Address',
            'Mobile Phone': 'Mobile Phone',
            'UPDATE': 'UPDATE',
            'Settings': 'Settings',
            'Notifications': 'Notifications',
            'Push Notifications': 'Push Notifications',
            '*Login Required': '*Login Required',
            'Address Book': 'Address Book',
            'Status': 'Status',
            'Notes': 'Notes',
            'Mobile Phone': 'Mobile Phone',
            'Business Phone': 'Business Phone',
            'Payment Method': 'Payment Method',
            'Delivery type': 'Delivery type',
            'Delivery Date': 'Delivery Date',
            'Tax': 'Tax',
            'Delivery Fee': 'Delivery Fee',
            'Service Fee': 'Service Fee',
            'Driver Tip': 'Driver Tip',
            'Total': 'Total',
            'My Orders': 'My Orders',
            'Date': 'Date',
            'Business': 'Business',
            'View more': 'View more',
            'Connection Lost': 'Connection Lost',
            'Tap to retry': 'Tap to retry',
            'to': 'to',
            'Checkout': 'Checkout',
            'Delivery Address': 'Delivery Address',
            'Please input correct Information(*)': 'Please input correct Information(*)',
            'Mobile Phone Number': 'Mobile Phone Number',
            'Order Details': 'Order Details',
            'Cancel': 'Cancel',
            'ORDER NOW': 'ORDER NOW',
            'MIN ORDER': 'MIN ORDER',
            'You are awesome!': 'You are awesome!',
            'Your order': 'Your order',
            'was placed successfully': 'was placed successfully',
            'Turn on your app push notifications.': 'Turn on your app push notifications.',
            'You will get order status changes.': 'You will get order status changes.',
            'status change' : 'status change',
            'Ok, go back to homepage': 'Ok, go back to homepage',
            'Please choose your': 'Please choose your',
            'Special Instructions': 'Special Instructions',
            'Add': 'Add',
            'View Order': 'View Order',
            'Restaurant Search': 'Restaurant Search',
            'Restaurants near': 'Restaurants near',
            'Minimum order': 'Minimum order',
            'Promotion:': 'Promotion:',
            'Distance:': 'Distance:',
            'Delivery fee:': 'Delivery fee:',
            'Payment Select': 'Payment Select',
            'Please choose your Payment method (Required)': 'Please choose your Payment method (Required)',
            'ACCEPT': 'ACCEPT',
            'Update on your order': 'Update on your order',
            'Sign In': 'Sign In',
            'First Name': 'First Name',
            'Last Name': 'Last Name',
            'Last Name2': 'Last Name2',
            'Address': 'Address',
            'Colony': 'Colony',
            'Zip': 'Zip',
            'Country': 'Country',
            'City': 'City',
            'Tel': 'Tel',
            'Cel': 'Cel',
            'API': 'API',
            'Path of Profile Image': 'Path of Profile Image',
            'CONTINUE AS GUEST': 'CONTINUE AS GUEST',
            'LOGIN WITH FACEBOOK': 'LOGIN WITH FACEBOOK',
            'Start Order': 'Start Order',
            'My Profile': 'My Profile',
            'My Orders': 'My Orders',
            'Logout': 'Logout',
            'Sign In': 'Sign In',
            'Hi': 'Hi',
            'Please enter your registration code': 'Please enter your registration code',
            'Registration Code': 'Registration Code',
            'Sign Up': 'Sign Up',
            'Next': 'Next',
            'Mobile Number': 'Mobile Number',
            'Name': 'Name',
            'ACCEPT': 'ACCEPT',
            'Searching...': 'Searching...',
            'Please Enter your Full Address or ZipCode': 'lease Enter your Full Address or ZipCode',
            'Geocode was not successful for the following reason:': 'Geocode was not successful for the following reason:',
            'SearchFailed! Can not find near Restaurants!': 'SearchFailed! Can not find near Restaurants!',
            'Location not found': 'Location not found',
            'Getting Location Error!': 'Getting Location Error!',
            'ERROR!': 'ERROR!',
            'OrderingApp': 'OrderingApp',
            'get location error': 'get location error',
            'User Profile updated!': 'User Profile updated!',
            'Already you have never been ordered!. Please...!': 'Already you have never been ordered!. Please...!',
            'Getting Failed!': 'Getting Failed!',
            'Do you want to cancel current order?': 'Do you want to cancel current order?',
            'Please Select Required Options': 'Please Select Required Options',
            'Your Cart is Empty!': 'Your Cart is Empty!',
            'Are you cancel current order?': 'Are you cancel current order?',
            'Failed with Getting User Data. Try again?': 'Failed with Getting User Data. Try again?',
            'Are you cancel your Order!': 'Are you cancel your Order!',
            'Please Fill Required Fields!': 'Please Fill Required Fields!',
            'Invalid user data. Please try again': 'Invalid user data. Please try again',
            'Please Fill Required Fields!': 'Please Fill Required Fields!',
            'Please Enter only numbers': 'Please Enter only numbers',
            'Register Failed! please try again later.': 'Register Failed! please try again later.',
            'Facebook login failed': 'Facebook login failed',
            'Please select': 'Please select',
            'Transaction Canceled': 'Transaction Canceled',
            'Please select Payment Method!': 'Please select Payment Method!',
            'Please Select your Payment Method': 'Please Select your Payment Method',
            'Failed Place Order!!': 'Failed Place Order!!',
            'image could not be loaded': 'image could not be loaded',
            'Please enter correct mobile number': 'Please enter correct mobile number',
            'OK': 'OK',
            'IQD': 'IQD',
            'Add any special instructions': 'Add any special instructions',
            'Select your Area' : 'Select Your Area',
            'Rating': 'Rating',
            'Facebook': 'Facebook',
            'Youtube': 'Youtube',
            'Our Restaurants': 'Our Restaurants',
            'About Us': 'About Us',
            'Select Your City': 'Select Your City',
            'Order Summary': 'Order Summary',
            'Subtotal': 'Subtotal',
            'PLACE ORDER': 'PLACE ORDER',
            'You will logout from app, are you sure ?': 'You will logout from app, are you sure ?',
            'Please confirm your name and mobile number': 'Please confirm your name and mobile number',
            'Thanks': 'Thanks',
            'your registration is done successfully': 'your registration is done successfully',
            'Order No': 'Order No',
            'Back to main menu': 'Back to main menu',
            'Please Select your Area' : 'Please Select your Area',
            'Please Select your City' :'Please Select your City',
            'Delivery time is 60 min' : 'Delivery time is 60 min',
            'Open & Close time' : 'Open & Close time',
            'back resturnat' : 'Back Resturnat',
            'back categories' : 'Back Categories',
            'back to dishes' : 'Back To Dishes',
            'Back' : 'Back',
            'Home' : 'Home',
            'cancel order' : 'cancel order'

        });

        $translateProvider.translations('ar', {
            'Address or Zip Code': '',
            'Use my current location' : 'استخدام موقعي الحالي',
            'FIND RESTAURANTS': 'العثور على المطاعم',
            'Language Settings': 'اختيار اللغة',
            'English': 'English',
            'Arabic': 'عربي',
            'Kurdish': 'كوردي',
            'Edit Account': 'تعديل المعلومات',
            'Full Name': 'الاسم الكامل',
            'Email': 'البريد الإلكتروني',
            'Password': 'كلمه السر',
            'Full Address': 'العنوان الكامل',
            'Mobile Phone': 'الموبايل',
            'UPDATE': 'تحديث',
            'Settings': 'إعدادات',
            'Notifications': 'الإشعارات',
            'Push Notifications': 'ارسال الاشعارات',
            '*Login Required': 'تسجيل الدخول مطلوب * ',
            'Address Book': 'العناويين',
            'Status' : 'الحالة',
            'Notes': 'الملاحظات',
            'Mobile Phone': 'الموبايل',
            'Business Phone': 'هاتف العمل',
            'Payment Method': 'طريقة الدفع',
            'Delivery type': 'نوع التوصيل',
            'Delivery Date': 'تاريخ التوصيل',
            'Tax': 'الضريبة',
            'Delivery Fee': 'رسوم التوصيل',
            'Service Fee': 'رسوم الخدمة',
            'Driver Tip': 'البغشيش',
            'Total': 'المجموع',
            'My Orders': 'طلباتي',
            'Date': 'التاريخ',
            'Business': 'المطاعم',
            'View more': 'عرض المزيد',
            'Connection Lost': 'انقطع الاتصال',
            'Tap to retry': 'إضغط لإعادة المحاولة',
            'Checkout': 'الدفع',
            'Delivery Address': 'عنوان التوصيل',
            'Please input correct Information(*)': 'الرجاء إدخال المعلومات الصحيحة (*)',
            'Mobile Phone Number': 'الموبايل',
            'Order Details': 'تفاصيل الطلب',
            'Cancel': 'إلغاء',
            'ORDER NOW': 'اطلب الان',
            'MIN ORDER': 'الحد الأدنى للطلب',
            'You are awesome!': 'عاشت ايدك ',
            'Your order': 'طلبك',
            'was placed successfully': 'العملية تمت بنجاح',
            'Turn on your app push notifications.': 'تفعيل الاشعارت',
            'You will get order status changes.': 'ستصلك حالة الطلب',
            'status change': 'تغيير حالة الطلب',
            'Ok, go back to homepage': 'الرجاء العودة الى الصفحة الرئيسية',
            'Please choose your': 'الرجاء اختيار',
            'Special Instructions': 'تعليمات خاصة',
            'Add': 'إضافة',
            'View Order': 'عرض تفاصيل الطلب',
            'Restaurant Search': 'البحث عن المطاعم',
            'Restaurants near': 'المطاعم القريبة من',
            'Minimum order': 'الحد الادني للطلب',
            'Promotion:': 'العروض',
            'Distance:': 'المسافات:',
            'Delivery fee:': 'كلفة التوصيل',
            'Payment Select': 'اختر طريقة الدفع',
            'Please choose your Payment method (Required)': 'يرجى اختيار طريقة الدفع (مطلوب)',
            'ACCEPT': 'قبول',
            'Update on your order': 'عدل طلبك',
            'Sign In': 'تسجيل الدخول',
            'First Name': 'الاسم الاول',
            'to': 'إلى',
            'Last Name': 'اللقب',
            'Last Name2': 'اللقب',
            'Address': 'العنوان',
            'Colony': 'المنطقة',
            'Zip': 'الرمز البريدي',
            'Country': 'البلد',
            'City': 'مدينة',
            'Tel': 'الهاتف',
            'Cel': 'الموبايل',
            'API': 'واجهة تطبيق البرنامج',
            'Path of Profile Image': 'مسار الملف صورة',
            'CONTINUE AS GUEST': 'المتابعة كضيف',
            'LOGIN WITH FACEBOOK': 'تسجيل الدخول باستخدام الفيسبوك',
            'Start Order': 'ابدأ طلبك',
            'My Profile': 'معلوماتي',
            'My Orders': 'طلباتي',
            'Logout': 'تسجيل الخروج',
            'Sign Up': 'سجل',
            'Hi': 'اهلا وسهلا ب',
            'Please enter your registration code': 'الرجاء ادخال رمز التسجيل الذي سيصلك برسالة نصية عل هاتفك',
            'Registration Code': 'رمز التسجيل',
            'SIGN UP': 'سجل',
            'Next': 'التالى',
            'Mobile Number': 'رقم الهاتف المحمول',
            'Name': 'الاسم',
            'Searching...': 'البحث مستمر',
            'Please Enter your Full Address or ZipCode': 'الرجاء ادخال العنوان الكامل ',
            'Geocode was not successful for the following reason:': 'رمز المكان لم ينجح للأسباب التالية:',
            'SearchFailed! Can not find near Restaurants!': 'عذرا لاتوجد مطاعم قريبة منك',
            'Location not found': 'المكان غير موجود ',
            'Getting Location Error!': 'يوجد خطآ بالمكان ',
            'ERROR!': 'خطآ!',
            'OrderingApp': 'تطبيق طلباتي ',
            'get location error': 'يوجد خطآ بالمكان ',
            'User Profile updated!': 'تم تحديت معلومات المستخدم',
            'Already you have never been ordered!. Please...!': 'لم تطلب مسبقا ',
            'Getting Failed!': 'هناك مشكله ',
            'Do you want to cancel current order?': 'هل تريد الغاء الطلب الحالي ',
            'Please Select Required Options': 'الرجاء اختار الأشياء المطلوبة',
            'Your Cart is Empty!': 'رصيدك لايكفي ',
            'Are you cancel current order?': 'هل انت متاكد من الغاء الطلب الحالي ',
            'Failed with Getting User Data. Try again?': 'فشل في استحصال المعلومات، الرجاء المجاولة مره أخرى',
            'Are you cancel your Order!': 'هل انت متاكد من الغاء الطلب الحالي ',
            'Please Fill Required Fields!': 'الرجاء ملء جميع الحقول ',
            'Invalid user data. Please try again': 'المعلومات غير صحيحة، الرجاء المحاولة مرة أخرى',
            'Please Fill Required Fields!': 'الرجاء ملء جميع الحقول ',
            'Please Enter only numbers': 'الرجاء ادخال ارقام فقط',
            'Register Failed! please try again later.': 'لم يتم التسجسل، الرجاء المحاولة مرة أخرى',
            'Facebook login failed': 'لم يتم تسجبل الفيسبوك، الرجاء المحاولة مرة أخرى',
            'Please select': 'الرجاء اختار الأشياء المطلوبة',
            'Transaction Canceled': 'الغيت العملية ',
            'Please select Payment Method!': 'الرجاء اخيار طريقة الدفع',
            'Please Select your Payment Method': 'الرجاء اخيار طريقة الدفع',
            'Failed Place Order!!': 'لم يتم اختيار مكان الطلب ',
            'image could not be loaded': 'الصور لم تحمل',
            'Please enter correct mobile number': 'الرجاء ادخال رقم الموبايل بشكل صحيح',
            'OK': 'اوكي',
            'IQD': 'د.ع.',
            'Add any special instructions': 'إضافة أي تعليمات خاصة',
            'Select your Area': 'اختر منطقتك التي انت فيها الان',
            'Rating': 'تصنيف',
            'Facebook': 'فيسبوك',
            'Youtube': 'يوتيوب',
            'Our Restaurants': 'مطاعمنا',
            'About Us': 'عن طلباتي',
            'Select Your City': 'اختر مدينتك',
            'Order Summary': 'ملخص الطلب',
            'Subtotal':  'المجموع الكلي',
            'PLACE ORDER':  'تاكيد الطلب',
            'You will logout from app, are you sure ?': 'سوف تخرج من البرنامج، هل انت متاكد ؟',
            'Please confirm your name and mobile number': 'الرجاء التاكد من الاسم ورقم الموبايل',
            'Thanks': 'شكرا',
            'your registration is done successfully': 'لقد تم اشتراكك بنجاح',
            'Order No': 'أجل لا',
            'Back to main menu': 'العودة للقائمة الرئيسية',
            'Please Select your Area' : 'الرجاء اختيار منطقتك',
            'Please Select your City' : 'الرجاء اختيار منطقتك',
            'Delivery time is 60 min' : 'وقت التوصيل ٦٠ دقيقة',
            'Open & Close time' : 'وقت الفتح والاغلاق',
            'back resturnat' : 'العودة للمطاعم',
            'back categories' : 'العودة للاصناف',
            'back to dishes' : 'العودة للاطباق',
            'Back' : 'الرجوع',
            'Home' : 'آلرئيسية',
            'cancel order' : 'الغاء الطلب'
        });

        $translateProvider.translations('kr', {
            'Address or Zip Code': '',
            'Use my current location' : 'شويني ئيستا به كار بهينه',
            'FIND RESTAURANTS': 'جيشتخانه يه ك دياري بكه',
            'Language Settings': 'دانانەوەى زمان',
            'English': 'English',
            'Arabic': 'عربي',
            'Kurdish': 'كوردي',
            'Edit Account': 'حيساب پاكنووس بكە',
            'Full Name': 'ناوي ته واو',
            'Email': 'ئەمێيل',
            'Password': 'وشەى نهێنى',
            'Full Address': 'ناونيشاني ته واو',
            'Mobile Phone': 'تەلەفۆنى مۆبايل',
            'UPDATE': 'نوێ بكەوە',
            'Settings': 'دانانەوە',
            'Notifications': 'ورياكردنەوە',
            'Push Notifications': 'ناردني ورياكردنەوە',
            '*Login Required': 'داخل بوون پێويسته',
            'Address Book': 'كتێبى ناونيشان',
            'Status' : 'حالەت',
            'Notes': 'تێبينى',
            'Mobile Phone': 'تێبينى',
            'Business Phone': 'تەلەفۆنى بازرگانى',
            'Payment Method': 'ڕێگەى پارەدان',
            'Delivery type': 'جۆرى گەياندن',
            'Delivery Date': 'بەروارى گەياندن',
            'Tax': 'باج',
            'Delivery Fee': 'كرێى گەياندن',
            'Service Fee': 'كرێى خزمەتگوزارى',
            'Driver Tip': 'سەرەنوكى شوفێر',
            'Total': 'سەرجەم',
            'My Orders': 'فەرمانەكانى من',
            'Date': 'بەروار',
            'Business': 'بازرگانى',
            'View more': 'بازرگانى',
            'Connection Lost': 'پەيوەندى بزر بوو',
            'Tap to retry': 'لێدان تا هه ول بده يته وه',
            'Checkout': 'پشكنين',
            'Delivery Address': 'ئەدرێسي گەياندن',
            'Please input correct Information(*)': 'تكايە زانياريى ڕاست بخەرە ناو',
            'Mobile Phone Number': 'ژمارەى تەلەفۆن',
            'Order Details': 'وردەكاريى فەرمان',
            'Cancel': 'هەڵ بوەشێنوە',
            'ORDER NOW': 'ئێستا فه رمان بكه',
            'MIN ORDER': 'لكەمترين فەرمان',
            'You are awesome!': 'تۆ سامناكيت!',
            'Your order': 'فەرمانت',
            'was placed successfully': 'بە سەركەوتووى دا نێرا',
            'Turn on your app push notifications.': 'داكيرساندني ورياكردنەوە',
            'You will get order status changes.': 'تۆ فەرمان گۆڕانى حالەت دەست دەكەو',
            'status change': '',
            'Ok, go back to homepage': 'باشە، بگەڕێوە بۆ سه ره تا',
            'Please choose your': 'تكايەت هەڵ ببژێرە',
            'Special Instructions': 'ڕێنماييى تايبەتى',
            'Add': 'زياد بكەە',
            'View Order': 'ڕوانيني فەرمان',
            'Restaurant Search': 'بەدواگەڕانى چێشتخانە',
            'Restaurants near': 'چێشتخانە نزيك',
            'Minimum order': 'لكەمترين فەرمان',
            'Promotion:': 'بەرەو پێشبردن',
            'Distance:': 'مەودا',
            'Delivery fee:': 'كرێى گەياندن',
            'Payment Select': 'پارەدان هەڵ دەبژێرێت',
            'Please choose your Payment method (Required)': 'تكايەت ڕێگەى پارەدان هەڵ ببژێرە ( پێويسته)',
            'ACCEPT': 'قبووڵ بكە',
            'Update on your order': 'نوێ بكەوە لەسەر فەرمانت',
            'Your order':'فەرمانت',
            'Sign In': 'داخل بوون',
            'First Name': 'يەكەم ناو',
            'to': 'إلى',
            'Last Name': 'ناوى دوايين',
            'Last Name2': 'ناوي باوك',
            'Address': 'ناونيشان',
            'Colony': 'ناوجه',
            'Zip': 'زنجيره',
            'Country': 'وڵات',
            'City': 'شار',
            'Tel': 'تةلةفؤن',
            'Cel': 'موبايل',
            'API': 'داوا كردني بەرنامە دا ناني واجيهە',
            'Path of Profile Image': 'ڕێچكەى وێنەى پرۆفايل',
            'CONTINUE AS GUEST': 'بەردەوام ببە هەروەك ميوان',
            'LOGIN WITH FACEBOOK': 'چوونە ژوورەوە به فەيسبوك',
            'Start Order': 'فەرمان دەست پێ بكە',
            'My Profile': 'فەرمانەكانى من',
            'My Orders': 'دانانەوە',
            'Logout': 'دانانەوەى زمان',
            'Sign Up': 'چوونە ژوورەوە ',
            'Hi': 'سڵاو',
            'Please enter your registration code': 'تكايە كۆدى تۆماركردن بنوسه',
            'Registration Code': 'كۆدى تۆماركردن',
            'SIGN UP': 'دروستكردن',
            'Next': 'داهاتوو',
            'Select your city ': 'شارت هەڵ ببژێرە',
            'Select your area ': 'ڕووبەرت هەڵ ببژێرە',
            'Mobile Number': 'موبايل',
            'Rating':'هەڵ سەنگاندن',
            'Name': 'ناو',
            'Searching...': 'بەدوا گەڕان...',
            'Please Enter your Full Address or ZipCode': 'تكايەت پڕ ئەدرێس بچەيە ناو يان كۆدى پۆستە',
            'Geocode was not successful for the following reason:': 'كۆدى پێشگري زەوى سەركەوتوو نەبوو بۆ به هۆى',
            'SearchFailed! Can not find near Restaurants!': 'بەدواگەڕان نشستيى هێنا! ناتواني نزيكترين چێشتخانە بدوزيته وه',
            'Location not found': 'شوێن نەدۆزييەوە',
            'Getting Location Error!': 'هەڵەى دەست كەوتني شوێن!',
            'ERROR!': 'هەڵە!',
            'OrderingApp': 'بەرنامە داواكردن',
            'get location error': 'شوێن نەدۆزييەوە',
            'User Profile updated!': 'پرۆفايلى بەكاربەر نوێى كردەوە!',
            'Already you have never been ordered!. Please...!': 'تۆ هەرگيز فەرمانت نەكردبوو!. تكايە...!',
            'Getting Failed!': 'دەست كەوتن نشستيى هێنا!',
            'Do you want to cancel current order?': 'دەتەوێت تا فەرمانى هەنووكە هەڵ بوەشێننەوە؟',
            'Please Select Required Options': 'تكايە هەڵ ببژێرە بژاردە پێويست ببوو',
            'Your Cart is Empty!': 'كارتت به تاله',
            'Are you cancel current order?': 'تۆ دڵنيا تا فەرمانى هەنووكە هەڵ بوەشێنيتەوە؟',
            'Failed with Getting User Data. Try again?': 'تۆ دڵنيا تا فەرمانى هەنووكە هەڵ بوەشێنيتەوە؟',
            'Are you cancel your Order!': 'تۆ دڵنيا تا فەرمانى هەنووكە هەڵ بوەشێنيتەوە؟',
            'Please Fill Required Fields!': 'تكايە شويني پێويست پڕ بكە',
            'Invalid user data. Please try again': 'زانياريى بەكاربەر ناڕاسته. تكايە دووبارە هەوڵ بدە',
            'Please Fill Required Fields!': 'تكايە شويني پێويست پڕ بكە',
            'Please Enter only numbers': 'تكايە تەنها ژمارە داخل بكه',
            'Register Failed! please try again later.': 'تۆمار نشستيى هێنا! تكايە دووبارە پاشان هەوڵ بدەيە.',
            'Facebook login failed': 'چوونە ژوورەوەى فەيسبوك نشستيى هێنا',
            'Please select': 'تكايە هەڵ ببژێرە',
            'Transaction Canceled': 'سەودا  هه لوه شايه وه',
            'Please select Payment Method!': 'تكايە ڕێگەى پارەدان هەڵ ببژێرە!',
            'Please Select your Payment Method': 'تكايە ڕێگەى پارەدان هەڵ ببژێرە!',
            'Failed Place Order!!': 'فەرمانى شوێن نشستيى هێنا!!',
            'image could not be loaded': 'وێنە ناتوانێت بار نابكرێت',
            'Please enter correct mobile number': 'وێنە ناتوانێت بار نابكرێت',
            'OK': 'اوكي',
            'IQD': 'د.ع.',
            'Add any special instructions':'هەرێك ڕێنماييى تايبەتى زياد بكەە',
            'Select your Area': 'ڕووبەرت هەڵ ببژێرە',
            'Rating': 'هەڵ سەنگاندن',
            'Facebook': 'فيسبوك',
            'Youtube': 'يوتيوب',
            'Our Restaurants': 'چێشتخانەەكانمان',
            'About Us': 'عن طلباتي',
            'Select Your City':'شارت هەڵ ببژێرە',
            'Order Summary':'پوختەى فەرمان',
            'Subtotal': 'سەرجەم',
            'PLACE ORDER': 'بكەە فەرمان بكات',
            'You will logout from app, are you sure ?': 'تۆ ويل [لۆگۆوت] لە بەرنامەەوە، ببە تۆ دڵنيا',
            'Please confirm your name and mobile number': 'تكايە ناوت و ژمارەى مۆبايل تەئكيد بكەوە',
            'Thanks': 'تكايە چاوەڕوان بە',
            'your registration is done successfully': 'لقد تم اشتراكك بنجاح',
            'Order No': 'رقم الطلب',
            'Back to main menu': 'العودة للقائمة الرئيسية',
            'Please Select your Area' : 'الرجاء اختيار منطقتك التي انت فيها',
            'Please Select your City' : 'مدينتك اختيار منطقتك',
            'Delivery time is 60 min' : 'وقت التوصيل ٦٠ دقيقة',
            'Open & Close time' : 'وقت الفتح والاغلاق',
            'back resturnat' : 'العودة للمطاعم',
            'back categories' : 'العودة للاصناف',
            'back to dishes' : 'العودة للاطباق',
            'Back' : 'الرجوع',
            'Home' : 'آلرئيسية',
            'cancel order' : 'الغاء الطلب'
        });
        $translateProvider.preferredLanguage(localStorage.getItem("language") || 'ar');
        $translateProvider.useSanitizeValueStrategy(null)
        $resourceProvider.defaults.stripTrailingSlashes = false;
    })


    .constant('shopSettings',{

        payPalSandboxId :'Aar8HZzvc5NztVWodTBpOiOod9wWrBDrJUjyvRr4WsxcCD28xYig7oecfYsqxQUDu5QHptPpSALirxZD',

        payPalProductionId : 'production id here',

        payPalEnv: 'PayPalEnvironmentSandbox', // for testing production for production

        payPalShopName : 'OrderingCo.Shop',

        payPalMerchantPrivacyPolicyURL : 'url to policy',

        payPalMerchantUserAgreementURL : 'url to user agreement'

    })

    .constant('langSettings',{
        'en': 1,
        'ar': 19,
        'kr': 29
    });



