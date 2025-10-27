/**
 * Utility functions for handling HTML content
 */

/**
 * Strip HTML tags from content and return plain text
 * @param html - HTML content string
 * @param maxLength - Optional maximum length to truncate
 * @returns Plain text content
 */
export const stripHtmlTags = (html: string, maxLength?: number): string => {
  if (!html) return '';
  
  // Create a temporary div element to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Get text content
  let textContent = temp.textContent || temp.innerText || '';
  
  // Truncate if maxLength is specified
  if (maxLength && textContent.length > maxLength) {
    textContent = textContent.substring(0, maxLength) + '...';
  }
  
  return textContent.trim();
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - HTML content string
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  // Basic sanitization - remove script tags and dangerous attributes
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Remove script tags
  const scripts = temp.querySelectorAll('script');
  scripts.forEach(script => script.remove());
  
  // Remove dangerous attributes
  const allElements = temp.querySelectorAll('*');
  allElements.forEach(element => {
    const dangerousAttributes = ['onload', 'onclick', 'onerror', 'onmouseover', 'onmouseout', 'onfocus', 'onblur'];
    dangerousAttributes.forEach(attr => {
      if (element.hasAttribute(attr)) {
        element.removeAttribute(attr);
      }
    });
  });
  
  return temp.innerHTML;
};

/**
 * Convert HTML content to preview text for display in lists/cards
 * @param html - HTML content string
 * @param maxLength - Maximum length for preview (default 150)
 * @returns Preview text
 */
export const getContentPreview = (html: string, maxLength: number = 150): string => {
  return stripHtmlTags(html, maxLength);
};
