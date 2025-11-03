
import React, { useState, useCallback } from 'react';
import { InstagramPost } from './types';
import { findTopNews, generateViralIdeas, generatePostContent } from './services/geminiService';
import { IndustryInput } from './components/IndustryInput';
import { PostCard } from './components/PostCard';
import { Loader } from './components/Loader';
import { SparklesIcon } from './components/icons/SparklesIcon';

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
      setProgressMessage('Scraping the web for top news...');
      const newsArticles = await findTopNews(industry);

      setProgressMessage('Brainstorming viral ideas...');
      const viralIdeas = await generateViralIdeas(newsArticles);
      const ideasToProcess = viralIdeas.slice(0, 10); // Limit to 10

      for (let i = 0; i < ideasToProcess.length; i++) {
        const idea = ideasToProcess[i];
        setProgressMessage(`Creating post ${i + 1}/${ideasToProcess.length}: ${idea.title}`);
        
        // Use a function to attempt generation, allowing for retries on image generation
        const generateWithRetry = async (retries = 2) => {
            for (let j = 0; j < retries; j++) {
                try {
                    const newPost = await generatePostContent(idea);
                    return newPost;
                } catch (e: any) {
                    console.error(`Attempt ${j + 1} failed for "${idea.title}":`, e.message);
                    if (j === retries - 1) throw e; // throw error on last attempt
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
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <SparklesIcon className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
              AI Viral Post Creator
            </h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Enter an industry to find the latest news, generate 10 viral post ideas, and create stunning Instagram posts with captions and images.
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
            <div className="text-center my-8 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg max-w-2xl mx-auto">
              <p className="font-semibold">Generation Failed</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!isLoading && posts.length === 0 && !error && (
             <div className="text-center text-gray-500 mt-16">
                <p>Your generated posts will appear here.</p>
                <p>Ready to go viral?</p>
             </div>
          )}

          {posts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-12">
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
