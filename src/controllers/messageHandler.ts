import { WhatsAppClient, Message, SendMessageOptions } from '../types';
import { Boom } from '@hapi/boom';
import { jidDecode } from '@whiskeysockets/baileys';

/**
 * Set up message handlers for the WhatsApp client
 * @param client The WhatsApp client instance
 */
export function setupMessageHandlers(client: WhatsAppClient): void {
  if (!client.socket) {
    throw new Error('WhatsApp client is not initialized');
  }

  // Listen for incoming messages
  client.socket.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.key.fromMe && m.type === 'notify') {
      await handleIncomingMessage(client, msg);
    }
  });

  console.log('Message handlers have been set up');
}

/**
 * Handle incoming messages
 * @param client The WhatsApp client
 * @param message The incoming message
 */
async function handleIncomingMessage(client: WhatsAppClient, message: Message): Promise<void> {
  if (!client.socket || !message) return;

  try {
    const remoteJid = message.key.remoteJid;
    if (!remoteJid) return;

    // Extract message content
    const messageContent = message.message;
    if (!messageContent) return;

    // Get text message content if available
    const textMessage = messageContent.conversation ||
                        messageContent.extendedTextMessage?.text ||
                        messageContent.imageMessage?.caption ||
                        messageContent.videoMessage?.caption;

    // Log the message details
    console.log(`New message from ${remoteJid}: ${textMessage || '[Media Message]'}`);

    // Example: Echo back text messages (remove this in production)
    if (textMessage) {
      if (textMessage.toLowerCase() === 'ping') {
        await sendTextMessage(client, remoteJid, 'Pong!');
      } else {
        // Echo the message back
        await sendTextMessage(client, remoteJid, `You said: ${textMessage}`);
      }
    }
  } catch (error) {
    console.error('Error handling incoming message:', error);
  }
}

/**
 * Send a text message
 * @param client The WhatsApp client
 * @param recipientJid The recipient's JID
 * @param text The message text
 */
export async function sendTextMessage(
  client: WhatsAppClient,
  recipientJid: string,
  text: string
): Promise<void> {
  if (!client.socket || !client.isConnected) {
    throw new Error('WhatsApp client is not connected');
  }

  try {
    await client.socket.sendMessage(recipientJid, { text });
    console.log(`Message sent to ${recipientJid}: ${text}`);
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Send a message with various content options
 * @param client The WhatsApp client
 * @param recipientJid The recipient's JID
 * @param options The message options (text, image, video, etc.)
 */
export async function sendMessage(
  client: WhatsAppClient,
  recipientJid: string,
  options: SendMessageOptions
): Promise<void> {
  if (!client.socket || !client.isConnected) {
    throw new Error('WhatsApp client is not connected');
  }

  try {
    if (options.text) {
      await client.socket.sendMessage(recipientJid, { text: options.text });
    } else if (options.image) {
      await client.socket.sendMessage(recipientJid, {
        image: { url: options.image.url },
        caption: options.image.caption
      });
    } else if (options.video) {
      await client.socket.sendMessage(recipientJid, {
        video: { url: options.video.url },
        caption: options.video.caption
      });
    } else if (options.audio) {
      await client.socket.sendMessage(recipientJid, {
        audio: { url: options.audio.url },
        mimetype: 'audio/mp4'
      });
    } else if (options.sticker) {
      await client.socket.sendMessage(recipientJid, {
        sticker: { url: options.sticker.url }
      });
    }

    console.log(`Message sent to ${recipientJid}`);
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Extract user information from JID
 * @param jid The JID string
 * @returns The extracted user information
 */
export function extractUserInfo(jid: string): { user: string, server: string, device?: string } {
  const decoded = jidDecode(jid);
  if (!decoded) {
    throw new Error('Invalid JID');
  }
  return {
    user: decoded.user,
    server: decoded.server,
    device: decoded.device ? String(decoded.device) : undefined
  };
}
