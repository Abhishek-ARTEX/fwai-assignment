import { GoogleGenAI, Type } from "@google/genai";
import { InstagramPost } from '../types';

/**
 * Creates and returns a GoogleGenAI client.
 * Throws an error if the API key is not found in environment variables.
 */
function getAiClient(): GoogleGenAI {
  const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;
  if (!apiKey) {
    throw new Error("Google AI API key is missing. Go to your Vercel project settings, find 'Environment Variables', and add a new variable named API_KEY with your key as the value. Then, redeploy your project.");
  }
  return new GoogleGenAI({ apiKey });
}

interface PostContentIdea {
  ideaTitle: string;
  caption: string;
  imageText: string;
  imagePrompt: string;
}

const exampleCaption = `Instead of giving his 1-year-old niece a toy, Kevin gave her five shares of NVIDIA. He printed the certificate, framed it, and brought it to her birthday as a way to mark the start of her financial future.

Since 2019, NVIDIA’s stock has surged more than 3,000 percent. The company is now at the center of the AI boom, building the chips that power large models like ChatGPT and the data centers behind them. Its market cap recently passed $4.5 trillion, making it the most valuable company in the world.

What started as a simple gesture could turn into something far more meaningful. It’s not just about the money. It’s about early ownership, long-term thinking, and giving her a different way to see the future.

📸 : @founderkevin

What are your thoughts on this?

If you want to keep up with all the AI news, useful tips, and important developments, join 80k+ subscribers reading our free newsletter`;


export async function generatePostIdeasAndContent(industry: string): Promise<PostContentIdea[]> {
    const ai = getAiClient();

    const postSchema = {
        type: Type.OBJECT,
        properties: {
            ideaTitle: { type: Type.STRING, description: 'A short, catchy title for the viral post idea.' },
            caption: { type: Type.STRING, description: `An engaging, viral Instagram caption. It should tell a story or present an interesting fact, be easy to read with good spacing, use relevant emojis, and end with a call-to-action to spark conversation. Emulate the provided example's tone.` },
            imageText: { type: Type.STRING, description: 'A short, powerful, headline-style text (5-10 words) to overlay on an image.' },
            imagePrompt: { type: Type.STRING, description: 'A concise, descriptive prompt for an AI image generator to create a symbolic, visually appealing background image. The image should be abstract or metaphorical, without any text.' }
        },
        required: ['ideaTitle', 'caption', 'imageText', 'imagePrompt']
    };

    const responseSchema = {
        type: Type.ARRAY,
        items: postSchema,
    };

    const prompt = `
        You are an expert social media manager specializing in creating viral content.
        Based on the absolute latest news and trends for the "${industry}" industry, generate a list of 10 unique, viral Instagram post ideas.
        For each idea, you must generate all required content: title, caption, image overlay text, and an image generator prompt.
        - The caption should emulate the tone and structure of this example: \n---\n${exampleCaption}\n---
        - The image text should be a short, powerful headline (5-10 words).
        - The image prompt should be for a symbolic, abstract, or metaphorical background image, without text.
        
        Respond with ONLY a valid JSON array of 10 objects that conforms to the provided schema.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });
    
    const jsonText = response.text.trim();
    try {
        const ideas = JSON.parse(jsonText);
        if (Array.isArray(ideas) && ideas.length > 0) {
            return ideas;
        }
        throw new Error("Parsed JSON is not a valid array of post ideas.");
    } catch (e) {
        console.error("Failed to parse post ideas JSON from AI response:", jsonText, e);
        throw new Error("Could not parse post ideas from AI response. The response may not be valid JSON.");
    }
}

export async function generateImageForPost(imagePrompt: string): Promise<string> {
  const ai = getAiClient();

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
  return `data:image/jpeg;base64,${base64ImageBytes}`;
}