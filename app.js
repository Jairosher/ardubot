//importar los modulos a usar
const express= require('express');
const bodyParser= require('body-parser');
const request= require('request');
const config= require('./config');
var five = require("johnny-five");
var board = new five.Board({ port: process.env.SERIAL_PORT});
	console.log('Succesfull connection');
var ventilador=13;
var foco=12;


board.on("ready", function() {

var ventilador= new five.Led(13);
	ventilador.blink(1000);

var foco=new five.Led(foco);
    foco.off();

});

var app=express();

app.use(bodyParser.json());


app.listen((process.env.PORT || 3000), () => console.log('El servidor webhook esta escuchando!'));

   //app.listen(3000, function(){
     //   console.log('El servidor puerto 5000');
    //});

app.get('/', function(req,res){
	//res.sendFile(path.join(__dirname + '/index.html'));
	res.send('Bienvenidos al taller del ITGAM');

});

app.get('/webhook',function(req,res){


if(req.query['hub.verify_token']===config.FACEBOOK_TOKEN){

			res.send(req.query['hub.challenge']);					

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

function evaluateMessage(recipientId,message){
	var finalMessage="";

	if (isContain(message,'prender ventilador') || isContain(message,'Prender Ventilador')  ){

		VentiladorON(recipientId);

	}else if (isContain(message,'apagar ventilador') || isContain(message,'Apagar Ventilador')  ){

		VentiladorOFF(recipientId);

	}else if (isContain(message,'prender foco')|| isContain(message,'Prender Foco')){

		finalMessage="Lo siento, que es foco?";
	}else if (isContain(message,'apagar foco')|| isContain(message,'Apagar Foco')){
		finalMessage="Lo siento, que es foco?";
	}
	else{

		finalMessage="Lo siento, no entendi lo que quieres decir";
	}

	sendMessage(recipientId,finalMessage);



}

function isContain(sentece,word){

	return sentece.indexOf(word) > -1 

}

function sendMessage(recipientId,message){

	var MessageData={

			recipient:{
				id:recipientId
			},
			message:{
				text:message
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



function VentiladorON(recipientId){

  	ventilador.on();

  	var finalMessage="Ventilador Encendido";
	var MessageData={

			recipient:{
				id:recipientId
			},
			message:{
				text:finalMessage
			}

	}

	sendCallAPI(MessageData);

}


function VentiladorOFF(recipientId){

	ventilador.off();

  	var finalMessage="Ventilador Apagado";


	var MessageData={

			recipient:{
				id:recipientId
			},
			message:{
				text:finalMessage
			}


	}

	sendCallAPI(MessageData);

}

function focoON(recipientId){


	foco.on();

  	var finalMessage="Foco Prendido";


	var MessageData={

			recipient:{
				id:recipientId
			},
			message:{
				text:finalMessage
			}


	}

	sendCallAPI(MessageData);

}

function focoOFF(recipientId){


	foco.off();

  	var finalMessage="Foco Apagado";


	var MessageData={

			recipient:{
				id:recipientId
			},
			message:{
				text:finalMessage
			}


	}

	sendCallAPI(MessageData);

}
