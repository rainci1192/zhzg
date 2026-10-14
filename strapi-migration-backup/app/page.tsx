import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Banner from '@/components/home/Banner';
import NewsList from '@/components/home/NewsList';
import NoticeList from '@/components/home/NoticeList';
// 引入我们在上一步编写的 API 方法
import { getActiveBanners } from '@/lib/api'; 

// 保证首页每次请求都可拿到最新 CMS 数据（开发阶段建议开启）
export const dynamic = 'force-dynamic';

// ✅ 将组件改为 async 函数，以便在服务端请求数据
export default async function Home() {
  // ✅ 在服务端获取已启用的轮播图数据
  const banners = await getActiveBanners();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* ✅ 将获取到的 banners 数据作为属性传递给 Banner 组件 */}
        <Banner banners={banners} />

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
