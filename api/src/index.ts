import 'dotenv/config';
import { buildApp } from './app/app.js';

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const app = await buildApp();

await app.listen({ port: PORT, host: HOST });
console.log(`API listening on http://${HOST}:${PORT}`);
