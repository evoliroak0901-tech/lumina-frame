import { Genre } from "../types";

/**
 * Generates an image URL using stock photos (Picsum) based on the genre.
 * Replaces the AI generation to function without an API key.
 */
export const generateArtImage = async (genre: Genre): Promise<string | null> => {
  // Simulate network delay for a smoother "curating" experience
  await new Promise(resolve => setTimeout(resolve, 600));

  try {
    // Generate a random seed based on genre and random number to ensure variety
    // This ensures we get different images even for the same genre
    const cacheBuster = Math.floor(Math.random() * 100000);
    const seed = `${genre.replace(/\s+/g, '-')}-${cacheBuster}`;

    // 16:9 Aspect Ratio for landscape display (1920x1080)
    const width = 1920;
    const height = 1080;

    // Use Picsum with seed for deterministic random images
    const imageUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`;

    return imageUrl;
  } catch (error) {
    console.error("Image generation failed:", error);
    return null;
  }
};

/**
 * Generates a title (Static fallback as API is disabled)
 */
export const generateTitle = async (genre: Genre): Promise<string> => {
  return `${genre} Collection`;
}