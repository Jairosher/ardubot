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


board.on("ready", function() {

var ventilador= new five.Led(13);
	//ventilador.off();

//var foco=new five.Led(foco);
    //foco.off();

});

var app=express();

app.use(bodyParser.json());

//app.listen('3000',function(){

//console.log('El servidor inicio en el puerto 3000');


app.get('/', function(req,res){

	res.send('Bienvenidos al taller del ITGAM');

});

app.get('/webhook',function(req,res){


if(req.query['hub.verify_token']===config.FACEBOOK_TOKEN){

			res.status(200).send(req.query['hub.challenge']);					

			//res.send(req.query['hub.challenge']);					

}else{

			res.send('Acceso no autorizado');
}

});

app.post('/webhook',function(req,res){

	var data= req.body;

	if(data.object=='page'){

		data.entry.forEach(function(dataEntry){

			dataEntry.messaging.forEach(function(messageEvent){

				if(messageEvent.message){

					recivedMessage(messageEvent);
				}

			});

		});
		res.sendStatus(200);
	}

});


function recivedMessage(event){


	var sender= event.sender.id;
	var text=event.message.text;

	evaluateMessage(sender,text);

}

function evaluateMessage(sender,text){
	let finalMessage="";
	
	switch (text){
		case "prender ventilador":
			ventilador.on();
			finalMessage = "ok" ;
			break;
		case "Prender Ventilador":  
			ventilador.on();
			finalMessage = "ok" ;
			break;
			
		case "apagar ventilador":
			ventilador.off();
			finalMessage = "ok" ;
			break;
		case "Apagar Ventilador":  
			ventilador.off();
			finalMessage = "ok" ;
			break;

	default:

		finalMessage="Lo siento, no entendi lo que quieres decir";
	}

	sendMessage(sender,finalMessage);



}


function sendMessage(sender,finalMessage){

	var MessageData={

			recipient:{
				id:sender
			},
			message:{
				text:finalMessage
			}


	}

	sendCallAPI(MessageData);
}

function sendCallAPI(MessageData){

	request({

		uri:config.URI,
		qs:{access_token:config.APP_TOKEN },
		method:'POST',
		json:MessageData

	},function(error,response,data){

		if(error){
			console.log("Error al enviar el mensaje");

		}else{

			console.log("Envio exitoso");

		}

	});
}

app.listen((process.env.PORT || 5000), () => console.log('El servidor webhook esta escuchando!'));

	
