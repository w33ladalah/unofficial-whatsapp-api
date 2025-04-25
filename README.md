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

### Web UI QR Code Login

You can now authenticate using a simple web UI:

1. Start the server (`npm run dev` or `npm start`).
2. Open your browser and go to [http://localhost:3002/](http://localhost:3002/).
3. When prompted, enter your API token (see `.env` file, `API_TOKEN`).
4. The UI will display a QR code—scan it using your WhatsApp mobile app:
    - Open WhatsApp on your phone
    - Tap Menu or Settings and select Linked Devices
    - Tap on "Link a Device"
    - Scan the QR code displayed in your browser
5. After successful authentication, a "Login Success!" message will appear.

#### Changing the API Token
- Click the "Change API Token" button at any time to enter a new token.
- The token is stored in your browser's local storage for convenience and security.

#### Troubleshooting
- If you see an error like `Forbidden: Invalid or missing API token in header`, make sure your API token matches the value in your `.env` file.
- If you see `Cannot GET /` or the UI does not load, ensure the server is running and you have navigated to the correct port (`3002` by default).

### Terminal QR Code (Legacy)

The session will also be saved in the `sessions` directory, so you won't need to scan the QR code again unless the session expires or is deleted.

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
