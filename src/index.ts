import http from 'node:http';
import qrcode from 'qrcode-terminal';
import { config } from './config.js';
import { logger } from './logger.js';
import { getNetworkInfo } from './network.js';
import { createApp } from './app.js';

const app = createApp();
const server = http.createServer(app);

server.listen(config.PORT, config.HOST, () => {
  const urls = getNetworkInfo(config.PORT);
  logger.info(`🚀 Voice Server v${config.VERSION} [${config.NODE_ENV}]`);
  logger.info('─'.repeat(50));

  for (const { label, url } of urls) {
    logger.info(`${label.padEnd(18)} ${url}`);
  }

  const lanUrl = urls[1]?.url;
  if (lanUrl) {
    logger.info('─'.repeat(50));
    logger.info(`📱 امسح من هاتفك: ${lanUrl}`);
    qrcode.generate(lanUrl, { small: true }, (qr) => console.log(qr));
  }

  logger.info('─'.repeat(50));
  logger.info(`Features: ${JSON.stringify(config.features)}`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    logger.info(`${signal} received — shutting down`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  });
}
