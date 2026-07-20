import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export interface Env {
  PORT: number;
  JWT_SECRET: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD?: string;
  DB_NAME: string;
  REDIS_URL: string;
}

const getEnvOrThrow = (key: string): string => {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
};

const getEnvOrDefault = (key: string, defaultValue: string): string => {
  return process.env[key] || defaultValue;
};

export const env: Env = {
  PORT: parseInt(getEnvOrDefault('PORT', '5000'), 10),
  JWT_SECRET: getEnvOrThrow('JWT_SECRET'),
  DB_HOST: getEnvOrDefault('DB_HOST', 'localhost'),
  DB_PORT: parseInt(getEnvOrDefault('DB_PORT', '5432'), 10),
  DB_USER: getEnvOrDefault('DB_USER', 'postgres'),
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: getEnvOrDefault('DB_NAME', 'guidance_db'),
  REDIS_URL: getEnvOrDefault('REDIS_URL', 'redis://localhost:6379'),
};
