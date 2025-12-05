const eventCompletedTemplate = (event, user, surveyLink) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content { 
          padding: 40px 30px;
          background: white;
        }
        .info-box { 
          background: #f8f9fa; 
          padding: 20px; 
          border-left: 4px solid #667eea; 
          margin: 25px 0;
          border-radius: 4px;
        }
        .info-box p {
          margin: 8px 0;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button { 
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff !important;
          padding: 16px 40px;
          text-decoration: none;
          border-radius: 50px;
          font-weight: bold;
          font-size: 16px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .link-text {
          margin-top: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 5px;
          font-size: 13px;
          color: #666;
          word-break: break-all;
        }
        .link-text a {
          color: #667eea;
          text-decoration: none;
        }
        .footer { 
          text-align: center; 
          padding: 20px 30px;
          background: #f8f9fa;
          color: #666; 
          font-size: 12px;
          border-top: 1px solid #e0e0e0;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Evento Completado</h1>
        </div>
        
        <div class="content">
          <p>Hola <strong>${user.Names}</strong>,</p>
          <p>Nos complace informarte que tu evento "<strong>${event.EventName}</strong>" se ha completado exitosamente.</p>
          
          <div class="info-box">
            <p><strong>Fecha:</strong> ${new Date(event.EventDateTime).toLocaleString('es-ES')}</p>
            <p><strong>Ubicación:</strong> ${event.Address}</p>
          </div>
          
          <p>Tu opinión es muy importante para nosotros. Te invitamos a completar una breve encuesta sobre tu experiencia:</p>
          
          <div class="button-container">
            <a href="${surveyLink}" class="button">Completar Encuesta</a>
          </div>
          
          <div class="link-text">
            <p style="margin: 0 0 10px 0;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <a href="${surveyLink}">${surveyLink}</a>
          </div>
          
          <p style="margin-top: 30px; color: #666;">Gracias por confiar en Happy-Art Eventos.</p>
        </div>
        
        <div class="footer">
          <p><strong>Happy-Art Eventos</strong> | ${new Date().getFullYear()}</p>
          <p>Este es un correo automático, por favor no responder.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = eventCompletedTemplate;