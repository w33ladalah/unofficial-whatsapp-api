# WhatsApp API Documentation

This documentation provides details on how to interact with the WhatsApp API endpoints.

## Base URL

```
http://localhost:3000/api/whatsapp
```

## Authentication

All API requests require an `Authorization` header with a valid token. The token can be set as an environment variable `API_TOKEN`.

### Example

Include the token in the `Authorization` header:

```bash
curl -X GET http://localhost:3000/api/whatsapp/status \
  -H "Authorization: YOUR_API_TOKEN"
```

## Endpoints

### Check Connection Status

Check if the WhatsApp client is connected.

```
GET /status
```

**Response**

```json
{
  "success": true,
  "connected": true
}
```

### Send Text Message

Send a text message to a WhatsApp number.

```
POST /send/text
```

**Request Body**

```json
{
  "recipient": "6281234567890",
  "message": "Hello from WhatsApp API!"
}
```

Note: The `recipient` should be the phone number with country code without the '+' symbol. The API will automatically format it to the proper WhatsApp JID.

**Response**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "recipient": "6281234567890@s.whatsapp.net",
    "messageContent": "Hello from WhatsApp API!"
  }
}
```

### Send Media Message

Send a media message (image, video, audio, or sticker) to a WhatsApp number.

```
POST /send/media
```

**Request Body**

```json
{
  "recipient": "6281234567890",
  "type": "image",
  "url": "https://example.com/image.jpg",
  "caption": "Check out this image!"
}
```

Supported media types:
- `image`: Sends an image (supports caption)
- `video`: Sends a video (supports caption)
- `audio`: Sends an audio file
- `sticker`: Sends a sticker

**Response**

```json
{
  "success": true,
  "message": "image message sent successfully",
  "data": {
    "recipient": "6281234567890@s.whatsapp.net",
    "mediaType": "image",
    "url": "https://example.com/image.jpg"
  }
}
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message details"
}
```

Common error codes:
- `400`: Bad Request - Missing required parameters
- `500`: Server Error - Server-side error occurred

## Testing with cURL

### Check Status

```bash
curl http://localhost:3000/api/whatsapp/status
```

### Send Text Message

```bash
curl -X POST http://localhost:3000/api/whatsapp/send/text \
  -H "Content-Type: application/json" \
  -d '{"recipient":"6281234567890", "message":"Hello from WhatsApp API!"}'
```

### Send Media Message

```bash
curl -X POST http://localhost:3000/api/whatsapp/send/media \
  -H "Content-Type: application/json" \
  -d '{"recipient":"6281234567890", "type":"image", "url":"https://example.com/image.jpg", "caption":"Check out this image!"}'
```

## Troubleshooting

1. **WhatsApp client is not connected**: Make sure you have scanned the QR code when the server starts.
2. **Message not being delivered**: Verify that the recipient number is correct and the WhatsApp account is active.
3. **Media not being sent**: Ensure the URL provided is publicly accessible and the file format is supported by WhatsApp.
