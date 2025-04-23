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

// Create a client instance for managing WhatsApp connection
export class WhatsAppClientImpl implements WhatsAppClient {
  socket!: WASocket; // Using definite assignment assertion
  isConnected: boolean = false;

  private sessionId: string;
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
      printQRInTerminal: true, // Print QR code in terminal
      browser: ['WhatsApp API', 'Chrome', '4.0.0'], // Browser metadata
      syncFullHistory: true, // Sync message history
      logger // Pass the logger for all logging
    });

    // Setup event listeners
    this.socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

        console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);

        if (shouldReconnect) {
          await this.connect();
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
    if (this.socket) {
      await this.socket.end(undefined); // Passing undefined as the parameter
      this.isConnected = false;
      console.log('Disconnected from WhatsApp');
    }
  }
}

// Helper function to create a new WhatsApp client
export const createWhatsAppClient = async (sessionId: string = 'default'): Promise<WhatsAppClient> => {
  const client = new WhatsAppClientImpl(sessionId);
  await client.connect();
  return client;
};
