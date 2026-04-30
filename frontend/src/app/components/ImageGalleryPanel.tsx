import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import {
  Loader2, Image as ImageIcon, FileImage,
  Folder, Grid, ChevronLeft, ChevronRight
} from 'lucide-react';
import { fileApi } from '../services/api';
import { LazyImage } from './LazyImage';
import { validateImageFile } from '../utils/imageUtils';

interface ImageDirectory {
  id: number;
  name: string;
  path: string;
  parentId: number | null;
  imageCount: number;
}

interface ImageItem {
  id: number;
  directoryId: number;
  cosKey: string;
  filename: string;
  size: number;
  cdnUrl: string;
  createTime: string;
}

interface ImageGalleryPanelProps {
  onSelect: (imagePath: string) => void;
  directory?: string; // 上传目录，默认 'images'
}

export function ImageGalleryPanel({ onSelect, directory = 'images' }: ImageGalleryPanelProps) {
  const [imageSource, setImageSource] = useState<'file' | 'gallery'>('gallery');
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filePreview, setFilePreview] = useState('');

  // Gallery state
  const [directories, setDirectories] = useState<ImageDirectory[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [currentDirId, setCurrentDirId] = useState<number | null>(null);
  const [currentDirName, setCurrentDirName] = useState<string>('');
  const [pathHistory, setPathHistory] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [galleryPreviewUrl, setGalleryPreviewUrl] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalImages, setTotalImages] = useState(0);

  const fetchRootDirectories = async () => {
    setGalleryLoading(true);
    try {
      const dirs = await fileApi.getRootDirectories();
      setDirectories(dirs);
      setImages([]);
      setCurrentDirId(null);
      setCurrentDirName('');
      setPage(1);
      setTotalPages(1);
    } catch (error) {
      console.error('获取目录列表失败:', error);
      toast.error('获取目录列表失败');
    } finally {
      setGalleryLoading(false);
    }
  };

  const fetchDirectoryImages = async (dirId: number, pageNum: number = 1) => {
    setGalleryLoading(true);
    try {
      const result = await fileApi.getDirectoryImages(dirId, pageNum, 50);
      setImages(result.images);
      setTotalImages(result.total);
      setTotalPages(result.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('获取图片列表失败:', error);
      toast.error('获取图片列表失败');
    } finally {
      setGalleryLoading(false);
    }
  };

  const enterDirectory = (dir: ImageDirectory) => {
    setPathHistory(prev => [...prev, { id: currentDirId || 0, name: currentDirName || '根目录' }]);
    setCurrentDirId(dir.id);
    setCurrentDirName(dir.name);
    fetchDirectoryImages(dir.id, 1);
  };

  const goBack = () => {
    if (pathHistory.length > 0) {
      const prev = pathHistory[pathHistory.length - 1];
      setPathHistory(prev => prev.slice(0, -1));
      setCurrentDirId(prev.id === 0 ? null : prev.id);
      setCurrentDirName(prev.name);

      if (prev.id === 0) {
        fetchRootDirectories();
      } else {
        fetchDirectoryImages(prev.id, 1);
      }
    }
  };

  const handleImageClick = (image: ImageItem) => {
    setSelectedImageId(image.id);
    setGalleryPreviewUrl(image.cdnUrl);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (validation.valid) {
        setFileInput(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error(validation.error);
        setFileInput(null);
        setFilePreview('');
      }
    }
  };

  const handleConfirm = async () => {
    setUploading(true);

    try {
      if (imageSource === 'gallery' && selectedImageId) {
        const selectedImage = images.find(img => img.id === selectedImageId);
        if (selectedImage) {
          onSelect('/' + selectedImage.cosKey);
          toast.success('图片选择成功');
        }
      } else if (imageSource === 'file' && fileInput) {
        const result = await fileApi.uploadImage(fileInput, directory);
        onSelect('/' + result.key);
        toast.success('图片上传成功');
      }
    } catch (error) {
      console.error('图片处理失败:', error);
      toast.error('图片处理失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Button
          variant={imageSource === 'gallery' ? 'default' : 'outline'}
          onClick={() => {
            setImageSource('gallery');
            if (directories.length === 0 && currentDirId === null) {
              fetchRootDirectories();
            }
          }}
          className="flex-1 flex items-center gap-2"
        >
          <Grid className="w-4 h-4" />
          图库
        </Button>
        <Button
          variant={imageSource === 'file' ? 'default' : 'outline'}
          onClick={() => setImageSource('file')}
          className="flex-1 flex items-center gap-2"
        >
          <FileImage className="w-4 h-4" />
          本地文件
        </Button>
      </div>

      {imageSource === 'gallery' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>
              {currentDirId ? currentDirName : '选择图片'}
              {currentDirId && totalImages > 0 && ` (${totalImages})`}
            </Label>
            {currentDirId !== null && (
              <Button variant="ghost" size="sm" onClick={goBack} className="h-7 px-2">
                <ChevronLeft className="w-4 h-4 mr-1" />
                返回
              </Button>
            )}
          </div>
          <div className="border rounded-lg p-2 h-64 overflow-y-auto bg-slate-50" style={{ overscrollBehavior: 'contain' }}>
            {galleryLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : currentDirId === null ? (
              directories.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Folder className="w-10 h-10 mb-2" />
                  <span className="text-sm">暂无目录</span>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {directories.map(dir => (
                    <button
                      key={dir.id}
                      onClick={() => enterDirectory(dir)}
                      className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      <Folder className="w-8 h-8 text-yellow-500" />
                      <span className="text-xs mt-1 truncate w-full text-center">{dir.name}</span>
                      <span className="text-xs text-slate-400">{dir.imageCount}张</span>
                    </button>
                  ))}
                </div>
              )
            ) : (
              images.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <ImageIcon className="w-10 h-10 mb-2" />
                  <span className="text-sm">该目录下暂无图片</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-2">
                    {images.map(image => (
                      <button
                        key={image.id}
                        onClick={() => handleImageClick(image)}
                        className={`relative rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImageId === image.id
                            ? 'border-blue-500'
                            : 'border-transparent hover:border-slate-300'
                        }`}
                      >
                        <LazyImage
                          src={image.cdnUrl}
                          alt={image.filename}
                          className="w-full h-16 object-cover"
                          rootMargin="50px"
                        />
                      </button>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchDirectoryImages(currentDirId!, page - 1)}
                        disabled={page <= 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-slate-500">
                        {page} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchDirectoryImages(currentDirId!, page + 1)}
                        disabled={page >= totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )
            )}
          </div>
          {galleryPreviewUrl && (
            <div className="mt-2">
              <img
                src={galleryPreviewUrl}
                alt="选中预览"
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      )}

      {imageSource === 'file' && (
        <div className="space-y-2">
          <Label htmlFor="gallery-file-input">选择图片文件</Label>
          <Input
            id="gallery-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInputChange}
          />
          {filePreview && (
            <div className="mt-2">
              <img
                src={filePreview}
                alt="文件预览"
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          onClick={handleConfirm}
          disabled={uploading || (imageSource === 'gallery' && !selectedImageId) || (imageSource === 'file' && !fileInput)}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              处理中...
            </>
          ) : (
            '确认'
          )}
        </Button>
      </div>
    </div>
  );
}


