export interface AppConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  databaseSsl: boolean;
  corsOrigins: string[];
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  databaseUrl: process.env.DATABASE_URL ?? '',
  databaseSsl: (process.env.DATABASE_SSL ?? 'true') === 'true',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',').map((o) => o.trim()),
});
