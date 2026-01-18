import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;
let embeddingModel: any = null;

function getEmbeddingModel() {
  if (embeddingModel) return embeddingModel;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // During build time, we don't want to throw error if the key is missing
    // only throw when actually called.
    throw new Error("GEMINI_API_KEY is not defined");
  }

  genAI = new GoogleGenerativeAI(apiKey);
  embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
  return embeddingModel;
}

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

    const model = getEmbeddingModel();
    const result = await model.embedContent(truncatedText);
    const embedding = result.embedding;
    return embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    // Return empty array or throw error depending on desired failure mode.
    // Throwing error allows the caller to handle retry or failure.
    throw error;
  }
}
