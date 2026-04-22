'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export interface BannerItem {
  id: number;
  documentId?: string;
  title?: string;
  link?: string | null;
  image?: {
    url: string;
  };
}

interface BannerProps {
  banners: BannerItem[];
}

export default function Banner({ banners = [] }: BannerProps) {
  const [current, setCurrent] = useState(0);

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners || banners.length === 0) {
    return (
      <div className="w-full h-[600px] md:h-[700px] bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">暂无轮播图数据，请在后台添加</span>
      </div>
    );
  }

  const goPrev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  const goNext = () => setCurrent((prev) => (prev + 1) % banners.length);

  return (
    <div className="relative w-full h-[600px] md:h-[700px] overflow-hidden bg-gray-200">
      {banners.map((slide, index) => {
        const imageUrl = slide.image?.url ? `${STRAPI_URL}${slide.image.url}` : '';

        return (
          <div
            key={slide.documentId || slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {slide.link ? (
              <a href={slide.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={slide.title || 'banner'}
                    fill
                    priority={index === 0}
                    // ✅ 核心修改：使用 object-cover 和 object-center，保证铺满不留白，且始终以中心点为基准裁切
                    className="object-cover object-center"
                  />
                )}
              </a>
            ) : (
              <div className="w-full h-full relative">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={slide.title || 'banner'}
                    fill
                    priority={index === 0}
                    // ✅ 核心修改：使用 object-cover 和 object-center
                    className="object-cover object-center"
                  />
                )}
              </div>
            )}
          </div>
        );
      })}

      {banners.length > 1 && (
        <>
          {/* 左箭头 */}
          <button
            onClick={goPrev}
            aria-label="上一张"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 transition-colors duration-200 group"
          >
            <svg className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* 右箭头 */}
          <button
            onClick={goNext}
            aria-label="下一张"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 transition-colors duration-200 group"
          >
            <svg className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* 底部指示点 */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                // ✅ 因为图片铺满全屏，指示器恢复为明显的白色/半透明白色
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index === current ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
