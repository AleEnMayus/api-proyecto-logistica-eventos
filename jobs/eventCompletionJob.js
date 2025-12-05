const cron = require('node-cron');
const db = require('../db');
const { sendEventCompletedEmail } = require('../services/emailService');

const startEventCompletionJob = () => {
  cron.schedule('30 0 * * *', async () => {
    console.log('Verificando eventos completados...');
    
    try {
      const [events] = await db.query(`
        SELECT e.*, u.Email, u.Names 
        FROM Events e
        JOIN User u ON e.ClientId = u.UserId
        WHERE e.EventStatus = 'Completed'
          AND e.EventDateTime >= DATE_SUB(NOW(), INTERVAL 1 DAY)
          AND e.EventDateTime < NOW()
      `);

      console.log(`Encontrados ${events.length} eventos para notificar`);

      for (const event of events) {
        await sendEventCompletedEmail(event, {
          Email: event.Email,
          Names: event.Names
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error('Error en job de eventos:', error);
    }
  });

  console.log('Job de eventos completados iniciado');
};

module.exports = { startEventCompletionJob };