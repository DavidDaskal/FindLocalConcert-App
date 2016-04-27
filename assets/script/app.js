//Get user's location

getLocation(); 

function getLocation() {
	
    if (navigator.geolocation) {
    	
        navigator.geolocation.getCurrentPosition(showPosition);
    }
}

function showPosition(position) {
	
	userLatitude = position.coords.latitude;
	userLongitude = position.coords.longitude;
    coordToCityName(userLatitude,userLongitude);
	  }

function coordToCityName(lat,long) {
	var geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(lat,long);

	geocoder.geocode(
	    {'latLng': latlng}, 
	    function(results, status) {
	        if (status == google.maps.GeocoderStatus.OK) {
	                if (results[0]) {
	                    var add= results[0].formatted_address ;
	                    var  value=add.split(",");

	                    count=value.length;
	                    country=value[count-1];
	                    userState=value[count-2];
	                    userState=userState[1]+userState[2];
	                    userCity=value[count-3];
	                    
	                }
	                
	        	}
	         
		    }
		);
	}

//End of obtaining user's location

$('#upcoming-container').hide();

$("#userlocation").on("click", function () {
	
	$("#city").val(userCity);
	$("#state").val(userState);
	return false;
 });

$('#search').submit(function(e){ //this is the main function of the page
	$('#upcoming-container').hide('slow'); //Handles upcoming container animation
	$('#errorMSG').remove();
	e.preventDefault();
	var artist = $('#artist').val().trim(); //gets user inputted values
	var city = $('#city').val().trim();
	var state = $('#state').val();

	if (!city && !state) {
		solo = true;
	} else {
		solo = false;
	}

	if (city && state) {
		city = city + ",";
	}
	$('#tabOneInner').empty(); //Empties panel contents;
	$('#tabTwoInner').empty();

	if (artist == "" && city == "" && state == "") {
		$('#submitButton').after('<p id="errorMSG">Please enter at least one field</p>')
	} else {
		$('#upcoming-container').show('slow','swing', function(){
			$('html, body').animate({
		        scrollTop: $("#upcoming").offset().top
		    }, 500);
		});
		generateURL(solo, artist, city, state);	//Generates URL for AJAX.
		ajaxBuild(); //locationArray is costructed in here, so that it can be used below

		
	}
});

function ajaxBuild(){
	$.ajax({
    url: queryURL, //QueryURL variable is built with the generateURL function.
    method: 'GET',
    crossDomain: true,
    dataType: 'jsonp'
	}).done(function(response) {
	    var limit = 0;
	    for (var i = 0; i < response.length; i++) { 
			if (limit < 12) { //This for loop returns a MAX of 12 responses but functions correctly if there are less than 12.
	        	limit++;
	        	createShowCard(response[i].artists[0].name,response[i].datetime, response[i].venue.name, response[i].venue.city, response[i].venue.region, response[i].ticket_status, response[i].ticket_url);
	      			//^^^^^Builds the HTML elements that are appended to #panelOne
	      			showMap(response, i);
	      	} else {
	        	i = response.length;
	        	//Ends the for loop if limit is reached
	    	}
	    };
	});
}

function generateURL(solo, artist, city, state){
    if (solo) {
        introURL = "";
        endURL = "/events.json?"
    } else if (!solo) {
        introURL = "events/search?"
        endURL = "";
    };

    if (city && state) {
      city = city + ", "
    }

    if (!city && !state && artist) {
        artistQuery = "artists/" + artist + "/events.json?";
        locationQuery = "";
    } else if (!artist && (city || state)) {
        artistQuery = "";
        locationQuery = "&location=" + city + state;
    } else if (artist && (city || state)) {
        artistQuery = "artists[]=" + artist;
        locationQuery = "&location=" + city + state;
    } else {
    }


    queryURL = "https://api.bandsintown.com/" + introURL + artistQuery + endURL + locationQuery + "&page=1&per_page=10&radius=150&format=json&app_id=Concertch"
}

function createShowCard(name, date, venue, city, state, tickets, ticketsURL){
	date = moment(date).format('MMMM Do YYYY');
	

	if (tickets == "available") {
		ticketStatus = $('<a target="_blank">');
		ticketStatus.attr('href', ticketsURL);
		ticketStatus.addClass('buyTicket');
		ticketStatus.text('Tickets Available!')
	} else {
		ticketStatus = "Sold Out :("
	}
	console.log(tickets)
	var nameInfo = $('<div class="cardName">').append('<p>' + name + '</p>');
	var dateInfo = $('<div class="cardDate">').append('<p>' + date + ' - ' + city + ' ' + state + '</p>');
	var venueInfo = $('<div class="cardVenue">').append('<p><u>Venue</u><br>' + venue + '</p>');
	var locationInfo = $('<div class="cardLocation">').append('');
	var ticketInfo = $('<div class="cardTicket">').append(ticketStatus);
	var newCard = $('<div class="showCard">');
	var line = $("<div class='divide'>");
	(newCard).append(nameInfo).append(dateInfo).append(venueInfo).append(locationInfo).append(ticketInfo);
	
	if (tickets == "available") {
		newCard.addClass('available');
	} else {
		newCard.addClass('unavailable');
	}

	$('#tabOneInner').append(newCard).append(line);

}

function showMap (response, i) {

	currentVenue = new google.maps.LatLng(response[i].venue.latitude, response[i].venue.longitude);
    function initialize()
    {
     mapProp = {
      center:currentVenue,
      zoom:12,
      mapTypeId:google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      zoomControl: true
      };
     var mapDiv = $('<div>');
     mapDiv.attr('id', i);
     mapDiv.addClass('maps')
     var line = $("<div class='divide'>");
     $('#tabTwoInner').append(mapDiv).append(line);
     map = new google.maps.Map(document.getElementById(i),mapProp);

    // var marker=new google.maps.Marker({
    //   position:currentVenue,
    //   });

    // marker.setMap(map);

    var infoBubble = new InfoBubble({
      map: map,
      content: "<div id='venuemaker'>"+response[i].venue.name+"</div>",
      position: currentVenue,
      shadowStyle: 1,
      padding: 0,
      backgroundColor: 'rgb(57,57,57)',
      borderRadius: 10,
      arrowSize: 10,
      borderWidth: 1,
      borderColor: '#2c2c2c',
      disableAutoPan: true,
      hideCloseButton: true,
      arrowPosition: 30,
      backgroundClassName: 'transparent',
      arrowStyle: 2
    });

   infoBubble.open();
    // var infowindow = new google.maps.InfoWindow({
    //       content: response[i].venue.name
    //       });

    //     infowindow.open(map,marker);
    //   }
	}
initialize();
}


//http://api.bandsintown.com/events/search.json?location=Boston,MA&page=1&app_id=YOUR_APP_ID
//Returns all events (page 1) in Boston, MA. no callback.

//http://api.bandsintown.com/artists/Skrillex/events.json?app_id=YOUR_APP_ID
//Returns all events for Skrillex.

//http://api.bandsintown.com/events/search.json?location=Boston,MA&page=2&per_page=3&app_id=YOUR_APP_ID
//Returns all events in Boston (page 2), with 3 results. no callback.

//http://api.bandsintown.com/events/recommended.json?artists[]=Common&artists[]=Dwele&location=Chicago,IL&app_id=YOUR_APP_ID&callback=bitEvents


