import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(sensible);

app.get('/health', async () => ({
  ok: true,
  service: 'silverguard-server',
  timestamp: new Date().toISOString(),
}));

const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 3000);

try {
  await app.listen({ host, port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
