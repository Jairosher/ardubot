//importar los modulos a usar
const express= require('express');
const bodyParser= require('body-parser');
const request= require('request');
const config= require('./config');
var five = require("johnny-five");
var board = new five.Board({ port: process.env.SERIAL_PORT});
	console.log('Succesfull connection');
//var ventilador=13;
//var foco=12;


//board.on("ready", function() {

//var ventilador= new five.Led(13);
//	ventilador.blink(1000);

//var foco=new five.Led(foco);
  //  foco.off();

});

var app=express();

app.use(bodyParser.json());

//app.listen('3000',function(){

//console.log('El servidor inicio en el puerto 3000');


app.get('/', function(req,res){

	res.send('Bienvenidos al taller del ITGAM');

});

// Start board johnny five
board.on("ready", function() {
	console.log('Board is ready');

	var focus_a = new five.Led(13);
	var focus_b = new five.Led(12);

	// Request with method get to webhook
	app.get('/webhook',function(req, res){
		if(req.query['hub.verify_token'] === 'hello_token'){
			res.send(req.query['hub.challenge'])
		}else{
			res.send('Invalid token');
		}
	})

	// Request with method post to webhook
	app.post('/webhook',function(req, res){
		var data = req.body

		if(data.object == 'page'){
			data.entry.forEach(function(pageEntry){
				pageEntry.messaging.forEach(function(messagingEvent){
					if(messagingEvent.message){
						getMessage(messagingEvent)
					}
				})
			})
		}
		res.sendStatus(200)
	})

	// Get text messages
	function getMessage(messagingEvent){
		var senderID = messagingEvent.sender.id
		var messageText = messagingEvent.message.text

		evaluateTextMessage(senderID, messageText)
	}

	// Evaluate text message
	function evaluateTextMessage(senderID, messageText){
		let message = "";

		switch (messageText) {
			case "@help":
				message = "I can help you :)";
				break;
			case "@focus":
				message = "Focus a & b: 1.- @turn_on_focus_a/@turn_off_focus_a 2.- @turn_on_focus_b/@turn_off_focus_b  ";
				break;
			case "@turn_on_focus_a":
				focus_a.on();
				message = " Focus on :)";
				break;
			case "@turn_off_focus_a":
				focus_a.off();
				message = " Focus off :)";
				break;
			case "@turn_on_focus_b":
				focus_b.on();
				message = " Focus on :)";
				break;
			case "@turn_off_focus_b":
				focus_b.off();
				message = " Focus off :(";
				break;
			default:
				message = "Sorry, we are out of service.";
		}

		SendTextMessage(senderID, message);
	}

	// Send text message
	function SendTextMessage(senderID, message){
		var messageData = {
			recipient : {
				id: senderID
			},
			message: {
				text: message
			}
		}

		callSendApi(messageData)
	}

	// Calling API to send message
	function callSendApi(messageData){
		request({
			uri: 'https://graph.facebook.com/v2.9/me/messages',
			qs: {access_token: process.env.APP_TOKEN},
			method: 'POST',
			json: messageData
		},function(error, response, data){
			if(error){
				console.log('Cannot send message');
			}
			else{
				console.log('Successful message');
			}
		});
	}

	// Start the server.
	app.listen(process.env.PORT || 5000,function(){
		console.log('Listening localhost:' + process.env.PORT || 5000)
	})
});
//app.listen((process.env.PORT || 5000), () => console.log('El servidor webhook esta escuchando!'));
