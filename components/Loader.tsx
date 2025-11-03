import React from 'react';

interface LoaderProps {
  message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="loader-container">
      <div className="loader-spinner"></div>
      <p className="loader-message">{message}</p>
    </div>
  );
};