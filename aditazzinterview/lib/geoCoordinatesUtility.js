var autoStands = require("../dummyData/autoStands.json");
var autos = require("../dummyData/autos.json");

function _getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
	var R = 6371; // Radius of the earth in km
	var dLat = _deg2rad(lat2 - lat1); // deg2rad below
	var dLon = _deg2rad(lon2 - lon1);
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(_deg2rad(lat1))
			* Math.cos(_deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c; // Distance in km
	return d;
}

function _deg2rad(deg) {
	return deg * (Math.PI / 180)
}

function _getRandomAutoState(a){
	return Math.floor(Math.random() * a);
}

Array.min = function( array ){
    return Math.min.apply( Math, array );
};
for(var i=0;i<autoStands.length;i++){
	autoStands[i].name="Auto Stand "+1;
}
exports.previousData=null;
function _getClosetAutoStand(auto){
	var distanceArray=[];
	for(var i=0;i<autoStands.length;i++){
		distanceArray[i]=_getDistanceFromLatLonInKm(auto.lat,auto.lng,autoStands[i].lat,autoStands[1].lng);
	}
	var index = distanceArray.indexOf(Math.min.apply(null,distanceArray));
	if(!autoStands[index].autos){
		autoStands[index].autos=[];
	}
	autoStands[index].autos.push(auto.reg_id);
	return {lat:autoStands[index].lat,lng:autoStands[index].lng};
}
exports.getInitialDummyData = function() {
	if(this.previousData){
		for(var i=0;i<autoStands.length;i++){
			autoStands[i].prev=this.previousData[i].autos;
		}
	}
	for(var i=0;i<autos.length;i++){
		autos[i].reg_id = "KA-"+_getRandomAutoState(99)+"MM-"+_getRandomAutoState(9999);
		if(!_getRandomAutoState(2)){
			autos[i].destination={lat: autos[(i+1)%(autos.length-1)].lat,lng:autos[(i+1)%(autos.length-1)].lng};
		}else{
			autos[i] = _getClosetAutoStand(autos[i]);
		}
	}
	this.previousData=autoStands;
	return {refreshTime: new Date(),autos: autos,autoStands:autoStands};
}

