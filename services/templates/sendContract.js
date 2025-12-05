const sendContractTemplate = (eventData, accion, contractNumber) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #2c3e50;">Hola ${eventData.Names},</h2>
          <p>Se ha <strong>${accion}</strong> un contrato para tu evento <strong>${eventData.EventName}</strong>.</p>
          <p><strong>Número de contrato:</strong> ${contractNumber}</p>
          <p>El contrato se adjunta en este correo. Por favor revísalo y contáctanos si tienes alguna duda.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #7f8c8d; font-size: 12px;">Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>
      </body>
    </html>
  `;

module.exports = sendContractTemplate;