import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createWhatsAppClient } from './utils/whatsapp';
import { setupMessageHandlers } from './controllers';
import whatsappRoutes, { setWhatsAppClient } from './routes/whatsapp';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
import path from 'path';
app.use(express.static(path.resolve(process.cwd(), 'public')));

// API routes
app.use('/api/whatsapp', whatsappRoutes);


/**
 * Initialize WhatsApp client and start the server
 */
export async function startServer() {
  try {
    console.log('Initializing WhatsApp client...');

    // Create WhatsApp client
    const client = await createWhatsAppClient();

    // Set up message handlers
    setupMessageHandlers(client);

    // Set client for routes
    setWhatsAppClient(client);

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WhatsApp API endpoints available at http://localhost:${PORT}/api/whatsapp`);
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down server...');
      await client.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}
