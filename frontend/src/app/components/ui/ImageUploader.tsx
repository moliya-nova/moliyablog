import React, { useState } from 'react';
import { Button } from './button';
import { fileApi } from '../../services/api';
import { createRelativePath, validateImageFile, type ImageType } from '../../utils/imageUtils';

interface ImageUploaderProps {
  type: ImageType;
  onUploadSuccess: (relativePath: string) => void;
  label?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  type,
  onUploadSuccess,
  label = '上传图片',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const signResponse = await fileApi.getCosSign(type, file.name);
      const { url, key } = signResponse;

      const uploadResponse = await fileApi.uploadToCos(url, file);

      if (!uploadResponse.ok) {
        throw new Error('上传失败');
      }

      // 保存元数据到数据库，避免 COS 中存在孤立的幽灵文件
      await fileApi.saveMetadata(key, file.name, file.size, type);

      const relativePath = createRelativePath(type, key);
      onUploadSuccess(relativePath);
    } catch (err) {
      setError('上传失败，请重试');
      console.error('上传错误:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
          id={`${type}-upload`}
        />
        <Button
          variant="outline"
          onClick={() => document.getElementById(`${type}-upload`)?.click()}
          disabled={isUploading}
        >
          {isUploading ? '上传中...' : '选择文件'}
        </Button>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};

export { ImageUploader };
