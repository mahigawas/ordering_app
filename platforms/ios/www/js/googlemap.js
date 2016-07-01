
function GoogleMap()
{				
	this.initialize = function( div_id, lat,lng , zoomValue){				
	    var map = showMap(div_id, lat,lng,zoomValue);
	    addMarkersToMap(map , lat , lng);
	};
	 
    var showMap = function(div_id, lat,lng,zoomValue){
    	//dump( "=>"+zoomValue );
        //zoomValue = JSON.stringify(zoomValue);
		var mapOptions = {
		zoom: zoomValue,
		center: new google.maps.LatLng(lat, lng),
		mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		 
		var map = new google.maps.Map(document.getElementById(div_id), mapOptions);
		 
		return map;
	};

	var addMarkersToMap = function(map,lat,lng){			
		var latitudeAndLongitudeOne = new google.maps.LatLng(lat,lng);
		var markerOne = new google.maps.Marker({
            position: latitudeAndLongitudeOne,
            map: map
        });                        
	}
		
}

function getLocationFromAddress(address) {
    var latlng = {};
    geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            latlng.lat = results[0].geometry.location.lat();
            latlng.lng = results[0].geometry.location.lng();
            //latlng.zip = results[0].address_components[0].long_name;
            /*geocoder.geocode( {'latLng': results[0].geometry.location}, function(results, status) {
             latlng.zip = results[0].address_components[7].long_name;
             alert("!!!");
             });*/
        }
        else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
    return latlng;
}
//
//var autocomplete;
//
//function initAutocomplete() {
//    // Create the autocomplete object, restricting the search to geographical
//    // location types.
//    autocomplete = new google.maps.places.Autocomplete(
//        /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
//        {types: ['geocode']});
//
//    // When the user selects an address from the dropdown, populate the address
//    // fields in the form.
//    autocomplete.addListener('place_changed', fillInAddress);
//}