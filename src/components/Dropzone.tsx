import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../supabase/client';

interface DropzoneProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

const Dropzone: React.FC<DropzoneProps> = ({ value = [], onChange, maxFiles = 5 }) => {
  const [files, setFiles] = useState<{ preview: string; file: File }[]>([]);

  // Tạo previews khi component mount hoặc value thay đổi
  useEffect(() => {
    // Chuyển đổi URLs thành previews nếu giá trị ban đầu không rỗng
    const initialPreviews = value.map(url => ({
      preview: url,
      file: new File([], 'existing-file', { type: 'image/jpeg' }) // Dummy file
    }));
    
    setFiles(initialPreviews);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      alert(`Tối đa ${maxFiles} tệp được phép tải lên.`);
      return;
    }

    // Tạo previews và lưu files
    const newFiles = acceptedFiles.map(file => ({
      preview: URL.createObjectURL(file),
      file
    }));

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);

    // Upload lên Supabase storage
    const uploadToSupabase = async (file: File): Promise<string> => {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error } = await supabase.storage
          .from('images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Lỗi khi tải lên:', error);
          throw new Error('Tải lên thất bại');
        }

        // Lấy URL công khai
        const { data: urlData } = await supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        return urlData.publicUrl;
      } catch (error) {
        console.error('Lỗi tải lên:', error);
        return '';
      }
    };

    // Upload tất cả các file mới
    const uploadFiles = async () => {
      const uploadedUrls = await Promise.all(
        newFiles.map(async ({ file }) => await uploadToSupabase(file))
      );
      
      // Lọc bỏ các URL trống (do lỗi upload)
      const validUrls = uploadedUrls.filter(url => url);
      
      // Kết hợp URLs hiện tại với URLs mới
      const allUrls = [...value, ...validUrls];
      onChange(allUrls);
    };

    uploadFiles();
  }, [files, value, onChange, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf']
    },
    maxFiles: maxFiles - files.length,
  });

  const removeFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);

    const updatedUrls = [...value];
    updatedUrls.splice(index, 1);
    onChange(updatedUrls);
  };

  useEffect(() => {
    // Cleanup object URLs to avoid memory leaks
    return () => {
      files.forEach(file => {
        if (file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p className="text-blue-500">Thả tệp ở đây...</p> :
            <div>
              <p className="text-gray-600">Kéo và thả tệp vào đây, hoặc nhấp để chọn tệp</p>
              <p className="text-xs text-gray-500 mt-1">Hỗ trợ: JPG, PNG, GIF, PDF (tối đa {maxFiles} tệp)</p>
            </div>
        }
      </div>

      {/* Preview */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-md border border-gray-200">
                {file.file.type.includes('image') || file.preview.includes('image') ? (
                  <img
                    src={file.preview}
                    alt={`preview-${index}`}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100">
                    <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropzone; 