import React from 'react';
import { sanitizeHtml } from '../../utils/htmlUtils';

interface ContentViewerProps {
  content: string;
  className?: string;
  maxHeight?: string;
}

const ContentViewer: React.FC<ContentViewerProps> = ({ 
  content, 
  className = '',
  maxHeight = '400px'
}) => {
  // Sanitize the HTML content before displaying
  const sanitizedContent = sanitizeHtml(content);

  return (
    <div className={`content-viewer ${className}`}>
      <div 
        className="p-4 border border-gray-200 rounded-lg bg-gray-50 overflow-y-auto text-gray-900"
        style={{ 
          maxHeight,
          lineHeight: '1.5'
        }}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
      
      {/* Simple matching styles */}
      <style>{`
        .content-viewer h1 {
          font-size: 1.8em;
          font-weight: 600;
          margin: 0.5em 0;
        }
        
        .content-viewer h2 {
          font-size: 1.4em;
          font-weight: 600;
          margin: 0.5em 0;
        }
        
        .content-viewer h3 {
          font-size: 1.2em;
          font-weight: 600;
          margin: 0.5em 0;
        }
        
        .content-viewer ul {
          list-style-type: disc;
          margin: 0.5em 0;
          padding-left: 30px;
        }
        
        .content-viewer blockquote {
          margin: 0.5em 0;
          padding-left: 15px;
          border-left: 3px solid #d1d5db;
          color: #6b7280;
        }
        
        .content-viewer p {
          margin: 0.5em 0;
        }
        
        .content-viewer strong {
          font-weight: 600;
        }
        
        .content-viewer em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default ContentViewer;
