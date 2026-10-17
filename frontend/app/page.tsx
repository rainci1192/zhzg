import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Banner from '@/components/home/Banner';
import NewsList from '@/components/home/NewsList';
import NoticeList from '@/components/home/NoticeList';
import { getActiveBanners } from '@/lib/api';

export const dynamic = 'force-dynamic';

const pathways = [
  { number: '01', name: '学院概况', english: 'ABOUT US', href: '/about/intro', icon: '◈' },
  { number: '02', name: '招生信息', english: 'ADMISSIONS', href: '/admission/master', icon: '⌁' },
  { number: '03', name: '校企合作', english: 'PARTNERSHIP', href: '/cooperation/partner', icon: '◎' },
  { number: '04', name: '管理文件', english: 'DOCUMENTS', href: '/documents/policies', icon: '▤' },
];

export default async function Home() {
  const banners = await getActiveBanners();

  return (
    <div className="home-page min-h-screen">
      <Header />
      <main id="main-content">
        <Banner banners={banners} />
        <nav className="home-pathways home-container" aria-label="首页快捷入口">
          {pathways.map((item) => (
            <Link href={item.href} className="home-pathway" key={item.number}>
              <span className="home-pathway-symbol" aria-hidden="true">{item.icon}</span>
              <span className="home-pathway-copy"><strong>{item.name}</strong><small>{item.english}</small></span>
              <span className="home-pathway-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </nav>
        <section className="home-news-section" id="home-news">
          <div className="home-container"><NewsList /></div>
        </section>
        <section className="home-notice-section" id="home-notices">
          <div className="home-container"><NoticeList /></div>
        </section>
        <section className="home-discover" aria-labelledby="home-discover-title">
          <div className="home-discover-background" aria-hidden="true" />
          <div className="home-container home-discover-content">
            <div><span className="home-section-kicker">EXPLORE OUR CAMPUS</span><h2 id="home-discover-title">扎根湾区，连接产业与学术</h2><p>以实践为导向，让创新成果在真实场景中生长。</p></div>
            <Link href="/about/intro">了解学院 <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
