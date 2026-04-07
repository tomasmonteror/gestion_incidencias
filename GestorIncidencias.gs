// --- CONFIGURACIÓN GENERAL ---
var API_KEY = 'PegaAquiTuAPIKey';
var API_TOKEN = 'PegaAquiTuToken';
var LIST_INBOX_ID = 'PegaAquiElIDDeLaBandejaDeEntrada';
var LIST_RESUELTO_ID = 'PegaAquiElIDDeLaListaResuelto';
var LIST_BLOQUEADA_ID = 'PegaAquiElIDDeLaListaBloqueada';

// =========================================================================
// FUNCIÓN 1: Crea la tarjeta, lee las columnas y ASIGNA COLOR DE URGENCIA
// =========================================================================
function enviarATrelloDesdeHoja(e) {
  var correo = e.values[1]; 
  var titulo = e.values[2]; 
  var fechaHora = e.values[3]; 
  var naturaleza = e.values[4]; 
  var descripcion = e.values[5]; 
  var urgencia = e.values[6]; // Aquí viene el nivel del 1 al 5
  
  var ubicacionGeneral = e.values[7];
  var aulaEsoBach = e.values[8];
  var aulaFp = e.values[9];
  var infoFp = e.values[10];
  var lugarInfo = e.values[11];
  var infoAdicional = e.values[12];
  var aulaIncidencia = e.values[13];
  var ubicacionDetectada = e.values[14];
  var infoOtras = e.values[15];
  var adjunto = e.values[16]; 

  var tituloTarjeta = "[Nivel " + urgencia + "] " + titulo;

  var cuerpoTarjeta = "**Naturaleza:** " + naturaleza + "\n";
  cuerpoTarjeta += "**Cuándo ocurrió:** " + fechaHora + "\n\n";

  cuerpoTarjeta += "**📍 UBICACIÓN:**\n";
  if (ubicacionGeneral) cuerpoTarjeta += "- General: " + ubicacionGeneral + "\n";
  if (aulaEsoBach) cuerpoTarjeta += "- ESO/Bachillerato: " + aulaEsoBach + "\n";
  if (aulaFp) cuerpoTarjeta += "- FP: " + aulaFp + "\n";
  if (lugarInfo) cuerpoTarjeta += "- Info adicional lugar: " + lugarInfo + "\n";
  if (aulaIncidencia) cuerpoTarjeta += "- Aula incidencia: " + aulaIncidencia + "\n";
  if (ubicacionDetectada) cuerpoTarjeta += "- Detectado en: " + ubicacionDetectada + "\n";
   

  cuerpoTarjeta += "\n**📝 DESCRIPCIÓN:**\n" + descripcion + "\n";
  if (infoAdicional) cuerpoTarjeta += "- Info adicional: " + infoAdicional + "\n";
  if (infoFp) cuerpoTarjeta += "- Info FP: " + infoFp + "\n";
  if (infoOtras) cuerpoTarjeta += "- Otras dependencias: " + infoOtras + "\n";

  if (adjunto) {
    cuerpoTarjeta += "\n**📎 ARCHIVO adjunto:** " + adjunto + "\n";
  }

  cuerpoTarjeta += "\n---\nEMAIL_CONTACTO: " + correo;

  // 1. CREAR LA TARJETA Y CAPTURAR SU ID
  var urlCrear = 'https://api.trello.com/1/cards?key=' + API_KEY + '&token=' + API_TOKEN;
  var payloadCrear = {
    'idList': LIST_INBOX_ID,
    'name': tituloTarjeta,
    'desc': cuerpoTarjeta,
    'pos': 'top'
  };

  var respuesta = UrlFetchApp.fetch(urlCrear, {
    'method': 'post',
    'payload': payloadCrear
  });
  
  var datosTarjeta = JSON.parse(respuesta.getContentText());
  var CARD_ID = datosTarjeta.id; // ¡Atrapamos el ID de la tarjeta recién creada!

  // 2. AVERIGUAR QUÉ COLOR TOCA SEGÚN EL NÚMERO
  var colorAsignado = '';
  var textoUrgencia = String(urgencia);
  
  if (textoUrgencia.indexOf('1') !== -1) colorAsignado = 'green';
  else if (textoUrgencia.indexOf('2') !== -1) colorAsignado = 'yellow';
  else if (textoUrgencia.indexOf('3') !== -1) colorAsignado = 'orange';
  else if (textoUrgencia.indexOf('4') !== -1) colorAsignado = 'red';
  else if (textoUrgencia.indexOf('5') !== -1) colorAsignado = 'purple';

  // 3. PONERLE LA ETIQUETA DE COLOR A LA TARJETA
  if (colorAsignado !== '') {
    var urlLabel = 'https://api.trello.com/1/cards/' + CARD_ID + '/labels?key=' + API_KEY + '&token=' + API_TOKEN;
    UrlFetchApp.fetch(urlLabel, {
      'method': 'post',
      'payload': {
        'color': colorAsignado,
        'name': 'Urgencia ' + urgencia
      }
    });
  }

  // 4. AÑADIR EL ADJUNTO COMO ARCHIVO NATIVO EN TRELLO
  if (adjunto && adjunto.trim() !== '') {
    // Si el usuario sube varias fotos, Google las separa por comas. Las separamos:
    var listaAdjuntos = adjunto.split(','); 
    
    for (var a = 0; a < listaAdjuntos.length; a++) {
      var enlaceLimpio = listaAdjuntos[a].trim();
      var urlAttachment = 'https://api.trello.com/1/cards/' + CARD_ID + '/attachments?key=' + API_KEY + '&token=' + API_TOKEN;
      
      UrlFetchApp.fetch(urlAttachment, {
        'method': 'post',
        'payload': {
          'url': enlaceLimpio,
          'name': 'Archivo adjunto ' + (a + 1)
        }
      });
    }
  }
}

