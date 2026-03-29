import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Banner from '@/components/home/Banner';
import NewsList from '@/components/home/NewsList';
import NoticeList from '@/components/home/NoticeList';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Banner />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <NewsList />
          <NoticeList />
        </div>
      </main>
      <Footer />
    </div>
  );
}

