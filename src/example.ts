import { createWhatsAppClient } from './utils/whatsapp';
import { sendTextMessage, sendMessage } from './controllers/messageHandler';

/**
 * Example script demonstrating how to use the WhatsApp API
 */
async function runExample() {
  try {
    console.log('Starting WhatsApp API example...');

    // Create a WhatsApp client
    const client = await createWhatsAppClient();

    // Wait for connection to be established
    // It's important to wait for the QR code to be scanned if it's the first time
    console.log('Please scan the QR code if shown in the terminal');

    // Wait for a few seconds to ensure connection is established
    await new Promise(resolve => setTimeout(resolve, 5000));

    if (client.isConnected) {
      // Example: Sending a text message
      // Replace with the actual phone number in international format without + or spaces
      // For example, '1234567890' for a US number would be '1234567890@s.whatsapp.net'
      const recipientJid = "REPLACE_WITH_PHONE_NUMBER@s.whatsapp.net";

      // Send a simple text message
      await sendTextMessage(client, recipientJid, "Hello from WhatsApp API!");

      // Example: Sending an image with a caption (uncomment to use)
      /*
      await sendMessage(client, recipientJid, {
        image: {
          url: "https://example.com/image.jpg", // Replace with your image URL
          caption: "Check out this image!"
        }
      });
      */

      // Example: Sending a video with a caption (uncomment to use)
      /*
      await sendMessage(client, recipientJid, {
        video: {
          url: "https://example.com/video.mp4", // Replace with your video URL
          caption: "Check out this video!"
        }
      });
      */

      console.log('Messages sent successfully!');
    } else {
      console.log('WhatsApp client is not connected. Make sure to scan the QR code.');
    }

    // Keep the process running to receive messages
    console.log('Waiting for incoming messages... Press Ctrl+C to exit.');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down...');
      await client.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('Error in example:', error);
    process.exit(1);
  }
}

// Run the example
runExample();
