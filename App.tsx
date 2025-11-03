import React, { useState, useCallback, useEffect } from 'react';
import { InstagramPost, PostContentIdea } from './types';
import { generatePostIdeasAndContent, generateImageForPost, MAX_RETRIES } from './services/geminiService';
import { IndustryInput } from './components/IndustryInput';
import { PostCard } from './components/PostCard';
import { Loader } from './components/Loader';
import { ApiKeySelector } from './components/ApiKeySelector';

// Fix: Resolve TypeScript error with `window.aistudio` by defining the `AIStudio`
// interface within the global scope. This merges it with any existing global
// definitions and prevents type conflicts with module-scoped declarations.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

function App() {
  const [industry, setIndustry] = useState<string>('Artificial Intelligence');
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isKeyReady, setIsKeyReady] = useState<boolean>(false);

  const checkApiKey = useCallback(async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setIsKeyReady(hasKey);
    } else {
      // Fallback for environments where aistudio is not present.
      // Assume the API key is set via environment variables. The geminiService
      // will throw an error if it's missing, which the UI will catch.
      console.warn('window.aistudio is not available. Assuming API_KEY is set in environment.');
      setIsKeyReady(true);
    }
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Per guidelines, assume success and update UI immediately
      setIsKeyReady(true);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!industry.trim()) {
      setError('Please enter an industry.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPosts([]);

    try {
      const onIdeaRetry = (attempt: number) => {
        setProgressMessage(`The model is busy, retrying to get ideas... (Attempt ${attempt} of ${MAX_RETRIES})`);
      };
      
      setProgressMessage('Finding latest trends and brainstorming 10 post ideas...');
      const postIdeas: PostContentIdea[] = await generatePostIdeasAndContent(industry, onIdeaRetry);

      if (postIdeas.length === 0) {
        throw new Error("Could not generate any post ideas. The industry might be too niche, or there was an issue with the AI model.");
      }
      
      const ideasToProcess = postIdeas.slice(0, 10);

      for (let i = 0; i < ideasToProcess.length; i++) {
        const idea = ideasToProcess[i];
        
        const onImageRetry = (attempt: number) => {
            setProgressMessage(`[${i + 1}/${ideasToProcess.length}] Image generator is busy, retrying... (Attempt ${attempt} of ${MAX_RETRIES})`);
        };
        
        setProgressMessage(`[${i + 1}/${ideasToProcess.length}] Generating image for: "${idea.ideaTitle}"`);
        
        const imageUrl = await generateImageForPost(idea.imagePrompt, onImageRetry);
        
        const newPost: InstagramPost = {
            id: `${Date.now()}-${i}`,
            ideaTitle: idea.ideaTitle,
            caption: idea.caption,
            imageText: idea.imageText,
            imageUrl: imageUrl,
        };

        setPosts(prevPosts => [...prevPosts, newPost]);
      }

    } catch (err: any) {
      console.error(err);
      let errorMessage = `An error occurred: ${err.message}. Please try again.`;
      
      const isApiKeyError = err.message.includes('API key not valid') || 
                            err.message.includes('Requested entity was not found') || 
                            err.message.includes('API key is missing');

      if (isApiKeyError) {
          if (window.aistudio) {
              errorMessage = "Your API key appears to be invalid or missing. Please select a valid key and try again.";
              setIsKeyReady(false); // Reset to prompt for key selection
          } else {
              errorMessage = "Your Google AI API key is missing or invalid. Please make sure the API_KEY environment variable is set correctly.";
          }
      } else if (err.message.includes('503') || err.message.toLowerCase().includes('overloaded')) {
          errorMessage = "The AI model is currently overloaded and we were unable to get a response after several retries. Please try again in a few minutes.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setProgressMessage('');
    }
  }, [industry]);
  
  return (
    <div>
      {!isKeyReady && window.aistudio && <ApiKeySelector onSelectKey={handleSelectKey} />}
      <div style={{ opacity: isKeyReady ? 1 : 0.5, pointerEvents: isKeyReady ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
        <header className="app-header">
          <h1>Viral Post Engine</h1>
          <p>
            Enter an industry to generate 10 viral post ideas, complete with AI-generated captions and images.
          </p>
        </header>
        
        <main>
          <IndustryInput
            industry={industry}
            setIndustry={setIndustry}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />

          {isLoading && <Loader message={progressMessage} />}

          {error && (
            <div className="error-container">
              <p className="error-title">Generation Failed</p>
              <p>{error}</p>
            </div>
          )}

          {!isLoading && posts.length === 0 && !error && (
              <div className="placeholder-text">
                <p>Your viral posts will appear here.</p>
                <p>Let's create something amazing!</p>
              </div>
          )}

          {posts.length > 0 && (
            <div className="posts-grid">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
