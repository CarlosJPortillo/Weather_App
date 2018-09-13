var LATITUDE;
var LONGITUDE;
var MAP;
var MARKER;
var XHR;
var CITY;
var STATE;

//starting function called when page loads 
function Initialize()
{
	
	
	//if there is no stored location in local storage
	if(localStorage.getItem('storedLongitude') == null)
	{
		GetLocation();
	}
	else
	{
		LATITUDE = localStorage.getItem('storedLatitude');
		LONGITUDE = localStorage.getItem('storedLongitude');
		var position = {
			coords: {latitude: parseFloat(LATITUDE), longitude: parseFloat(LONGITUDE)}
		};
	
		CreateStartPosition(position);
	}

}

//get users current default starting position 
function GetLocation() 
	{
		//check if geolocation is supported 
		if (navigator.geolocation) 
		{
			navigator.geolocation.getCurrentPosition(CreateStartPosition);
		} 	
		else 
		{
			x.innerHTML = "Geolocation is not supported by this browser.";
		}
	}
function CreateStartPosition(position)
{
	//store postion into local storage
	localStorage.setItem('storedLatitude', position.coords.latitude.toString());
	localStorage.setItem('storedLongitude', position.coords.longitude.toString());
	
	//gets latitude and longitude of current location and store their value into variables
	LATITUDE = position.coords.latitude;
	LONGITUDE = position.coords.longitude;
	//create map object 
	MAP = new google.maps.Map(document.getElementById('map'),{
     zoom: 6
        });
	//set the current position, LatLng is an object for latitude and longitude 
	MAP.setCenter(new google.maps.LatLng(LATITUDE, LONGITUDE));	
	//create marker object 
	MARKER = new google.maps.Marker({
	position: {lat: LATITUDE, lng: LONGITUDE},
	map: MAP,
	title: 'Hello World!'	
  });
  //add listener for page resize to make page responsive 
  google.maps.event.addDomListener(window, "resize", function() {
			var center = MAP.getCenter();
			google.maps.event.trigger(MAP, "resize");
			MAP.setCenter(center);
		});
  //add listener to map to respond to click event
  google.maps.event.addListener(MAP, 'click', function(event) {
  Map_EventHandler(event.latLng);
  });

}
//Function that performs various functions when click event is raised 
function Map_EventHandler(geo_location)
{
	//make headers visible 
	document.getElementById("currentConditionsHeader").style.visibility = 'visible';
	document.getElementById("TenDayHeader").style.visibility = 'visible';
	document.getElementById("conditions").style.backgroundColor = "FF9999";
	document.getElementById("tenDay").style.backgroundColor = "99CCFF";
	//set new location for marker 
	MARKER.setPosition(geo_location);
	//centers the new location 
	MAP.setCenter(geo_location);
	//store values of new coordinates 
	LATITUDE = geo_location.lat();
	LONGITUDE = geo_location.lng();
	GeoLocator();
	Conditions();
	TenDayForecast();
	//store postion into local storage
	localStorage.setItem('storedLatitude', LATITUDE.toString());
	localStorage.setItem('storedLongitude', LONGITUDE.toString());
    

	
	
}
//Get City, State, Country 
function GeoLocator()
{
	try
	{
		XHR = CreateHttpRequestObject();
		XHR.open("GET","http://api.wunderground.com/api/ae5f73b6504d6f21/geolookup/q/"+ LATITUDE + "," + LONGITUDE +".json", false );
		XHR.send(null);
	}
	catch(e)
	{
		alert(e.toString());
	}
	
	var r = JSON.parse(XHR.response);
	CITY = r.location.city;
	STATE = r.location.state;
	var City_State_Country = CITY + ", " + STATE + ", " + r.location.country;
	//var State =  r.current_observation.temperature_string + "</br>";
	//var Country = r.current_observation.wind_string + "</br>";

	document.getElementById("city_info").innerHTML = City_State_Country;


}
//Get Current Conditions 
function Conditions()
{
	try{
		//create XMLHttpRequest object used to transfer data between browser and server
		XHR = CreateHttpRequestObject();
		XHR.open("GET", "http://api.wunderground.com/api/ae5f73b6504d6f21/conditions/q/" +STATE + 
		"/" + CITY +".xml", false);
		//Sends request to web server 
		XHR.send(null);
	}
	catch(e)
	{
		alert(e.toString());
	}
	
	var xmlResponse = XHR.responseXML;
	var root = xmlResponse.documentElement;
	
	//create an array which will only contain one element 
	var date = root.getElementsByTagName("observation_time_rfc822");
	var temperature_string = root.getElementsByTagName("temperature_string");
	var icon = root.getElementsByTagName("icon_url");
	
	var dayOfWeek = "";
	var temp = "";
	var iconUrl = "";

	
	//item is the name, first child.data accesses text and yes do you need the data for some odd reason
	dayOfWeek += date.item(0).firstChild.data;
	temp += temperature_string.item(0).firstChild.data;
	iconUrl += icon.item(0).firstChild.data;
	
	
	dayOfWeek = GetDay(dayOfWeek);
	document.getElementById("conditions_info").innerHTML = dayOfWeek + "  " + temp;
	document.getElementById("icon").src = iconUrl;
	
	
}
function GetDay(dayOfWeek)
{
	var sub_str;
	sub_str = dayOfWeek.substring(0, 3);
	
	if(sub_str == "Mon")
	{
		dayOfWeek = "Monday";
	}
	else if(sub_str == "Tue")
	{
		dayOfWeek = "Tuesday";
	}
	else if(sub_str == "Wed")
	{
		dayOfWeek = "Wednesday";
	}
	else if(sub_str == "Thu")
	{
		dayOfWeek = "Thursday";
	}
	else if(sub_str == "Fri")
	{
		dayOfWeek = "Friday";
	}
	else if(sub_str == "Sat")
	{
		dayOfWeek = "Saturday";
	}
	else if(sub_str == "Sun")
	{
		dayOfWeek = "Sunday ";
	}
	return dayOfWeek;
}
function TenDayForecast()
{
	XHR = CreateHttpRequestObject();
	try
	{
		var url = "http://api.wunderground.com/api/ae5f73b6504d6f21/forecast10day/q/"+ 
		STATE + "/" + CITY + ".json"
		XHR.open("GET",url, false );
		XHR.send(null);
	}
	catch(e)
	{
		alert(e.toString());
	}
	//parse reponse to JSON
	var r = JSON.parse(XHR.response);
	var dayOfWeek;
	var weatherString;
	var icon;

	var x = document.getElementById("tenDayForecast");
	//clears any possible information from previous click event iteration on the web page;
	x.innerHTML = " ";
	//loop to iteriate through the 10 days 
	for(i = 0; i < 20; i++)
	{
		dayOfWeek = "";
		weatherString = "";
		icon = "";
		dayOfWeek = r.forecast.txt_forecast.forecastday[i].title;
		weatherString = r.forecast.txt_forecast.forecastday[i].fcttext;
		icon = r.forecast.txt_forecast.forecastday[i].icon_url;
		//display information on page 
		x.innerHTML += dayOfWeek + " " + weatherString + "<img src=\"" + icon + "\">" + "</br>";
		
	}
 	
}
//Create HTTP Request Object 
function CreateHttpRequestObject()
{
	var XHR;
	if(window.XMLHttpRequest)
	{
		XHR = new XMLHttpRequest();
	}
	//if user uses IE 6 or older
	else{
		XHR = new ActiveXObject("Microsof.XMLHTTP");
	}
	return XHR;
	
}



