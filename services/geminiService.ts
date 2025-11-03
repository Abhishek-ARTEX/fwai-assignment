
import { GoogleGenAI, Type } from "@google/genai";
import { NewsArticle, ViralIdea, InstagramPost } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function findTopNews(industry: string): Promise<NewsArticle[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    throw new Error("GNews API key is missing. Please set the GNEWS_API_KEY environment variable.");
  }

  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(industry)}&lang=en&sortby=relevance&max=10&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GNews API error: ${errorData.errors.join(', ')}`);
    }

    const data = await response.json();
    
    // Map the GNews article format to our internal NewsArticle type
    return data.articles.map((article: any) => ({
      title: article.title,
      summary: article.description,
      url: article.url,
    }));
  } catch (error: any) {
    console.error("Failed to fetch news from GNews API:", error);
    throw new Error(`Could not fetch news from GNews API: ${error.message}`);
  }
}

export async function generateViralIdeas(newsArticles: NewsArticle[]): Promise<ViralIdea[]> {
  const newsSummaries = newsArticles.map(article => `- ${article.title}: ${article.summary}`).join('\n');
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Based on these news articles:\n${newsSummaries}\n\nGenerate 10 viral Instagram post ideas. Each idea should be a short, catchy title.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
          },
          required: ["title"],
        },
      },
    },
  });

  const jsonText = response.text.trim();
  try {
      return JSON.parse(jsonText);
  } catch(e) {
      console.error("Failed to parse viral ideas JSON:", jsonText);
      throw new Error("Could not parse viral ideas from AI response.");
  }
}

const exampleCaption = `Instead of giving his 1-year-old niece a toy, Kevin gave her five shares of NVIDIA. He printed the certificate, framed it, and brought it to her birthday as a way to mark the start of her financial future.

Since 2019, NVIDIA’s stock has surged more than 3,000 percent. The company is now at the center of the AI boom, building the chips that power large models like ChatGPT and the data centers behind them. Its market cap recently passed $4.5 trillion, making it the most valuable company in the world.

What started as a simple gesture could turn into something far more meaningful. It’s not just about the money. It’s about early ownership, long-term thinking, and giving her a different way to see the future.

📸 : @founderkevin

What are your thoughts on this?

If you want to keep up with all the AI news, useful tips, and important developments, join 80k+ subscribers reading our free newsletter`;

export async function generatePostContent(idea: ViralIdea): Promise<Omit<InstagramPost, 'id'>> {
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