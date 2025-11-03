import React from 'react';

interface ApiKeySelectorProps {
  onSelectKey: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onSelectKey }) => {
  return (
    <div className="api-key-selector-overlay">
      <div className="api-key-selector-card">
        <h2>API Key Required</h2>
        <p>
          To generate posts, this application needs a Google AI API key.
          Please select a key to continue. For information on billing, please visit{' '}
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer">
            ai.google.dev/gemini-api/docs/billing
          </a>.
        </p>
        <button onClick={onSelectKey} className="select-key-button">
          Select API Key
        </button>
      </div>
    </div>
  );
};
