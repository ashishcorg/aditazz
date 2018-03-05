var map,markers=[];
function initMap() {
  var bangaloreLat = {
    lat: 12.972442,
    lng: 77.580643
  };

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: bangaloreLat
  });

  /* var marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    title: 'Hello World!'
  }); */
  
  
  fetchDummyData();
  
}

function fetchDummyData(){
	var xhttp = new XMLHttpRequest();
	  xhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	    	var responseJSON = JSON.parse(this.response);
	    	document.getElementById("testrefresh").innerHTML = responseJSON.refreshTime;
	    	refreshMarkers(responseJSON.autos,responseJSON.autoStands);
	    	setTimeout(fetchDummyData, 5000);
	    }
	  };
	  xhttp.open("GET", "/dummyData", true);
	  xhttp.send();
}

function refreshMarkers(dataArray,dummyAutoData) {
	//setMapOnAll(null);
	for(var i=0;i<markers;i++){
		markers[i].setMap(null)
	}
	 markers = dataArray.map(function(autoDetail, i) {
	    var autoMarker = new google.maps.Marker({
	      position: autoDetail,
	      icon: "./img/auto_icon.png"
	    });
	    var infowindow = new google.maps.InfoWindow({
	        content: autoDetail.reg_id+"<br>going to:"+JSON.stringify(autoDetail.destination)
	      });
	    autoMarker.addListener('click', function() {
	        infowindow.open(map, autoMarker);
	      });
	    return autoMarker;
	  });

	  // Add a marker clusterer to manage the markers.
	  var markerCluster = new MarkerClusterer(map, markers,
	      {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
	
	  dummyAutoData.forEach(function(data) {
    var marker = new google.maps.Marker({
      position: data,
      map: map,
    });
    var infowindow = new google.maps.InfoWindow({
      content: "<h1>"+data.name+"</h1><br><h2>Current Auto List</h2>"+data.autos.toString()+"<br><h2>Previous Auto list</h2>"+data.prev.toString()
    });
    marker.addListener('click', function() {
      infowindow.open(map, marker);
    });
  });
}