import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const newsItems = [
  { id: 1, title: '我院召开国家卓越工程师学院建设工作推进会', date: '2026-01-26' },
  { id: 2, title: '国家卓越工程师学院举办第三期卓越讲堂', date: '2026-01-14' },
  { id: 3, title: '喜报！我院卓越工程师培养再获3项荣誉', date: '2025-12-12' },
  { id: 4, title: '卓越工程师培养，我院这样干！', date: '2025-12-09' },
  { id: 5, title: '我院研究生国家奖学金获奖学生风采展示', date: '2025-12-31' },
];

export default function NewsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-blue-600 text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold">新闻动态</h1>
            <p className="text-sm mt-2">当前位置：首页 / 新闻动态</p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md">
            {newsItems.map((item, index) => (
              <div
                key={item.id}
                className={`p-6 hover:bg-gray-50 cursor-pointer ${
                  index !== newsItems.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg text-gray-800 hover:text-blue-600 flex-1">
                    {item.title}
                  </h3>
                  <span className="text-sm text-gray-500 ml-4">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded">1</button>
              <button className="px-4 py-2 bg-white text-gray-700 rounded hover:bg-gray-100">2</button>
              <button className="px-4 py-2 bg-white text-gray-700 rounded hover:bg-gray-100">3</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

