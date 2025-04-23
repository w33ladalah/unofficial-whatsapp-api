# WhatsApp API

A Node.js TypeScript implementation for sending and receiving WhatsApp messages using the [Baileys](https://github.com/WhiskeySockets/Baileys) library.

## Updated Features

- Enhanced session management with automatic reconnection
- Improved error handling and logging
- Support for sending location and contact messages
- Added support for group messaging

## Updated Prerequisites

- Node.js (v16+ recommended)
- A WhatsApp account for testing

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

## Updated Usage

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

### Running Tests

To run the test suite:

```bash
npm test
```

### Debugging

To enable debugging logs, set the `DEBUG` environment variable:

```bash
DEBUG=whatsapp-api:* npm start
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
- Location messages
- Contact messages

## Handling Incoming Messages

The application automatically sets up listeners for incoming messages. You can customize the message handling logic in the `messageHandler.ts` file.

## Project Structure

- `/src`: Source code
  - `/controllers`: Message handling logic
  - `/types`: TypeScript type definitions
  - `/utils`: Utility functions for WhatsApp operations
- `/dist`: Compiled JavaScript code
- `/sessions`: WhatsApp session data

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch for your feature or bugfix
3. Commit your changes with clear messages
4. Submit a pull request

## Support

For issues or questions, please open an issue on GitHub or contact the maintainer.

## License

MIT

## Acknowledgements

- [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys) - The WhatsApp Web API library used in this project
