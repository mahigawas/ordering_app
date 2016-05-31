/**
 * Created by STORM on 2/8/2016.
 */

app = angular.module('orderingApp', ['ionic','orderingApp.controllers','orderingApp.services','orderingApp.factories','jett.ionic.filter.bar','ngOpenFB', 'pascalprecht.translate'])

    .run(function($ionicPlatform, $ionicPopup, gStates, ngFB, $rootScope, $ionicModal, $state) {
        $ionicPlatform.ready(function() {
            $rootScope.lang = localStorage.getItem('language') || 'arabic'
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
            'Arabic': 'Arabic',
            'Kurdish': 'Kurdish',
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
            'Select your Area' : 'Select your Area',
            'Rating': 'Rating'

        });

        $translateProvider.translations('ar', {
            'Address or Zip Code': '',
            'Use my current location' : 'استخدام موقعي الحالي',
            'FIND RESTAURANTS': 'العثور على المطاعم',
            'Language Settings': 'اللغة اعدادات',                       
            'English': 'الإنجليزية',
            'Arabic': 'العربية',
            'Kurdish': 'كردي',
            'Edit Account': 'تحرير الحساب ',
            'Full Name': 'الاسم الكامل',
            'Email': 'البريد الإلكتروني',
            'Password': 'كلمه السر',
            'Full Address': 'العنوان الكامل',
            'Mobile Phone': 'تليفون محمول',
            'UPDATE': 'تحديث',
            'Settings': 'إعدادات',
            'Notifications': 'الإشعارات',
            'Push Notifications': 'دفع الإخطارات',
            '*Login Required': 'تسجيل الدخول مطلوب * ',
            'Address Book': 'دفتر العناوين',
            'Status' : 'الحالة',
            'Notes': 'الملاحظات',
            'Mobile Phone': 'تليفون محمول',
            'Business Phone': 'هاتف العمل',
            'Payment Method': 'طريقة الدفع او السداد',
            'Delivery type': 'نوع التوصيل',
            'Delivery Date': 'تاريخ التسليم او الوصول',
            'Tax': 'ضريبة',
            'Delivery Fee': 'رسوم التوصيل',
            'Service Fee': 'رسوم الخدمة',
            'Driver Tip': 'سائق تلميح',
            'Total': 'مجموع',
            'My Orders': 'طلباتي',
            'Date': 'تاريخ',
            'Business': 'عمل',
            'View more': 'عرض المزيد',
            'Connection Lost': 'انقطع الاتصال',
            'Tap to retry': 'إضغط لإعادة المحاولة',
            'Checkout': 'الدفع',
            'Delivery Address': 'عنوان التسليم',
            'Please input correct Information(*)': 'الرجاء إدخال المعلومات الصحيحة (*)',
            'Mobile Phone Number': 'رقم الهاتف الجوال',
            'Order Details': 'تفاصيل الطلب',
            'Cancel': 'إلغاء',
            'ORDER NOW': 'اطلب الان',
            'MIN ORDER': 'الحد الأدنى للطلب',
            'You are awesome!': 'إنك لرائع!',
            'Your order': 'طلبك',
            'was placed successfully': 'وضعت بنجاح',
            'Turn on your app push notifications.': 'تشغيل الإشعارات التطبيق الخاص بك.',
            'You will get order status changes.': 'سوف تحصل تغييرات حالة الطلب.',
            'status change': 'تغيير الوضع',
            'Ok, go back to homepage': 'طيب، والعودة إلى الصفحة الرئيسية',
            'Please choose your': 'الرجاء اختيار',
            'Special Instructions': 'تعليمات خاصة',
            'Add': 'إضافة',
            'View Order': 'عرض ترتيب',
            'Restaurant Search': 'البحث عن المطاعم',
            'Restaurants near': 'المطاعم القريبة من',
            'Minimum order': 'الحد الأدنى من النظام',
            'Promotion:': 'ترويج:',
            'Distance:': 'المسافات:',
            'Delivery fee:': 'رسوم التوصيل:',
            'Payment Select': 'اختر الدفع',
            'Please choose your Payment method (Required)': 'يرجى اختيار طريقة الدفع (مطلوب)',
            'ACCEPT': 'قبول',
            'Update on your order': 'تحديث على طلبك',
            'Sign In': 'تسجيل الدخول',
            'First Name': 'الاسم الاول',
            'to': 'إلى',
            'Last Name': 'الكنية',
            'Last Name2': 'الكنية 2',
            'Address': 'عنوان',
            'Colony': 'المنطقة',
            'Zip': 'الرمز البريدي',
            'Country': 'بلد',
            'City': 'مدينة',
            'Tel': 'الهاتف',
            'Cel': 'هاتف محمول',
            'API': 'واجهة تطبيق البرنامج',
            'Path of Profile Image': 'مسار الملف صورة',
            'CONTINUE AS GUEST': 'المتابعة كضيف',
            'LOGIN WITH FACEBOOK': 'تسجيل الدخول باستخدام الفيسبوك',
            'Start Order': 'بدء تشغيل النظام',
            'My Profile': 'الشخصي ملفي',
            'My Orders': 'طلباتي',
            'Logout': 'خروج',
            'Sign Up': 'سجل',
            'Hi': 'مرحبا',
            'Please enter your registration code': 'الرجاء إدخال رمز التسجيل الخاص بك',
            'Registration Code': 'رمز التسجيل',
            'SIGN UP': 'سجل',
            'Next': 'التالى',
            'Mobile Number': 'رقم الهاتف المحمول',
            'Name': 'اسم',
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
            'image could not be loaded': 'لاصور لم تحمل ',
            'Please enter correct mobile number': 'الرجاء ادخال رقم الموبايل بشكل صحيح',
            'OK': 'حسنا',
            'IQD': 'د.ع.',
            'Add any special instructions': 'إضافة أي تعليمات خاصة',
            'Select your Area': 'اختر منطقتك',
            'Rating': 'تصنيف'
        });

        $translateProvider.translations('kr', {
            'Address or Zip Code': '',
            'Use my current location' : 'بةكارهيَناني شويَني ئيَستام',
            'FIND RESTAURANTS': 'دوَزينةوةي ضيشتخانة',
            'Language Settings': 'ضاكردنةوةي زمان',                       
            'English': 'ئينطليزي',
            'Arabic': 'عربى',
            'Kurdish': 'كردي',
            'Edit Account': 'ضاككردني ئةكاونت',
            'Full Name': 'ناوي سياني - ناوي تةواو',
            'Email': 'ثؤستةي ئةليكترؤني',
            'Password': 'ذمارةي نهيَني ',
            'Full Address': 'ناونيشاني تةواو',
            'Mobile Phone': 'موبايل',
            'UPDATE': 'نويَ كردنةوة',
            'Settings': 'ضاككردنةوة',
            'Notifications': 'ورياكردنةوة',
            'Push Notifications': 'ورياكردنةوة',
            '*Login Required': 'ضوونةذورةوةي ثيَويست',
            'Address Book': 'دةفتةري ناونيشان',
            'Status' : 'حالًةت',
            'Notes': 'تيَبيني',
            'Mobile Phone': 'موبايل',
            'Business Phone': 'تةلةفوني ئيش',
            'Payment Method': 'ضؤنيةتي دان و  رِاستي',
            'Delivery type': 'ضؤنيةتي طةياندن',
            'Delivery Date': 'ميَذووي وةرطرتن و طةياندن',
            'Tax': 'زةريبة',
            'Delivery Fee': 'رةسمي طةياندن',
            'Service Fee': 'ويَنةي خزمةتكردن',
            'Driver Tip': 'بةخشيشي شوفيَر',
            'Total': 'كؤي طشتي',
            'My Orders': 'داواكاريةكان',
            'Date': 'ميَذوو',
            'Business': 'كار',
            'View more': 'ثيشانداني زؤرتر',
            'Connection Lost': 'ثضراني ثةيوةندي',
            'Tap to retry': 'دابطرة بؤ دوبارةكردنةوة',
            'Checkout': 'ثارة دان',
            'Delivery Address': 'شويَني وةرطرتن',
            'Please input correct Information(*)': 'تكاية زانيارية دروستةكان داخل بكة',
            'Mobile Phone Number': 'ذمارةي موبايل',
            'Order Details': 'ضؤنيةتي داواكردن',
            'Cancel': 'رةشكردنةوة - هةلوةشاندنةوة',
            'ORDER NOW': 'ئيَستا داوابكة',
            'MIN ORDER': 'لايةني كةم بؤ داواكردن',
            'You are awesome!': 'تؤ نايابي',
            'Your order': 'داواكةت',
            'was placed successfully': 'بةسةركةوتووي دانرا',
            'Turn on your app push notifications.': 'ثيَكردني داخوازييةكاني تايبةت بةخؤت',
            'You will get order status changes.': 'ئةو طؤراناكارييانةي رودةدات لةكاتي داوا كردن ',
            'status change': 'تغيير الوضع',
            'Ok, go back to homepage': 'باشة . طةرانةوة بؤ مالثةري سةرةكي',
            'Please choose your': 'تكاية هةلبذيَرة',
            'Special Instructions': 'زانياري تايبةت',
            'Add': 'لةسةردانان - كؤكردنةوة',
            'View Order': 'ثيشانداني ريَكخستن',
            'Restaurant Search': 'طةران بة دواي ضيَشتخانة',
            'Restaurants near': 'ئةم ضيشتخانانةي نزيكن',
            'Minimum order': 'لايةني كةم سيستةم',
            'Promotion:': 'بةرزكردنةوة',
            'Distance:': 'دووري',
            'Delivery fee:': 'ويَنةي طةياندن',
            'Payment Select': 'هةلبذاردني دان (ثارة)',
            'Please choose your Payment method (Required)': 'تكاية ريَطاي ثارة دان هةلبذيَرة (داواكار)',
            'Update on your order': 'نويَكردنةوةي داواكاريةكةت',
            'Sign In': 'تؤماركردني ضونة ناو',
            'First Name': 'ناوي يةكةم',
            'to': 'إلى',
            'Last Name': 'نازناو ',
            'Last Name2': 'نازناوي دووةم',
            'Address': 'ناونيشان',
            'Colony': 'دةزطا',
            'Zip': 'وشةي نهيَني ئيميل',
            'Country': 'ولاَت',
            'City': 'شار',
            'Tel': 'تةلةفؤن',
            'Cel': 'موبايل',
            'API': 'روكاري ثيَشةوةي بةرنامةكردن',
            'Path of Profile Image': 'ريَطاي ويَنةي فايل',
            'CONTINUE AS GUEST': 'بةردةوام بوون وةكو ميَوان',
            'LOGIN WITH FACEBOOK': 'تؤماركردن بة بةكاهيَناني فةيسبوك',
            'Start Order': 'دةست ثيَكردن بة سيستةم',
            'My Profile': 'ذياننامة - ثرؤفايل',
            'My Orders': 'داكاريةكانم',
            'Logout': 'دةرضوون',
            'Sign Up': 'ضوونة ذوورةوة',
            'Hi': 'ضؤني',
            'Please enter your registration code': 'تكاية كؤدي داخل بوونت بنوسة ',
            'Registration Code': 'ذمارةي نهيَني ',
            'SIGN UP': 'ضوونة ذوورةوة',
            'Next': 'دواتر ',
            'Mobile Number': 'موبايل',
            'Name': 'اسم',
            'Searching...': 'بەدوا گەڕان...',
            'Please Enter your Full Address or ZipCode': 'تكايەت پڕ ئەدرێس بچەيە ناو يان [زيپكۆدە]',
            'Geocode was not successful for the following reason:': '[گەۆكۆدە] سەركەوتوو نەبوو بۆ هۆى داهاتوو:',
            'SearchFailed! Can not find near Restaurants!': '[سيرچفايلەد]! مەتوانە بدۆزێتەوە نزيك چێشتخانە!',
            'Location not found': 'شوێن نەدۆزييەوە',
            'Getting Location Error!': 'دەست كەوتن هەڵەى شوێن!',
            'ERROR!': 'هەڵە!',
            'OrderingApp': '[ئۆردەرينگاپپ]',
            'get location error': 'هەڵەى شوێن دەست بكەو',
            'User Profile updated!': 'پرۆفايلى بەكاربەر نوێى كردەوە!',
            'Already you have never been ordered!. Please...!': 'هەرئێستا تۆ هەرگيز فەرمانت نەكردبوو!. تكايە...!',
            'Getting Failed!': 'دەست كەوتن نشستيى هێنا!',
            'Do you want to cancel current order?': 'دەتەوێت تا فەرمانى هەنووكە هەڵ بوەشێننەوە؟',
            'Please Select Required Options': 'تكايە هەڵ ببژێرە بژاردە پێويست ببوو',
            'Your Cart is Empty!': 'عەرەبانەت بەتاڵە!',
            'Are you cancel current order?': 'ە تۆ فەرمانى هەنووكە هەڵ دەوەشێنيتەوە؟',
            'Failed with Getting User Data. Try again?': 'نشستيى هێنا لەگەڵ دەست كەوتنى بەكاربەر زانيارى. دووبارە هەوڵ دەدەێت؟',
            'Are you cancel your Order!': 'ببە تۆ فەرمانت هەڵ دەوەشێنيتەوە!',
            'Please Fill Required Fields!': 'تكايە پڕ بكەە فييلدز پێويست ببوو!',
            'Invalid user data. Please try again': 'Invalid user data. Please try again',
            'Please Fill Required Fields!': 'تكايە پڕ بكەە فييلدز پێويست ببوو!',
            'Please Enter only numbers': 'تكايە تەنها ژمارە بچەيە ناو',
            'Register Failed! please try again later.': 'ناڕاست زانياريى بەكاربەر. تكايە دووبارە هەوڵ بدەيە',
            'Facebook login failed': 'لۆگينى فەيسبوك نشستيى هێنا',
            'Please select': 'تكايە هەڵ ببژێرە',
            'Transaction Canceled': 'سەودا كانسەلد',
            'Please select Payment Method!': 'تكايە ڕێگەى پارەدان هەڵ ببژێرە!',
            'Please Select your Payment Method': 'تكايەت ڕێگەى پارەدان هەڵ ببژێرە',
            'Failed Place Order!!': 'فەرمانى شوێن نشستيى هێنا!!',
            'image could not be loaded': 'وێنە ناتوانێت بار نابكرێت',
            'Please enter correct mobile number': 'تكايە ژمارەى مۆبايلى ڕاست بچەيە ناو',
            'OK': 'حسنا',
            'IQD': 'د.ع.',
            'Add any special instructions': 'إضافة أي تعليمات خاصة',
            'Select your Area': 'اختر منطقتك',
            'Rating': 'تصنيف'
        });

        $translateProvider.preferredLanguage(localStorage.getItem("language"));
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



