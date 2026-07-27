'use client';

import React from 'react';
import { Story } from '../data/stories';

interface ProtectedStoryContainerProps {
  story: Story;
}

export default function ProtectedStoryContainer({ story }: ProtectedStoryContainerProps) {

  return (
    <article className="mx-auto max-w-6xl px-4 py-12 md:py-20">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-2xl md:text-4xl font-bold mb-6 leading-tight tracking-tight">
          {story.title}
        </h1>
        {story.subtitle && (
          <p className="text-lg text-zinc-300 leading-relaxed mb-8">
            {story.subtitle}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm text-zinc-500 uppercase tracking-wider">
          <span>{story.author}</span>
          <span>•</span>
          <span>{story.publishDate}</span>
        </div>
      </header>

      {/* Content */}
      <div
        className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-white prose-a:no-underline hover:prose-a:underline prose-img:w-full prose-p:mb-8 prose-p:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: story.content }}
      />
    </article>
  );
}
