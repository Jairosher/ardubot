// Importar las dependencias para configurar el servidor
var express = require("express");
var bodyParser = require("body-parser");
var request = require("request");
var config= require("./config");
var app = express();

var five = require("johnny-five");
var board = new five.Board();
var ventilador=13;
var foco=12;


board.on("ready", function() {

var ventilador= new five.Led(ventilador);
	ventilador.off();

var foco=new five.Led(foco);
    foco.off();

});


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
// configurar el puerto y el mensaje en caso de exito
app.listen((process.env.PORT || 5000), () => console.log('El servidor webhook esta escuchando!'));

// Ruta de la pagina index
app.get("/", function (req, res) {
    res.send("Se ha desplegado de manera exitosa el anyhelpec ChatBot :D!!!");
});

// Facebook Webhook

// Usados para la verificacion
app.get("/webhook", function (req, res) {
    // Verificar la coincidendia del token
    if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
        // Mensaje de exito y envio del token requerido
        console.log("webhook verificado!");
        res.status(200).send(req.query["hub.challenge"]);
    } else {
        // Mensaje de fallo
        console.error("La verificacion ha fallado, porque los tokens no coinciden");
        res.sendStatus(403);
    }
});

// Todos eventos de mesenger sera apturados por esta ruta
app.post("/webhook", function (req, res) {
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

		focoON(recipientId);
	}else if (isContain(message,'apagar foco')|| isContain(message,'Apagar Foco')){
		focoOFF(recipientId);
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
