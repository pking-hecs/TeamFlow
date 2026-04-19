import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: envPath });

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]?.trim());

if (missingEnv.length > 0) {
  throw new Error(`Missing required environment variables in ${envPath}: ${missingEnv.join(', ')}`);
}

if (process.env.DB_NAME === 'your_db_name') {
  throw new Error(`DB_NAME is still set to the placeholder "your_db_name" in ${envPath}.`);
}

export { envPath };
