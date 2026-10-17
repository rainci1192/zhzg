'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface BannerItem {
  id: number;
  documentId?: string;
  title?: string;
  link?: string | null;
  image?: { url: string };
}

const fallbackBanners: BannerItem[] = [
  { id: -1, title: '珠海校区', image: { url: '/images/zh-banner2.png' } },
  { id: -2, title: '吉林大学珠海校区', image: { url: '/images/zh-banner1.png' } },
  { id: -3, title: '校园风光', image: { url: '/images/zh-banner3.png' } },
];

function imageUrl(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/images/')) return url;
  const origin = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function Banner({ banners = [] }: { banners: BannerItem[] }) {
  const slides = banners.filter((item) => item.image?.url).length > 0
    ? banners.filter((item) => item.image?.url)
    : fallbackBanners;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || paused || document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setCurrent((index) => (index + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [slides.length, paused]);

  const active = current % slides.length;
  const slideLink = slides[active]?.link;
  const safeSlideLink = slideLink && ((slideLink.startsWith('/') && !slideLink.startsWith('//')) || /^https?:\/\//.test(slideLink))
    ? slideLink
    : null;

  return (
    <section
      className="home-hero"
      aria-label="学院形象展示"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {slides.map((slide, index) => (
        <div className={`home-hero-slide ${index === active ? 'is-active' : ''}`} key={slide.documentId || slide.id} aria-hidden={index !== active}>
          <Image
            src={imageUrl(slide.image!.url)}
            alt={slide.title || '吉林大学珠海校区校园景观'}
            fill
            priority={index === 0}
            sizes="100vw"
            className="home-hero-image"
          />
        </div>
      ))}
      <div className="home-hero-shade" aria-hidden="true" />
      <div className="home-hero-content home-container">
        <span className="home-hero-eyebrow">JILIN UNIVERSITY · ZHUHAI</span>
        <h1>国家卓越工程师学院<span>（珠海）</span></h1>
        <p>面向国家战略需求 · 培养卓越工程人才</p>
        <div className="home-hero-actions">
          <Link href="/about/intro" className="home-hero-primary">走进学院 <span aria-hidden="true">↗</span></Link>
          <Link href="/news" className="home-hero-secondary">了解最新动态 <span aria-hidden="true">→</span></Link>
          {safeSlideLink && <a href={safeSlideLink} className="home-hero-secondary" target="_blank" rel="noopener noreferrer">查看轮播专题 <span aria-hidden="true">↗</span></a>}
        </div>
      </div>
      <div className="home-hero-bottom home-container">
        <div className="home-hero-scroll"><span className="home-hero-scroll-line" />向下探索</div>
        <div className="home-hero-controls" aria-label="轮播图控制">
          <button type="button" onClick={() => setCurrent((active - 1 + slides.length) % slides.length)} aria-label="上一张轮播图">←</button>
          <span className="home-hero-count">{String(active + 1).padStart(2, '0')} <i /> {String(slides.length).padStart(2, '0')}</span>
          <button type="button" onClick={() => setCurrent((active + 1) % slides.length)} aria-label="下一张轮播图">→</button>
        </div>
      </div>
    </section>
  );
}
