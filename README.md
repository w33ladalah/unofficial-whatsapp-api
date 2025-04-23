# WhatsApp API

A Node.js TypeScript implementation for sending and receiving WhatsApp messages using the [Baileys](https://github.com/WhiskeySockets/Baileys) library.

## Features

- Send and receive WhatsApp messages
- Support for text, image, video, audio, and sticker messages
- Session management for persistent authentication
- TypeScript support for better developer experience and type safety

## Prerequisites

- Node.js (v14+ recommended)
- A WhatsApp account for testing

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

## Usage

### Building the project

```bash
npm run build
```

### Running in development mode

```bash
npm run dev
```

### Running in production mode

```bash
npm start
```

## Authentication

When you run the application for the first time, a QR code will be displayed in the terminal. Scan this QR code using your WhatsApp mobile app:

1. Open WhatsApp on your phone
2. Tap Menu or Settings and select Linked Devices
3. Tap on "Link a Device"
4. Scan the QR code displayed in your terminal

The session will be saved in the `sessions` directory, so you won't need to scan the QR code again unless the session expires or is deleted.

## Sending Messages

The application provides functions to send different types of messages:

```typescript
// Example: Sending a text message
import { createWhatsAppClient, sendTextMessage } from './src/utils/whatsapp';

async function sendMessage() {
  const client = await createWhatsAppClient();

  // Phone number must include country code without + or 00
  const recipientJid = "1234567890@s.whatsapp.net";

  await sendTextMessage(client, recipientJid, "Hello from WhatsApp API!");
}
```

### Message Types

You can send various types of messages:

- Text messages
- Images with captions
- Videos with captions
- Audio messages
- Stickers

## Handling Incoming Messages

The application automatically sets up listeners for incoming messages. You can customize the message handling logic in the `messageHandler.ts` file.

## Project Structure

- `/src`: Source code
  - `/controllers`: Message handling logic
  - `/types`: TypeScript type definitions
  - `/utils`: Utility functions for WhatsApp operations
- `/dist`: Compiled JavaScript code
- `/sessions`: WhatsApp session data

## License

MIT

## Acknowledgements

- [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys) - The WhatsApp Web API library used in this project
