import React, { useState } from 'react';
import { InstagramPost } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';

interface PostCardProps {
  post: InstagramPost;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(post.caption).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <div className="post-card">
      <div 
        className="post-card-image-container"
        style={{ backgroundImage: `url(${post.imageUrl})` }}
      >
        <div className="post-card-image-overlay"></div>
        <div className="post-card-image-content">
          <h2 className="post-card-image-text">
            {post.imageText}
          </h2>
        </div>
      </div>
      <div className="post-card-caption-container">
        <p className="post-card-caption">
          {post.caption}
        </p>
      </div>
      <div className="post-card-footer">
        <button onClick={handleCopy} className="copy-button">
          <ClipboardIcon />
          <span>{copied ? 'Copied!' : 'Copy Caption'}</span>
        </button>
      </div>
    </div>
  );
};