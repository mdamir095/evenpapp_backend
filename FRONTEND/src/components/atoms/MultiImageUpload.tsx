import React, { useRef, useState, useEffect, useCallback, useMemo, type ChangeEvent, type DragEvent } from 'react';
import { Plus, X } from 'lucide-react';

interface ImageFile {
  id: string;
  name: string;
  preview: string;
  file?: File; // Store the actual File object for binary upload (optional for pre-existing images)
  url?: string; // For pre-existing images from server
  uploaded?: boolean; // Mark if image is already uploaded
}

interface MultiImageUploadProps {
  className?: string;
  disabled?: boolean;
  isSingleMode?: boolean;
  acceptedFormats?: string[];
  onImagesChange?: (images: ImageFile[]) => void;
  disableClick?: boolean; // For FormBuilder - disables click to allow field selection
  initialImages?: ImageFile[]; // For pre-selected images
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  className = '',
  disabled = false,
  isSingleMode = false,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  onImagesChange,
  disableClick = false,
  initialImages = []
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [images, setImages] = useState<ImageFile[]>(initialImages);
  const [errors, setErrors] = useState<string[]>([]);

  // Memoize initialImages to prevent unnecessary re-renders
  const memoizedInitialImages = useMemo(() => initialImages, [JSON.stringify(initialImages)]);

  // Update images when initialImages prop changes
  useEffect(() => {
    if (memoizedInitialImages.length > 0) {
      setImages(memoizedInitialImages);
    }
  }, [memoizedInitialImages]);

  const processFiles = useCallback((files: File[]) => {
    const newErrors: string[] = [];

    files.forEach((file) => {
      if (!acceptedFormats.includes(file.type)) {
        newErrors.push(`${file.name}: Unsupported file format`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        newErrors.push(`${file.name}: File too large (max 5MB)`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: ImageFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          preview: e.target?.result as string,
          file: file // Store the actual File object for binary upload
        };
        
        setImages(prev => {
          const updated = isSingleMode ? [newImage] : [...prev, newImage];
          onImagesChange?.(updated);
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });

    setErrors(newErrors);
  }, [acceptedFormats, isSingleMode, onImagesChange]);

  const handleDragIn = useCallback((event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) {
      setDragActive(true);
    }
  }, [disabled]);

  const handleDragOut = useCallback((event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrag = useCallback((event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = Array.from(event.dataTransfer.files);
    processFiles(files);
  }, [disabled, processFiles]);

  const handleFileInputChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    if (disabled) return;
    
    const files = Array.from(event.target.files || []);
    processFiles(files);
  }, [disabled, processFiles]);

  const getPreviewSizeClasses = () => {
    return 'w-20 h-20 flex-shrink-0';
  };

  const removeImage = useCallback((id: string): void => {
    if (disabled) return;
    
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      onImagesChange?.(updated);
      return updated;
    });
  }, [disabled, onImagesChange]);

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white
          ${dragActive ? 'border-blue-500 bg-blue-50' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && !disableClick && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          multiple={!isSingleMode}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Preview Gallery */}
        <div className="flex gap-4 overflow-x-auto">
          {images.map((img) => (
            <div
              key={img.id}
              className={`relative rounded-md border border-gray-200 overflow-hidden ${getPreviewSizeClasses()}`}
            >
              <img
                src={img.preview || img.url}
                alt={img.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeImage(img.id)}
                className="absolute top-1 right-1 text-white text-xs  hover:bg-red-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}

          {/* Upload Slot */}
          <label
            htmlFor="image-upload"
            className={`flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md  cursor-pointer ${getPreviewSizeClasses()} hover:border-blue-400`}
          >
            <Plus className="w-6 h-6 text-gray-400" />
            <input
              id="image-upload"
              type="file"
              multiple={!isSingleMode}
              accept={acceptedFormats.join(',')}
              onChange={handleFileInputChange}
              ref={fileInputRef}
              className="hidden"
              disabled={disabled}
            />
          </label>
        </div>

        {/* Label */}
        <p className="mt-3 text-sm text-gray-600 text-center">Upload Images</p>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm font-semibold text-red-700 mb-2">Upload Errors</p>
          <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiImageUpload;
