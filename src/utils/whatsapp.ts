// Import necessary modules
import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { WhatsAppClient } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';

// Define log level type
type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

// Ensure the sessions directory exists
const SESSIONS_DIR = path.join(process.cwd(), 'sessions');
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// Define a logger that matches the ILogger interface expected by Baileys
const createLogger = (level: LogLevel = 'info') => ({
  level,
  debug: (...args: any[]) => level === 'debug' && console.debug(...args),
  info: (...args: any[]) => (level === 'debug' || level === 'info') && console.info(...args),
  warn: (...args: any[]) => console.warn(...args),
  error: (...args: any[]) => console.error(...args),
  trace: (...args: any[]) => console.trace(...args),
  // Create a new logger with the same settings but potentially different level
  child: (opts: any) => createLogger(opts.level || level)
});

// Create an event emitter to share the QR code
export const qrCodeEmitter = new EventEmitter();

// Create a client instance for managing WhatsApp connection
export class WhatsAppClientImpl implements WhatsAppClient {
  socket!: WASocket; // Using definite assignment assertion
  isConnected: boolean = false;
  private sessionId: string; // Used to identify the session directory
  private sessionDir: string;

  constructor(sessionId: string = 'default') {
    this.sessionId = sessionId;
    this.sessionDir = path.join(SESSIONS_DIR, sessionId);

    // Create the session directory if it doesn't exist
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  async connect(): Promise<WASocket> {
    // Get authentication state
    const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir);

    // Fetch latest version of Baileys
    const { version } = await fetchLatestBaileysVersion();

    // Create a logger that satisfies the Baileys ILogger interface
    const logger = createLogger('info');

    // Create a WhatsApp socket
    this.socket = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      printQRInTerminal: false, // Disable printing QR in terminal
      browser: ['WhatsApp API', 'Chrome', '4.0.0'], // Browser metadata
      syncFullHistory: true, // Sync message history
      logger // Pass the logger for all logging
    });

    // Emit the QR code when it is generated
    this.socket.ev.on('connection.update', (update) => {
      const { connection, qr, lastDisconnect } = update as any;

      if (qr) {
        qrCodeEmitter.emit('qr', qr);
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

        console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);

        if (shouldReconnect) {
          this.connect().catch(console.error);
        } else {
          console.log('Connection closed. Logged out.');
          this.isConnected = false;
        }
      } else if (connection === 'open') {
        console.log('Connection opened');
        this.isConnected = true;
      }
    });

    // Save credentials when updated
    this.socket.ev.on('creds.update', saveCreds);

    return this.socket;
  }

  async disconnect(): Promise<void> {
    this.socket.end(undefined); // No need for 'await' here
    this.isConnected = false;
    console.log('Disconnected from WhatsApp');
  }

  /**
   * Authenticate the WhatsApp client
   * @returns A promise that resolves when authentication is successful
   */
  async authenticate(): Promise<string> {
    if (!this.socket) {
      throw new Error('WhatsApp client is not initialized');
    }

    return new Promise((resolve, reject) => {
      this.socket.ev.on('connection.update', (update: Partial<{ qr: string }>) => {
        if (update.qr) {
          qrCodeEmitter.emit('qr', update.qr);
        }
      });

      this.socket.ev.on('connection.update', (update) => {
        if (update.connection === 'open') {
          resolve('Authentication successful');
        } else if (update.connection === 'close') {
          reject(new Error('Authentication failed'));
        }
      });
    });
  }
} // Correctly close the class block

// Helper function to create a new WhatsApp client
export const createWhatsAppClient = async (sessionId: string = 'default'): Promise<WhatsAppClient> => {
  const client = new WhatsAppClientImpl(sessionId);
  await client.connect();
  return client;
};
