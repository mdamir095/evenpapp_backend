import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
}

export interface UnifiedImageUploadProps {
  // File handling
  onFilesSelect: (files: ImageFile[]) => void;
  onFileSelect?: (file: File | null) => void; // For single file mode compatibility
  
  // Existing images
  existingImages?: string[];
  
  // Configuration
  mode?: 'single' | 'multiple'; // default: 'multiple'
  maxFiles?: number; // default: 10 for multiple, 1 for single
  maxFileSize?: number; // in MB, default: 5
  acceptedFormats?: string[];
  
  // UI Configuration
  className?: string;
  disabled?: boolean;
  showPreview?: boolean; // default: true
  placeholder?: string;
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto'; // for single mode
  
  // Layout
  previewLayout?: 'grid' | 'list'; // default: 'grid'
  previewSize?: 'small' | 'medium' | 'large'; // default: 'medium'
}

const UnifiedImageUpload: React.FC<UnifiedImageUploadProps> = ({
  onFilesSelect,
  onFileSelect,
  existingImages = [],
  mode = 'multiple',
  maxFiles,
  maxFileSize = 5,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  className = '',
  disabled = false,
  showPreview = true,
  placeholder,
  aspectRatio = 'auto',
  previewLayout = 'grid',
  previewSize = 'medium'
}) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set default values based on mode
  const isSingleMode = mode === 'single';
  const defaultMaxFiles = maxFiles || (isSingleMode ? 1 : 10);
  const defaultPlaceholder = placeholder || (isSingleMode ? 'Click to upload image or drag and drop' : 'Click to upload images or drag and drop');

  // Generate unique ID for each image
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return `File type ${file.type} is not supported. Allowed types: ${acceptedFormats.join(', ')}`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      return `File size ${fileSizeMB.toFixed(2)}MB exceeds maximum allowed size of ${maxFileSize}MB`;
    }

    return null;
  };

  // Create image file object
  const createImageFile = (file: File): Promise<ImageFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const imageFile: ImageFile = {
          id: generateId(),
          file,
          preview: reader.result as string,
          name: file.name,
          size: file.size
        };
        resolve(imageFile);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // Handle file selection
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    // Validate files
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(newErrors);

    if (validFiles.length === 0) return;

    // Check total file count
    const totalFiles = images.length + validFiles.length;
    if (totalFiles > defaultMaxFiles) {
      setErrors(prev => [...prev, `Maximum ${defaultMaxFiles} files allowed. You're trying to add ${validFiles.length} more files.`]);
      return;
    }

    try {
      // Create image file objects
      const newImageFiles = await Promise.all(
        validFiles.map(file => createImageFile(file))
      );

      const updatedImages = isSingleMode 
        ? newImageFiles.slice(0, 1) // Only keep the first file for single mode
        : [...images, ...newImageFiles];

      setImages(updatedImages);
      
      // Call appropriate callback
      onFilesSelect(updatedImages);
      if (onFileSelect && isSingleMode) {
        onFileSelect(updatedImages[0]?.file || null);
      }
    } catch (error) {
      setErrors(prev => [...prev, 'Failed to process some files']);
    }
  }, [images, defaultMaxFiles, isSingleMode, onFilesSelect, onFileSelect]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  // Remove image
  const removeImage = (id: string) => {
    const updatedImages = images.filter(img => img.id !== id);
    setImages(updatedImages);
    onFilesSelect(updatedImages);
    if (onFileSelect && isSingleMode) {
      onFileSelect(updatedImages[0]?.file || null);
    }
  };

  // Clear all images
  const clearAllImages = () => {
    setImages([]);
    onFilesSelect([]);
    if (onFileSelect && isSingleMode) {
      onFileSelect(null);
    }
    setErrors([]);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get aspect ratio class
  const getAspectRatioClass = () => {
    if (!isSingleMode) return '';
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'landscape':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      default:
        return '';
    }
  };

  // Get preview size classes
  const getPreviewSizeClasses = () => {
    switch (previewSize) {
      case 'small':
        return 'w-16 h-16';
      case 'large':
        return 'w-32 h-32';
      default:
        return 'w-24 h-24';
    }
  };

  const hasImages = images.length > 0 || existingImages.length > 0;

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${hasImages && showPreview && isSingleMode ? 'p-2' : 'p-6 text-center'}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
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

        {hasImages && showPreview && isSingleMode ? (
          // Single Image Preview Mode
          <div className="relative group">
            <div className={`w-full rounded-lg overflow-hidden border border-gray-200 ${getAspectRatioClass()}`}>
              <img
                src={images[0]?.preview || existingImages[0]}
                alt="Uploaded image"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="bg-white text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-100 transition-colors"
                  disabled={disabled}
                >
                  <Upload className="w-4 h-4 inline mr-1" />
                  Change
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAllImages();
                  }}
                  className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition-colors"
                  disabled={disabled}
                >
                  <X className="w-4 h-4 inline mr-1" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Upload Prompt Mode
          <div className="flex flex-col items-center space-y-2">
            {dragActive ? (
              <Upload className="w-8 h-8 text-blue-500" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-400" />
            )}
            
            <div className="text-sm text-gray-600">
              {dragActive ? (
                <span className="text-blue-600 font-medium">
                  Drop {isSingleMode ? 'image' : 'images'} here
                </span>
              ) : (
                <span>{defaultPlaceholder}</span>
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              {isSingleMode ? 'Single file' : `Up to ${defaultMaxFiles} files`} • Max {maxFileSize}MB each
            </div>
            
            <div className="text-xs text-gray-400">
              {acceptedFormats.map(format => {
                const parts = format.split('/');
                return parts.length > 1 ? parts[1].toUpperCase() : format.toUpperCase();
              }).join(', ')}
            </div>
          </div>
        )}



        {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm text-red-600">
            {errors.map((error, index) => (
              <div key={index} className="flex items-start">
                <X className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setErrors([])}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Image Previews */}
      {showPreview && hasImages && !isSingleMode && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Images ({images.length + existingImages.length})
            </h4>
            {images.length > 0 && (
              <button
                onClick={clearAllImages}
                className="text-xs text-red-600 hover:text-red-800 underline"
                disabled={disabled}
              >
                Clear All
              </button>
            )}
          </div>

          <div className={`
            ${previewLayout === 'grid' 
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3' 
              : 'space-y-2'
            }
          `}>
            {/* Existing Images */}
            {existingImages.map((imageUrl, index) => (
              <div key={`existing-${index}`} className="relative group">
                <div className={`
                  ${previewLayout === 'grid' ? getPreviewSizeClasses() : 'w-full h-20'} 
                  rounded-lg overflow-hidden border border-gray-200
                `}>
                  <img
                    src={imageUrl}
                    alt={`Existing image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Existing
                  </span>
                </div>
              </div>
            ))}

            {/* New Images */}
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className={`
                  ${previewLayout === 'grid' ? getPreviewSizeClasses() : 'w-full h-20'} 
                  rounded-lg overflow-hidden border border-gray-200
                `}>
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  disabled={disabled}
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Image Info */}
                {previewLayout === 'list' && (
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">{image.name}</div>
                    <div className="text-xs text-gray-500">{formatFileSize(image.size)}</div>
                  </div>
                )}

                {/* Image Info Overlay for Grid */}
                {previewLayout === 'grid' && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-xs truncate">{image.name}</div>
                    <div className="text-xs text-gray-300">{formatFileSize(image.size)}</div>
                  </div>
                )}
              </div>
            ))}

            {/* Add More Button */}
            {images.length < defaultMaxFiles && !isSingleMode && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`
                  ${previewLayout === 'grid' ? getPreviewSizeClasses() : 'w-full h-20'} 
                  rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors
                `}
                disabled={disabled}
              >
                <Plus className="w-6 h-6 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      {images.length > 0 && (
        <div className="mt-3 text-xs text-gray-500">
          {images.length} file{images.length !== 1 ? 's' : ''} selected
          {images.length > 0 && (
            <span className="ml-2">
              ({formatFileSize(images.reduce((total, img) => total + img.size, 0))} total)
            </span>
          )}
        </div>
      )}
      </div>

      
    </div>
  );
};

export default UnifiedImageUpload;
