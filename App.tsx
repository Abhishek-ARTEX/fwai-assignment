import React, { useState, useCallback } from 'react';
import { InstagramPost } from './types';
import { generatePostIdeasAndContent, generateImageForPost } from './services/geminiService';
import { IndustryInput } from './components/IndustryInput';
import { PostCard } from './components/PostCard';
import { Loader } from './components/Loader';

// This interface defines the structure of the content generated in the first batch call.
interface PostContentIdea {
  ideaTitle: string;
  caption: string;
  imageText: string;
  imagePrompt: string;
}

function App() {
  const [industry, setIndustry] = useState<string>('Artificial Intelligence');
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!industry.trim()) {
      setError('Please enter an industry.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPosts([]);

    try {
      setProgressMessage('Finding latest trends and brainstorming 10 post ideas...');
      const postIdeas: PostContentIdea[] = await generatePostIdeasAndContent(industry);

      if (postIdeas.length === 0) {
        throw new Error("Could not generate any post ideas. The industry might be too niche, or there was an issue with the AI model.");
      }
      
      const ideasToProcess = postIdeas.slice(0, 10);

      for (let i = 0; i < ideasToProcess.length; i++) {
        const idea = ideasToProcess[i];
        setProgressMessage(`[${i + 1}/${ideasToProcess.length}] Generating image for: "${idea.ideaTitle}"`);
        
        const imageUrl = await generateImageForPost(idea.imagePrompt);
        
        const newPost: InstagramPost = {
            id: `${Date.now()}-${i}`,
            ideaTitle: idea.ideaTitle,
            caption: idea.caption,
            imageText: idea.imageText,
            imageUrl: imageUrl,
        };

        // Update state with the new post, causing it to render immediately
        setPosts(prevPosts => [...prevPosts, newPost]);
      }

    } catch (err: any) {
      console.error(err);
      setError(`An error occurred: ${err.message}. Please try again.`);
    } finally {
      setIsLoading(false);
      setProgressMessage('');
    }
  }, [industry]);
  
  return (
    <div>
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
  );
}

export default App;