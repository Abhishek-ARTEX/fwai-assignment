import React, { useState, useCallback } from 'react';
import { InstagramPost } from './types';
import { generateViralIdeas, generatePostContent } from './services/geminiService';
import { IndustryInput } from './components/IndustryInput';
import { PostCard } from './components/PostCard';
import { Loader } from './components/Loader';

function App() {
  const [industry, setIndustry] = useState<string>('Healthcare');
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
      setProgressMessage('Finding latest trends and brainstorming viral ideas...');
      const viralIdeas = await generateViralIdeas(industry);

      if (viralIdeas.length === 0) {
        throw new Error("Could not generate any viral ideas. The industry might be too niche, or there was an issue with the AI model.");
      }

      const ideasToProcess = viralIdeas.slice(0, 10); // Limit to 10

      for (let i = 0; i < ideasToProcess.length; i++) {
        const idea = ideasToProcess[i];
        setProgressMessage(`Creating post ${i + 1}/${ideasToProcess.length}: ${idea.title}`);
        
        const generateWithRetry = async (retries = 2) => {
            for (let j = 0; j < retries; j++) {
                try {
                    const newPost = await generatePostContent(idea);
                    return newPost;
                } catch (e: any) {
                    console.error(`Attempt ${j + 1} failed for "${idea.title}":`, e.message);
                    if (j === retries - 1) throw e;
                }
            }
            return null;
        };
        
        const newPost = await generateWithRetry();

        if (newPost) {
          setPosts(prevPosts => [...prevPosts, { ...newPost, id: `${Date.now()}-${i}` }]);
        }
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
        <h1>AI Viral Post Creator</h1>
        <p>
          Enter an industry to find the latest news, generate 10 viral post ideas, and create Instagram posts with captions and images.
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
              <p>Your generated posts will appear here.</p>
              <p>Ready to go viral?</p>
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