// =========================================================================
// FUNCIÓN 2: Revisa las listas BLOQUEADA y RESUELTA para avisar al profesor
// =========================================================================
function notificarResueltos() {
  
  // -----------------------------------------------------------------------
  // 1. REVISAR LA COLUMNA: BLOQUEADA
  // -----------------------------------------------------------------------
  var urlBloqueadas = 'https://api.trello.com/1/lists/' + LIST_BLOQUEADA_ID + '/cards?key=' + API_KEY + '&token=' + API_TOKEN + '&actions=commentCard';
  var respBloqueadas = UrlFetchApp.fetch(urlBloqueadas);
  var tarjBloqueadas = JSON.parse(respBloqueadas.getContentText());

  for (var i = 0; i < tarjBloqueadas.length; i++) {
    var tarjeta = tarjBloqueadas[i];
    
    // Si no tiene el reloj de arena [⏳] ni el check [✓], significa que es nueva en esta columna
    if (tarjeta.name.indexOf('[⏳]') === -1 && tarjeta.name.indexOf('[✓]') === -1) { 
      var regex = /EMAIL_CONTACTO:\s*([^\s]+)/;
      var coincidencia = tarjeta.desc.match(regex);
      
      if (coincidencia && coincidencia[1]) {
        var emailDestino = coincidencia[1];
        // Limpiamos cualquier etiqueta previa entre corchetes (ej. [Nivel 4]) para que el asunto quede bonito
        var nombreLimpio = tarjeta.name.replace(/\[.*?\]\s*/g, ''); 
        var asunto = "⚠️ Incidencia en espera: " + nombreLimpio;
        
        var motivoBloqueo = "Estamos a la espera de recibir material o necesitamos revisarlo con más profundidad."; 
        if (tarjeta.actions && tarjeta.actions.length > 0) {
          for (var j = 0; j < tarjeta.actions.length; j++) {
            var textoComentario = tarjeta.actions[j].data.text;
            // Ignoramos el mensaje automático del bot de Trello
            if (textoComentario.indexOf('¡Atención!') === -1) {
              motivoBloqueo = textoComentario;
              break; 
            }
          }
        }

        var detallesCrudos = tarjeta.desc.split('---')[0];
        var detallesLimpios = detallesCrudos.replace(/\*\*/g, '').trim();
        
        var cuerpoMensaje = "Hola,\n\nTe escribimos desde el equipo de resolución de incidencias para informarte de que la resolución de tu incidencia ha quedado pausada temporalmente por la siguiente razón:\n\n";
        cuerpoMensaje += "⚠️ MOTIVO DEL BLOQUEO:\n" + motivoBloqueo + "\n\n";
        cuerpoMensaje += "--------------------------------------------------\n";
        cuerpoMensaje += "TÍTULO: " + nombreLimpio + "\n";
        cuerpoMensaje += detallesLimpios + "\n";
        cuerpoMensaje += "--------------------------------------------------\n\n";
        cuerpoMensaje += "Te volveremos a avisar en cuanto la incidencia quede solucionada.\n\n¡Un saludo!";
        
        GmailApp.sendEmail(emailDestino, asunto, cuerpoMensaje);
        
        // Le ponemos el [⏳] a la tarjeta en Trello para no repetir el aviso
        var nuevoNombre = "[⏳] " + tarjeta.name;
        var urlActualizar = 'https://api.trello.com/1/cards/' + tarjeta.id + '?key=' + API_KEY + '&token=' + API_TOKEN + '&name=' + encodeURIComponent(nuevoNombre);
        UrlFetchApp.fetch(urlActualizar, {'method': 'put'});
      }
    }
  }

  // -----------------------------------------------------------------------
  // 2. REVISAR LA COLUMNA: RESUELTA
  // -----------------------------------------------------------------------
  var urlResueltas = 'https://api.trello.com/1/lists/' + LIST_RESUELTO_ID + '/cards?key=' + API_KEY + '&token=' + API_TOKEN + '&actions=commentCard';
  var respResueltas = UrlFetchApp.fetch(urlResueltas);
  var tarjResueltas = JSON.parse(respResueltas.getContentText());

  for (var k = 0; k < tarjResueltas.length; k++) {
    var tarjetaRes = tarjResueltas[k];
    
    if (tarjetaRes.name.indexOf('[✓]') === -1) { 
      var regexRes = /EMAIL_CONTACTO:\s*([^\s]+)/;
      var coincidenciaRes = tarjetaRes.desc.match(regexRes);
      
      if (coincidenciaRes && coincidenciaRes[1]) {
        var emailDestinoRes = coincidenciaRes[1];
        var nombreLimpioRes = tarjetaRes.name.replace(/\[.*?\]\s*/g, ''); 
        var asuntoRes = "✅ Incidencia solucionada: " + nombreLimpioRes;
        
        var comentarioResolucion = "El equipo de resolucíon de incidencias ha revisado y solucionado esta incidencia."; 
        if (tarjetaRes.actions && tarjetaRes.actions.length > 0) {
          for (var m = 0; m < tarjetaRes.actions.length; m++) {
            var textoComentarioRes = tarjetaRes.actions[m].data.text;
            if (textoComentarioRes.indexOf('¡Buen trabajo') === -1 && textoComentarioRes.indexOf('¡Atención!') === -1) {
              comentarioResolucion = textoComentarioRes;
              break; 
            }
          }
        }

        var detallesCrudosRes = tarjetaRes.desc.split('---')[0];
        var detallesLimpiosRes = detallesCrudosRes.replace(/\*\*/g, '').trim();
        
        var cuerpoMensajeRes = "Hola,\n\nTe escribimos desde el equipo de resolucíon de incidencias para confirmarte que la siguiente incidencia ha sido solucionada:\n\n";
        cuerpoMensajeRes += "--------------------------------------------------\n";
        cuerpoMensajeRes += "TÍTULO: " + nombreLimpioRes + "\n";
        cuerpoMensajeRes += detallesLimpiosRes + "\n";
        cuerpoMensajeRes += "--------------------------------------------------\n\n";
        cuerpoMensajeRes += "🛠️ NOTAS DE RESOLUCIÓN DEL TÉCNICO:\n";
        cuerpoMensajeRes += comentarioResolucion + "\n\n";
        cuerpoMensajeRes += "¿Todo funciona bien ahora? Si el problema persiste, no dudes en volver a avisarnos.\n\n¡Un saludo y buena clase!";
        
        GmailApp.sendEmail(emailDestinoRes, asuntoRes, cuerpoMensajeRes);
        
        // Si venía de "Bloqueada", le limpiamos el reloj de arena antes de ponerle el check definitivo
        var nombreSinReloj = tarjetaRes.name.replace('[⏳] ', '');
        var nuevoNombreRes = "[✓] " + nombreSinReloj;
        var urlActualizarRes = 'https://api.trello.com/1/cards/' + tarjetaRes.id + '?key=' + API_KEY + '&token=' + API_TOKEN + '&name=' + encodeURIComponent(nuevoNombreRes);
        UrlFetchApp.fetch(urlActualizarRes, {'method': 'put'});
      }
    }
  }
}
