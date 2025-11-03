import React from 'react';
import { InstagramPost } from '../types';

interface PostCardProps {
  post: InstagramPost;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
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
    </div>
  );
};