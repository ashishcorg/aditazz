
var express = require("express");
var webPush = require("web-push");
var atob = require('atob');
var bodyParser = require('body-parser');
var util = require('util');

var geoUtility = require("./lib/geoCoordinatesUtility");

var app = express();

var subscribers = [];

var VAPID_SUBJECT = "mailto:ashish.anand01@sap.com";
var VAPID_PUBLIC_KEY = "BDbWwyn6xwNrTfODCY-gxcyPtQ-9PwdPIlWz3ArTZGKevEy16JGmIj63OjrLLm5o2YgFGX6X0Us4wA-7lK7x8Hg";
var VAPID_PRIVATE_KEY = "AcBRheI-kG5c7Nk5k8XZmFoTARP3RcdRgoU4sC2f4b8";

//Auth secret used to authentication notification requests.
var AUTH_SECRET = "AsHiShAnAnD";

if (!VAPID_SUBJECT) {
    return console.error('VAPID_SUBJECT environment variable not found.');
} else if (!VAPID_PUBLIC_KEY) {
    return console.error('VAPID_PUBLIC_KEY environment variable not found.');
} else if (!VAPID_PRIVATE_KEY) {
    return console.error('VAPID_PRIVATE_KEY environment variable not found.');
} else if (!AUTH_SECRET) {
    return console.error('AUTH_SECRET environment variable not found.');
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

webPush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

app.use(express.static('static'));

app.get('/status', function (req, res) {
    res.send('Server Running!');
});

app.get('/dummyData', function (req, res) {
    res.send(geoUtility.getInitialDummyData());
});


app.get("/notifyall", function (req, res) {
    if(req.get('auth-secret') != AUTH_SECRET) {
        console.log("Missing or incorrect auth-secret header. Rejecting request.");
        return res.sendStatus(401);
    }
    
    var message = req.query.message || "Willy ashish Wonka's chocolate is the best!";
    var clickTarget = req.query.clickTarget || 'http://www.favoritemedium.com';
    var title = req.query.title || 'Push notification received!';

    subscribers.forEach(function(pushSubscription){
    	var payload = JSON.stringify({message : message, clickTarget: clickTarget, title: title});
    	
    subscribers.forEach(function(pushSubscription){
        //Can be anything you want. No specific structure necessary.
        var payload = JSON.stringify({message : message, clickTarget: clickTarget, title: title});

        webPush.sendNotification(pushSubscription, payload, {}).then(function(response){
            console.log("Status : "+util.inspect(response.statusCode));
            console.log("Headers : "+JSON.stringify(response.headers));
            console.log("Body : "+JSON.stringify(response.body));
            res.send('Notification sent!');
        }).catch(function(error){
            console.log("Status : "+util.inspect(error.statusCode));
            console.log("Headers : "+JSON.stringify(error.headers));
            console.log("Body : "+JSON.stringify(error.body));
            res.send('Notification not sent!');
        });
    });
    });

    
});

app.post('/subscribe', function (req, res) {
    var endpoint = req.body['notificationEndPoint'];
    var publicKey = req.body['publicKey'];
    var auth = req.body['auth'];
    
    var pushSubscription = {
        endpoint: endpoint,
        keys: {
            p256dh: publicKey,
            auth: auth
        }
    };

    subscribers.push(pushSubscription);

    res.send('Subscription accepted!');
});

app.post('/unsubscribe', function (req, res) {
    var endpoint = req.body['notificationEndPoint'];
    
    subscribers = subscribers.filter(function(subscriber){ endpoint == subscriber.endpoint });

    res.send('Subscription removed!');
});

var PORT = process.env.PORT || 8080;
app.listen(PORT,function(){
	console.log("started");
});
   // console.log('push_server listening on port ${PORT}!');