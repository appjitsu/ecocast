# Webhook System

The EcoCast API includes a robust webhook system that allows external applications to subscribe to events and receive real-time notifications when those events occur.

## Features

- **Event-based Notifications**: Deliver real-time notifications for various application events
- **Secure Payload Signing**: Signature-based verification to ensure webhook authenticity
- **Reliable Delivery**: Automatic retries with exponential backoff for failed deliveries
- **Dashboard Integration**: Manage webhooks through the API
- **Customizable Subscriptions**: Subscribe to specific events or all events
- **Delivery Status Tracking**: Monitor successful and failed deliveries

## Available Events

- `cast.created` - When a new cast is created
- `cast.updated` - When a cast is updated
- `cast.deleted` - When a cast is deleted
- `user.created` - When a new user is registered
- `user.updated` - When a user profile is updated
- `comment.created` - When a new comment is posted
- `comment.updated` - When a comment is edited
- `comment.deleted` - When a comment is deleted
- `reaction.created` - When a reaction is added

## Webhook Payload Format

All webhook payloads follow a consistent format:

```json
{
  "id": "whevt_6a5d7e8f9g0h",
  "event": "cast.created",
  "timestamp": 1711234567890,
  "apiVersion": "v1",
  "data": {
    // Event-specific data
  }
}
```

## Security

Webhooks include a signature header to verify their authenticity:

- **X-EcoCast-Webhook-Signature**: HMAC SHA-256 signature of the payload using your webhook secret
- **X-EcoCast-Webhook-Timestamp**: Timestamp when the webhook was generated
- **X-EcoCast-Webhook-ID**: Unique ID for the webhook
- **X-EcoCast-Webhook-Event**: Event type
- **X-EcoCast-Webhook-Delivery**: Unique ID for this delivery attempt

### Verifying Signatures

To verify a webhook signature:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}
```

## Best Practices

1. **Respond Quickly**: Return a 2xx status code as quickly as possible (within 10 seconds)
2. **Verify Signatures**: Always verify the webhook signature before processing
3. **Idempotent Processing**: Process webhooks idempotently using the webhook ID
4. **Handle Retries**: Expect that the same webhook might be delivered multiple times
5. **Asynchronous Processing**: Use a message queue for processing webhooks asynchronously
6. **Webhook Timeouts**: Webhook delivery will time out after 10 seconds

## Implementing Your Webhook Endpoint

Your webhook endpoint should:

1. Return a 2xx response quickly
2. Verify the webhook signature
3. Process the webhook asynchronously if processing takes time
4. Be idempotent (safely handle duplicate deliveries)

Example of a minimal Express.js webhook handler:

```javascript
app.post('/webhooks/ecocast', express.json(), (req, res) => {
  const payload = req.body;
  const signature = req.header('X-EcoCast-Webhook-Signature');
  const timestamp = req.header('X-EcoCast-Webhook-Timestamp');
  const webhookId = req.header('X-EcoCast-Webhook-ID');

  // Return 200 quickly
  res.status(200).send('Received');

  // Then process asynchronously
  processWebhookAsync(payload, signature, webhookId);
});
```

## Managing Webhooks via API

See the API documentation for endpoints to:

- Create webhooks
- List existing webhooks
- Update webhooks
- Delete webhooks
- Regenerate webhook secrets
