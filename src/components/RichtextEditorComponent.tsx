import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface RichtextEditorProps {
  markdown: string;
  onChange: (value: string) => void;
}

const RichtextEditorComponent: React.FC<RichtextEditorProps> = ({ markdown, onChange }) => {
  const [isPreview, setIsPreview] = useState(false);
  const [value, setValue] = useState(markdown || '');

  useEffect(() => {
    setValue(markdown || '');
  }, [markdown]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);
  };

  const togglePreview = () => {
    setIsPreview(!isPreview);
  };

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <div className="flex bg-gray-100 border-b border-gray-300 p-2">
        <button
          type="button"
          onClick={togglePreview}
          className={`px-3 py-1 rounded text-sm ${
            !isPreview ? 'bg-white shadow-sm' : 'text-gray-600'
          }`}
        >
          Soạn thảo
        </button>
        <button
          type="button"
          onClick={togglePreview}
          className={`px-3 py-1 rounded text-sm ml-2 ${
            isPreview ? 'bg-white shadow-sm' : 'text-gray-600'
          }`}
        >
          Xem trước
        </button>
      </div>

      {isPreview ? (
        <div className="p-4 min-h-[200px] prose max-w-none bg-white">
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          value={value}
          onChange={handleChange}
          className="w-full p-4 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập nội dung ở đây..."
        />
      )}
    </div>
  );
};

export default RichtextEditorComponent; 