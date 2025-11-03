
import React from 'react';
import { InstagramPost } from '../types';

interface PostCardProps {
  post: InstagramPost;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform duration-300 ease-in-out flex flex-col">
      <div 
        className="relative aspect-square w-full bg-cover bg-center flex items-center justify-center p-6 text-center"
        style={{ backgroundImage: `url(${post.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <h2 className="relative z-10 text-2xl lg:text-3xl font-bold text-white leading-tight" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
          {post.imageText}
        </h2>
      </div>
      <div className="p-5 flex-grow">
        <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
          {post.caption}
        </p>
      </div>
    </div>
  );
};
