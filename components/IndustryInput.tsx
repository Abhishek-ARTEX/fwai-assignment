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
    <div className="industry-input-container">
      <div className="industry-input-form">
        <input
          type="text"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Artificial Intelligence, Fashion"
          className="industry-input-field"
          disabled={isLoading}
        />
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="industry-input-button"
        >
          {isLoading ? 'Generating...' : 'Generate Posts'}
        </button>
      </div>
    </div>
  );
};