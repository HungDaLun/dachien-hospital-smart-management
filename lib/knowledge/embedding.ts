import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const genAI = new GoogleGenerativeAI(apiKey);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

/**
 * Generates an embedding vector for the given text.
 * Truncates text to 2048 characters to respect API limits (though limit is higher, this is safe).
 * The actual limit for text-embedding-004 is 2048 tokens, roughly 8000 chars.
 * @param text The text to embed
 * @returns An array of numbers representing the embedding vector (768 dimensions)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Truncate to avoid token limit errors. text-embedding-004 supports up to 2048 tokens.
    // A safe approximation is around 6000-8000 characters.
    // We'll use 8000 characters for now.
    const truncatedText = text.slice(0, 8000);
    
    const result = await embeddingModel.embedContent(truncatedText);
    const embedding = result.embedding;
    return embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    // Return empty array or throw error depending on desired failure mode.
    // Throwing error allows the caller to handle retry or failure.
    throw error;
  }
}
