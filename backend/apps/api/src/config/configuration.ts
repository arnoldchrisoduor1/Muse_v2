// src/config/configuration.ts

export default () => ({
  port: parseInt(process.env.PORT ?? "3000", 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '30m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY,
    llmModel: process.env.HUGGINGFACE_LLM_MODEL,
    embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  blockchain: {
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL,
    privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY,
    network: process.env.BLOCKCHAIN_NETWORK,
    poemNFTContractAddress: process.env.POEM_NFT_CONTRACT_ADDRESS,
    fractionalOwnershipContractAddress: process.env.FRACTIONAL_OWNERSHIP_CONTRACT_ADDRESS,
  },
});