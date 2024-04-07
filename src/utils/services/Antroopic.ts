import Anthropic from '@anthropic-ai/sdk';

if (!Bun.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not found in environment variables");
const AnthropicClient = new Anthropic({
  apiKey: Bun.env.ANTHROPIC_API_KEY, // This is the default and can be omitted
});

export default AnthropicClient;