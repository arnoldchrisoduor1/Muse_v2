export default () => ({
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY ?? process.env.HUGGINGFACE_API_KEY,
    llmModel: process.env.HUGGINGFACE_LLM_MODEL ?? process.env.HUGGINGFACE_LLM_MODEL,
  },
});
