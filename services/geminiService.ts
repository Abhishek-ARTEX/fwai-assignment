import { GoogleGenAI } from "@google/genai";
import { ViralIdea, InstagramPost } from '../types';

/**
 * Creates and returns a GoogleGenAI client.
 * Throws an error if the API key is not found in environment variables.
 */
function getAiClient(): GoogleGenAI {
  const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;
  if (!apiKey) {
    throw new Error("Google AI API key is missing. Please ensure the API_KEY environment variable is set in your deployment environment.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function generateViralIdeas(industry: string): Promise<ViralIdea[]> {
  const ai = getAiClient();
  
  const prompt = `
    Based on the absolute latest news and trends for the "${industry}" industry, generate 10 viral Instagram post ideas.
    Each idea should be a short, catchy title.
    Respond with ONLY a valid JSON array of objects, where each object has a single key "title". Do not include any other text, markdown, or explanations.
    Example format: [{"title": "AI Just Changed Medicine Forever"}, {"title": "The Future of Sustainable Fashion is Here"}]
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const jsonText = response.text.trim();
  // The response might be wrapped in ```json ... ```, so we strip that.
  const cleanedJsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');

  try {
      const ideas = JSON.parse(cleanedJsonText);
      // Basic validation to ensure we got an array of objects with titles
      if (Array.isArray(ideas) && ideas.every(item => typeof item.title === 'string')) {
          return ideas;
      }
      throw new Error("Parsed JSON does not match the expected format.");
  } catch(e) {
      console.error("Failed to parse viral ideas JSON from grounded response:", cleanedJsonText);
      throw new Error("Could not parse viral ideas from AI response. The response may not be valid JSON.");
  }
}


const exampleCaption = `Instead of giving his 1-year-old niece a toy, Kevin gave her five shares of NVIDIA. He printed the certificate, framed it, and brought it to her birthday as a way to mark the start of her financial future.

Since 2019, NVIDIA’s stock has surged more than 3,000 percent. The company is now at the center of the AI boom, building the chips that power large models like ChatGPT and the data centers behind them. Its market cap recently passed $4.5 trillion, making it the most valuable company in the world.

What started as a simple gesture could turn into something far more meaningful. It’s not just about the money. It’s about early ownership, long-term thinking, and giving her a different way to see the future.

📸 : @founderkevin

What are your thoughts on this?

If you want to keep up with all the AI news, useful tips, and important developments, join 80k+ subscribers reading our free newsletter`;

export async function generatePostContent(idea: ViralIdea): Promise<Omit<InstagramPost, 'id'>> {
  const ai = getAiClient();
  
  // 1. Generate Caption
  const captionResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Based on the idea "${idea.title}", write an engaging, viral Instagram caption. The caption should tell a story or present an interesting fact, be easy to read, and spark conversation. Use a tone similar to this example, including emojis and a call to action:\n\n---\n${exampleCaption}\n---`,
  });
  const caption = captionResponse.text;

  // 2. Generate Image Text
  const imageTextResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `From this idea: "${idea.title}", create a short, powerful, headline-style text (5-10 words) to overlay on an image. The text should be impactful and grab attention immediately.`,
  });
  const imageText = imageTextResponse.text.replace(/"/g, ''); // remove quotes

  // 3. Generate Image Prompt
  const imagePromptResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Create a concise, descriptive prompt for an AI image generator to create a symbolic, visually appealing background image for the theme: "${idea.title}". The image should be abstract or metaphorical, without any text. For example, for 'AI in healthcare', a good prompt would be 'biometric data streams flowing through a stylized neural network, digital art, cinematic lighting'.`,
  });
  const imagePrompt = imagePromptResponse.text;

  // 4. Generate Image
  const imageResponse = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: imagePrompt,
    config: {
      numberOfImages: 1,
      aspectRatio: '1:1',
      outputMimeType: 'image/jpeg',
    },
  });
  
  const base64ImageBytes = imageResponse.generatedImages[0]?.image.imageBytes;
  if (!base64ImageBytes) {
      throw new Error('Image generation failed, no image bytes returned.');
  }
  const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

  return { ideaTitle: idea.title, caption, imageText, imageUrl };
}