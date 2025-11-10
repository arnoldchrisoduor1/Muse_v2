// src/config/configuration.ts

export default () => ({
  port: parseInt(process.env.PORT ?? "3000", 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY,
    llmModel: 'meta-llama/Llama-3.2-3B-Instruct',
    embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
});