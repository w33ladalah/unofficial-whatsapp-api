import express, { Request, Response, NextFunction } from 'express';
import { WhatsAppClient, SendMessageOptions } from '../types';
import { sendTextMessage, sendMessage } from '../controllers/messageHandler';
import { qrCodeEmitter, getLatestQrCode } from '../utils/whatsapp';

// Middleware for token-based authentication
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization'];

  if (!token || token !== process.env.API_TOKEN) {
    return res.status(403).json({ success: false, error: 'Forbidden: Invalid or missing token' });
  }

  next();
};

// Initialize router
const router: express.Router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Store the client instance
let whatsappClient: WhatsAppClient;

// Set the WhatsApp client instance
export function setWhatsAppClient(client: WhatsAppClient) {
  whatsappClient = client;
}

/**
 * @route   POST /api/whatsapp/send/text
 * @desc    Send a text message
 * @access  Public
 */
router.post('/send/text', function(req, res) {
  const sendText = async () => {
    try {
      const { recipient, message } = req.body;

      if (!recipient || !message) {
        return res.status(400).json({ success: false, error: 'Recipient and message are required' });
      }

      // Format the recipient to proper WhatsApp JID if needed
      const recipientJid = recipient.includes('@s.whatsapp.net')
        ? recipient
        : `${recipient}@s.whatsapp.net`;

      await sendTextMessage(whatsappClient, recipientJid, message);

      res.status(200).json({
        success: true,
        message: 'Message sent successfully',
        data: {
          recipient: recipientJid,
          messageContent: message
        }
      });

    } catch (error: any) {
      console.error('Error sending text message:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error sending message'
      });
    }
  };

  sendText();
});

/**
 * @route   POST /api/whatsapp/send/media
 * @desc    Send a media message (image, video, audio, sticker)
 * @access  Public
 */
router.post('/send/media', function(req, res) {
  const sendMedia = async () => {
    try {
      const { recipient, type, url, caption } = req.body;

      if (!recipient || !type || !url) {
        return res.status(400).json({
          success: false,
          error: 'Recipient, media type, and url are required'
        });
      }

      const recipientJid = recipient.includes('@s.whatsapp.net')
        ? recipient
        : `${recipient}@s.whatsapp.net`;

      const options: SendMessageOptions = {};

      // Set up options based on media type
      switch(type.toLowerCase()) {
        case 'image':
          options.image = { url, caption };
          break;
        case 'video':
          options.video = { url, caption };
          break;
        case 'audio':
          options.audio = { url };
          break;
        case 'sticker':
          options.sticker = { url };
          break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid media type. Supported types: image, video, audio, sticker'
          });
      }

      await sendMessage(whatsappClient, recipientJid, options);

      res.status(200).json({
        success: true,
        message: `${type} message sent successfully`,
        data: {
          recipient: recipientJid,
          mediaType: type,
          url: url
        }
      });

    } catch (error: any) {
      console.error('Error sending media message:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error sending media message'
      });
    }
  };

  sendMedia();
});

/**
 * @route   GET /api/whatsapp/status
 * @desc    Get WhatsApp connection status
 * @access  Public
 */
router.get('/status', (req: Request, res: Response) => {
  if (!whatsappClient) {
    return res.status(500).json({
      success: false,
      error: 'WhatsApp client not initialized'
    });
  }

  res.status(200).json({
    success: true,
    connected: whatsappClient.isConnected
  });
});

/**
 * @route   GET /api/whatsapp/qr
 * @desc    Get the QR code for WhatsApp authentication
 * @access  Public
 */
router.get('/qr', (req: Request, res: Response) => {
  console.log('QR code generation requested'); // Debugging log

  const latestQr = getLatestQrCode();
  if (latestQr) {
    console.log('Returning buffered QR code:', latestQr);
    return res.status(200).json({ success: true, qr: latestQr });
  }

  qrCodeEmitter.once('qr', (qrCode: string) => {
    console.log('QR code emitted:', qrCode); // Debugging log
    res.status(200).json({ success: true, qr: qrCode });
  });

  // If no QR code is emitted within 20 seconds, return a timeout response
  setTimeout(() => {
    console.error('QR code generation timed out'); // Debugging log
    res.status(408).json({ success: false, error: 'QR code generation timed out' });
  }, 20000); // Increased timeout to 20 seconds
});

/**
 * @route   POST /api/whatsapp/auth
 * @desc    Perform WhatsApp authentication
 * @access  Public
 */
router.post('/auth', async (req: Request, res: Response) => {
  try {
    if (!whatsappClient) {
      return res.status(500).json({
        success: false,
        error: 'WhatsApp client not initialized'
      });
    }

    // Trigger authentication process
    const authResult = await whatsappClient.authenticate();

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: authResult
    });
  } catch (error: any) {
    console.error('Error during WhatsApp authentication:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error during authentication'
    });
  }
});

export default router;
