import { WASocket, proto } from '@whiskeysockets/baileys';

/**
 * WhatsApp client interface
 */
export interface WhatsAppClient {
  socket: WASocket;
  isConnected: boolean;
  disconnect(): Promise<void>;

  /**
   * Authenticate the WhatsApp client
   * @returns A promise that resolves when authentication is successful
   */
  authenticate(): Promise<string>;
}

/**
 * WhatsApp message type
 */
export type Message = proto.IWebMessageInfo;

/**
 * Options for sending WhatsApp messages
 */
export interface SendMessageOptions {
  text?: string;
  image?: {
    url: string;
    caption?: string;
  };
  video?: {
    url: string;
    caption?: string;
  };
  audio?: {
    url: string;
  };
  sticker?: {
    url: string;
  };
}

/**
 * Type for WhatsApp message content
 */
export interface MessageContent {
  text?: string;
  media?: {
    url: string;
    mimetype?: string;
    caption?: string;
  };
  location?: {
    degreesLatitude: number;
    degreesLongitude: number;
  };
  contact?: {
    displayName: string;
    vcard: string;
  };
}
