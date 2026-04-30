import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ImageGalleryPanel } from './ImageGalleryPanel';

interface ImageSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (imagePath: string) => void;
  title?: string;
}

export const ImageSelectorDialog: React.FC<ImageSelectorDialogProps> = ({
  open,
  onOpenChange,
  onSelect,
  title = '选择图片'
}) => {
  const handleSelect = (imagePath: string) => {
    onSelect(imagePath);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ImageGalleryPanel onSelect={handleSelect} directory="images" />
      </DialogContent>
    </Dialog>
  );
};
