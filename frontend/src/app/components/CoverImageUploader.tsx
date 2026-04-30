import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Upload, X } from 'lucide-react';
import { LazyImage } from './LazyImage';
import { ImageGalleryPanel } from './ImageGalleryPanel';

interface CoverImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

const CoverImageUploader: React.FC<CoverImageUploaderProps> = ({ value, onChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRemoveImage = () => {
    onChange('');
  };

  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open);
  };

  const handleSelect = (imagePath: string) => {
    onChange(imagePath);
    setIsModalOpen(false);
  };

  if (value) {
    return (
      <div className="relative group">
        <LazyImage
          src={value}
          alt="封面预览"
          className="w-full h-32 object-cover rounded-lg"
        />
        <button
          onClick={handleRemoveImage}
          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors bg-slate-50">
          <Upload className="w-10 h-10 text-slate-400 mb-2" />
          <span className="text-sm text-slate-600">
            点击上传封面图片
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>选择图片来源</DialogTitle>
        </DialogHeader>
        <ImageGalleryPanel onSelect={handleSelect} directory="images" />
      </DialogContent>
    </Dialog>
  );
};

export { CoverImageUploader };
