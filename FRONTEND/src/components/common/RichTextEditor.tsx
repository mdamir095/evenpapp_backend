import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Bold, Italic, List, Quote, Underline, Strikethrough, ListOrdered, Link as LinkIcon, Undo2, Redo2, AlignLeft, AlignCenter, AlignRight, Eraser } from 'lucide-react';
import { SelectGroup, type OptionType } from '../molecules/SelectGroup';

// Extend window object for timeout
declare global {
  interface Window {
    richTextEditorTimeout?: number;
  }
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter content...",
  error,
  disabled = false,
  className = "",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [currentFormat, setCurrentFormat] = useState('');

  // Sync external value changes with editor content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      const currentSelection = window.getSelection();
      const range = currentSelection?.rangeCount ? currentSelection.getRangeAt(0) : null;
      const cursorPosition = range ? range.startOffset : 0;
      
      editorRef.current.innerHTML = value || '';
      
      // Restore cursor position if possible
      if (range && editorRef.current.firstChild) {
        try {
          const newRange = document.createRange();
          const textNode = editorRef.current.firstChild as ChildNode;
          const maxOffset = (textNode.textContent?.length || 0);
          newRange.setStart(textNode, Math.min(cursorPosition, maxOffset));
          newRange.collapse(true);
          currentSelection?.removeAllRanges();
          currentSelection?.addRange(newRange);
        } catch (e) {
          // Ignore cursor restoration errors
        }
      }
    }
  }, [value]);

  // Handle content change with debouncing
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      
      // Update current format state
      try {
        const formatBlock = document.queryCommandValue('formatBlock');
        setCurrentFormat(formatBlock);
      } catch (e) {
        // Ignore errors
      }
      
      // Debounce onChange calls to prevent excessive validation
      if (window.richTextEditorTimeout) {
        clearTimeout(window.richTextEditorTimeout);
      }
      window.richTextEditorTimeout = window.setTimeout(() => {
        onChange(content);
      }, 300);
    }
  }, [onChange]);

  // Handle focus events
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Clear timeout and call onChange immediately on blur
    if (window.richTextEditorTimeout) {
      clearTimeout(window.richTextEditorTimeout);
    }
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Execute formatting commands
  const execCommand = useCallback((command: string, value?: string) => {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
    // Update format state
    if (command === 'formatBlock') {
      setCurrentFormat(value || '');
    }
  }, [disabled, handleInput]);

  const insertLink = useCallback(() => {
    if (disabled) return;
    const url = window.prompt('Enter URL');
    if (!url) return;
    execCommand('createLink', url);
  }, [disabled, execCommand]);

  // Handle paste events to clean up content
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (disabled) return;
    e.preventDefault();
    const paste = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, paste);
    handleInput();
  }, [disabled, handleInput]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b': e.preventDefault(); execCommand('bold'); break;
        case 'i': e.preventDefault(); execCommand('italic'); break;
        case 'u': e.preventDefault(); execCommand('underline'); break;
        case 'z': e.preventDefault(); execCommand('undo'); break;
        case 'y': e.preventDefault(); execCommand('redo'); break;
      }
    }
  }, [disabled, execCommand]);

  // Toolbar buttons
  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: Underline, command: 'underline', title: 'Underline' },
    { icon: Strikethrough, command: 'strikeThrough', title: 'Strikethrough' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Quote' },
  ] as Array<{ icon: any; command: string; title: string; value?: string }>;

  return (
    <div className={`border rounded-lg ${
      error ? 'border-red-500' : isFocused ? 'border-blue-500' : 'border-gray-300'
    } ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-gray-200 rounded-md">
        {toolbarButtons.map(({ icon: Icon, command, value, title }) => (
          <button
            key={command + (value || '')}
            type="button"
            disabled={disabled}
            onClick={() => execCommand(command, value)}
            title={title}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
          >
            <Icon size={18} />
          </button>
        ))}

        <div className="h-4 w-px bg-gray-300 mx-1" />

        {/* Alignment */}
        <button type="button" title="Align left" disabled={disabled} onClick={() => execCommand('justifyLeft')} className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50">
          <AlignLeft size={18} />
        </button>
        <button type="button" title="Align center" disabled={disabled} onClick={() => execCommand('justifyCenter')} className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50">
          <AlignCenter size={18} />
        </button>
        <button type="button" title="Align right" disabled={disabled} onClick={() => execCommand('justifyRight')} className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50">
          <AlignRight size={18} />
        </button>

        <div className="h-4 w-px bg-gray-300 mx-1" />

        {/* Link / Unlink */}
        <button type="button" title="Insert link" disabled={disabled} onClick={insertLink} className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50">
          <LinkIcon size={18} />
        </button>
        <button type="button" title="Remove link" disabled={disabled} onClick={() => execCommand('unlink')} className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50">
          <Eraser size={18} />
        </button>

        <div className="h-4 w-px bg-gray-300 mx-1" />

        {/* Undo / Redo */}
        <button type="button" title="Undo" disabled={disabled} onClick={() => execCommand('undo')} className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50">
          <Undo2 size={18} />
        </button>
        <button type="button" title="Redo" disabled={disabled} onClick={() => execCommand('redo')} className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50">
          <Redo2 size={18} />
        </button>

        <div className="h-4 w-px bg-gray-300 mx-1" />

        {/* Clear formatting */}
        <button type="button" title="Clear formatting" disabled={disabled} onClick={() => execCommand('removeFormat')} className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50">
          <Eraser size={18} />
        </button>

        <div className="h-4 w-px bg-gray-300 mx-1" />

        {/* Heading Dropdown */}
        <SelectGroup
          label=""
          heightClass="h-9"
          value={
            currentFormat
              ? [{ label: currentFormat.toUpperCase(), value: currentFormat }]
              : []
          }
          options={[
            { label: "Normal", value: "p" },
            { label: "H1", value: "h1" },
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
          ]}
          onChange={(selected) =>
            execCommand("formatBlock", selected.length ? selected[0].value : "p")
          }
        />
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className={`
          min-h-[180px] p-4 text-sm text-gray-900 focus:outline-none rounded-sm
          ${disabled ? 'bg-gray-50 cursor-not-allowed text-gray-500' : 'bg-white'}
        `}
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          lineHeight: '1.5',
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 text-sm text-red-600 border-t border-red-200 bg-red-50">
          {error}
        </div>
      )}

      {/* Simple Styles */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        [contenteditable] h1 {
          font-size: .9em;
          font-weight: 600;
          margin: 0.5em 0;
        }
        
        [contenteditable] h2 {
          font-size: .8em;
          font-weight: 600;
          margin: 0.5em 0;
        }
        
        [contenteditable] h3 {
          font-size: .7em;
          font-weight: 600;
          margin: 0.5em 0;
        }
        
        [contenteditable] ul {
          list-style-type: disc;
          margin: 0.5em 0;
          padding-left: 30px;
        }
        
        [contenteditable] ol {
          list-style-type: decimal;
          margin: 0.5em 0;
          padding-left: 30px;
        }
        
        [contenteditable] blockquote {
          margin: 0.5em 0;
          padding-left: 15px;
          border-left: 3px solid #d1d5db;
          color: #6b7280;
        }
        
        [contenteditable] p {
          margin: 0.5em 0;
        }
        
        [contenteditable] strong {
          font-weight: 600;
        }
        
        [contenteditable] em {
          font-style: italic;
        }
        
        [contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;