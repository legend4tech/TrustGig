'use client';
import { useState } from 'react';

export const ExpandableText = ({ 
  text, 
  maxLength = 100, 
  plain = false, 
  className = "text-sm text-text-secondary italic" 
}: { 
  text: string; 
  maxLength?: number;
  plain?: boolean;
  className?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text) return null;
  
  if (text.length <= maxLength) {
    return <span className={className}>{plain ? text : `"${text}"`}</span>;
  }
  
  return (
    <div className="flex flex-col items-start w-full">
      <span className={`break-words w-full ${className}`}>
        {plain ? (isExpanded ? text : `${text.slice(0, maxLength)}...`) : `"${isExpanded ? text : `${text.slice(0, maxLength)}...`}"`}
      </span>
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="text-[10px] font-bold text-brand-amber uppercase tracking-wider mt-1 hover:underline cursor-pointer"
      >
        {isExpanded ? 'View Less' : 'View More'}
      </button>
    </div>
  );
};
