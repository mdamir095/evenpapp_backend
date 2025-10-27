import { FaCamera } from 'react-icons/fa';
import { useState } from "react";
import { IMAGE_BASE_URL } from '../../config/api';

type ImageUploadProps = {
  onFileSelect: (file: File) => void;
  existingImageUrl?: string;
};

export default function ImageUpload({ onFileSelect, existingImageUrl }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  
  // Function to get the display image (preview takes priority over existing image)
  const getDisplayImage = () => {
    const getFileName = (path: string | null | undefined) => {
      if (!path || typeof path !== 'string') return '';
      return path.split(/[/\\]/).pop() || '';
    };
    const imagePath = existingImageUrl ? getFileName(existingImageUrl) : '';
    const imageUrl = imagePath ? `${IMAGE_BASE_URL}/${imagePath.replace(/\\/g, '/')}` : '';
    return preview || imageUrl || null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent event bubbling that might trigger form submission
    e.stopPropagation();
    
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      onFileSelect(file); // ✅ Send file to parent
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="relative w-32 h-32">
    {/* Avatar Preview */}
    <div className="w-full h-full rounded-full overflow-hidden border border-sky-900 bg-gray-100 outline outline-offset-2 outline-sky-900">
      {getDisplayImage() ? (
        <img src={getDisplayImage()!} alt="Profile image" className="w-full h-full object-cover" />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          <span className="text-sm">No Image</span>
        </div>
      )}
    </div>

    {/* Hidden File Input */}
   

    {/* Camera Icon Trigger */}
    <label
      htmlFor="image-upload"
      className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600"
    >
       <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden rounded-md"
      />
      <FaCamera className="text-white w-5 h-5" />
    </label>
  </div>

    
  );
}
// {/* <div className="max-w-md mx-auto grid grid-cols-2 gap-4 items-center">
//        {preview && (
//         <div className="w-30 h-30 ">
//           {/* <p className="text-sm text-gray-500 mb-2">Preview:</p> */}
//           <img
//             src={preview}
//             alt="Uploaded preview"
//             className="w-30 h-30  rounded shadow"
//           />
//         </div>
//       )}
//       <label
//         htmlFor="image-upload"
//         className="block w-50 cursor-pointer gap-4 flex items-center border-1 border-solid border-gray-300 rounded-lg p-2 text-center transition h-10 text-Neutral-600 justify-center"
//       >
        
//         <span className="text-Neutral-800">Change Picture</span>
//         <input
//           id="image-upload"
//           type="file"
//           accept="image/*"
//           onChange={handleFileChange}
//           className="hidden rounded-md"
//         />
//         <SquarePen className="w-6 h-6 text-Neutral-600" />
//       </label>

     
//     </div> */}