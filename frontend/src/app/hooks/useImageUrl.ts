import { useState, useEffect } from 'react';
import { getImageUrl as getImageUrlUtil, getAvatarUrl as getAvatarUrlUtil } from '../utils/imageUtils';

export function useImageUrl(src: string | null | undefined) {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getImageUrlUtil(src).then(resultUrl => {
      if (mounted) {
        setUrl(resultUrl);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) {
        setUrl('');
        setLoading(false);
      }
    });

    return () => { mounted = false; };
  }, [src]);

  return { url, loading };
}

export function useAvatarUrl(avatar: string | null | undefined) {
  return useImageUrl(avatar);
}