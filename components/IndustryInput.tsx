
import React from 'react';

interface IndustryInputProps {
  industry: string;
  setIndustry: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const IndustryInput: React.FC<IndustryInputProps> = ({ industry, setIndustry, onGenerate, isLoading }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      onGenerate();
    }
  };

  return (
    <div className="max-w-xl mx-auto mb-8 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Artificial Intelligence, Fashion, Finance"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200 placeholder-gray-500"
          disabled={isLoading}
        />
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-3 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Posts'
          )}
        </button>
      </div>
    </div>
  );
};
