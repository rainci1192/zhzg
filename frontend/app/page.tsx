import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Banner from '@/components/home/Banner';
import NewsList from '@/components/home/NewsList';
import NoticeList from '@/components/home/NoticeList';

// 保证首页每次请求都可拿到最新 CMS 数据（开发阶段建议开启）
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* 轮播图单独占位，不加背景，不加外边距，避免与导航间出现空隙 */}
        <Banner />

        {/* 背景图从这里开始（轮播图下方） */}
        <section
          className="
            w-full
            bg-[url('/images/home-bg.jpg')]
            bg-cover
            bg-no-repeat
            bg-fixed
            bg-top
          "
        >
          {/* 蒙层与内容容器，宽度与轮播图一致（同为 px-6） */}
          <div className="w-full px-6 py-8 bg-white/82">
            <div className="flex flex-col gap-8">
              <NewsList />
              <NoticeList />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
