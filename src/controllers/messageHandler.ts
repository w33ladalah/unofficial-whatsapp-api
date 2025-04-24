import { WhatsAppClient, Message, SendMessageOptions } from '../types';
import { jidDecode } from '@whiskeysockets/baileys';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';

// Upload Excel handler
export const uploadExcel = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    if (!file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.path);
    const worksheet = workbook.worksheets[0];
    const numbers: string[] = [];
    worksheet.eachRow((row) => {
      const value = row.getCell(1).value;
      if (typeof value === 'string' && value.trim()) {
        numbers.push(value.trim());
      }
    });
    fs.unlinkSync(file.path); // Clean up
    res.json({ success: true, numbers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Download Template handler
export const downloadTemplate = async (req: Request, res: Response) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Numbers');
  worksheet.addRow(['+1234567890']);
  worksheet.addRow(['+0987654321']);
  const filePath = path.join(__dirname, '../../template.xlsx');
  await workbook.xlsx.writeFile(filePath);
  res.download(filePath, 'template.xlsx', () => {
    fs.unlinkSync(filePath); // Clean up
  });
};

// Bulk Send handler
export const sendBulk = async (req: Request, res: Response) => {
  try {
    const { recipients, message, type, url, caption } = req.body;
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ success: false, error: 'Recipients array required' });
    }
    // Use your WhatsApp client instance
    // @ts-ignore
    const whatsappClient: WhatsAppClient = req.app.get('whatsappClient');
    const results = [];
    for (const recipient of recipients) {
      try {
        if (type === 'text') {
          await sendTextMessage(whatsappClient, `${recipient}@s.whatsapp.net`, message);
          results.push({ recipient, status: 'sent' });
        } else {
          await sendMessage(whatsappClient, `${recipient}@s.whatsapp.net`, { [type]: { url, caption } });
          results.push({ recipient, status: 'sent' });
        }
      } catch (error: any) {
        results.push({ recipient, status: 'error', error: error.message });
      }
    }
    res.json({ success: true, results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};


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
