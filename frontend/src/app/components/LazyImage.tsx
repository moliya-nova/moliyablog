import { useState, useEffect, useRef, useCallback } from 'react';
import { getImageUrl } from '../utils/imagePath';

interface LazyImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | null | undefined;
  placeholder?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  preloaded?: boolean; // 标记是否已被预加载，true时立即加载不等待滚动
}

const DEFAULT_PLACEHOLDER = (
  <div className="bg-gray-200 animate-pulse" />
);

export function LazyImage({
  src,
  alt,
  className,
  placeholder = DEFAULT_PLACEHOLDER,
  threshold = 0.1,
  rootMargin = '100px',
  preloaded = false,
  onLoad,
  onError,
  ...props
}: LazyImageProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold, rootMargin }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (preloaded) {
      setIsInView(true);
    }
  }, [preloaded]);

  useEffect(() => {
    if ((!isInView && !preloaded) || !src) {
      return;
    }

    let mounted = true;

    getImageUrl(src).then((url) => {
      if (mounted) {
        setImageUrl(url);
      }
    }).catch(() => {
      if (mounted) {
        setHasError(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, [isInView, src, preloaded]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.(new Event('load'));
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.(new Event('error'));
  }, [onError]);

  if (!src) {
    return (
      <div ref={containerRef} className={className} {...props}>
        {placeholder}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className} {...props}>
      {!isLoaded && !hasError && placeholder}
      {imageUrl && (
        <img
          ref={imgRef}
          src={imageUrl}
          alt={alt}
          className={`${className} ${isLoaded ? '' : 'hidden'}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      {hasError && (
        <div className="bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">图片加载失败</span>
        </div>
      )}
    </div>
  );
}
