import { NextRequest, NextResponse } from 'next/server';

// Esta es una API route de ejemplo para enviar mensajes de WhatsApp
// En producción, deberías usar un servicio como:
// - Twilio WhatsApp API
// - WhatsApp Business API
// - Meta Cloud API

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { celular, mensaje, fecha, hora } = body;

    // Aquí implementarías la lógica real de envío
    // Por ejemplo, con Twilio:
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    await client.messages.create({
      body: mensaje,
      from: 'whatsapp:+14155238886', // Tu número de Twilio
      to: `whatsapp:+54${celular}` // Número del cliente
    });
    */

    console.log('Enviando WhatsApp a:', celular);
    console.log('Mensaje:', mensaje);
    console.log('Fecha y hora del turno:', fecha, hora);

    // Simular éxito
    return NextResponse.json({
      success: true,
      message: 'Recordatorio programado exitosamente',
      data: {
        celular,
        fecha,
        hora,
        enviado: false, // En producción sería true después de enviar
        programado: true
      }
    });

  } catch (error) {
    console.error('Error al programar recordatorio:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al programar recordatorio'
      },
      { status: 500 }
    );
  }
}

// Función auxiliar para formatear el mensaje de recordatorio
export function generarMensajeRecordatorio(
  nombre: string,
  fecha: string,
  hora: string,
  direccion: string
): string {
  return `
🔔 *Recordatorio de tu turno*

Hola ${nombre}! 👋

Te recordamos que tienes un turno reservado:

📅 *Fecha:* ${fecha}
⏰ *Hora:* ${hora}
📍 *Lugar:* ${direccion}

✂️ ¡Te esperamos en Barbería El Estilo!

_Este es un mensaje automático. No responder._
  `.trim();
}