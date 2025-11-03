
import React from 'react';

interface LoaderProps {
  message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="text-center my-12 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-t-purple-500 border-gray-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-400 max-w-md">{message}</p>
    </div>
  );
};
