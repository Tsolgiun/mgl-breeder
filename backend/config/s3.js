import { S3Client } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { HttpsProxyAgent } from 'https-proxy-agent';
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

// For debugging
console.log('AWS Config:', {
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not Set',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not Set',
  bucketName: process.env.AWS_BUCKET_NAME,
  proxy: process.env.HTTPS_PROXY || 'Not Set',
  nodeEnv: process.env.NODE_ENV
});

// Create base config with retry strategy
const config = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  maxAttempts: 3,
  requestTimeout: 8000, // Increased timeout for proxy
  retryMode: 'standard',
  logger: console // Enable SDK logging
};

// Add proxy configuration for all requests in development
if (process.env.NODE_ENV === 'development' && process.env.HTTPS_PROXY) {
  console.log('Using proxy for S3 connection:', process.env.HTTPS_PROXY);
  const proxyAgent = new HttpsProxyAgent(process.env.HTTPS_PROXY);
  const handler = new NodeHttpHandler({
    httpsAgent: proxyAgent,
    connectionTimeout: 5000,
    socketTimeout: 5000
  });
  
  // Add debug logging
  const originalHandle = handler.handle.bind(handler);
  handler.handle = async (request) => {
    console.log('Making S3 request:', {
      method: request.method,
      url: request.hostname + request.path,
      headers: request.headers
    });
    try {
      const response = await originalHandle(request);
      console.log('S3 response status:', response.statusCode);
      return response;
    } catch (error) {
      console.error('S3 request failed:', {
        error: error.message,
        code: error.code,
        stack: error.stack
      });
      throw error;
    }
  };
  
  config.requestHandler = handler;
}

export const s3Client = new S3Client(config);

// Verify S3 client configuration
console.log('S3 Client Configuration:', {
  region: s3Client.config.region,
  maxAttempts: s3Client.config.maxAttempts,
  requestTimeout: s3Client.config.requestTimeout,
  usingProxy: !!config.requestHandler
});
