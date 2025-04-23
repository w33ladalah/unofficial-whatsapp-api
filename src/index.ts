import { createWhatsAppClient } from './utils/whatsapp';
import { setupMessageHandlers } from './controllers';
import * as qrcode from 'qrcode-terminal';

/**
 * Main function to initialize the WhatsApp API
 */
async function main() {
  try {
    console.log('Starting WhatsApp API...');

    // Create a WhatsApp client
    const client = await createWhatsAppClient();

    // Setup message handlers
    setupMessageHandlers(client);

    console.log('WhatsApp API is running!');

    // Keep the process alive
    process.on('SIGINT', async () => {
      console.log('Shutting down...');
      await client.disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start WhatsApp API:', error);
    process.exit(1);
  }
}

// Start the application
main();
