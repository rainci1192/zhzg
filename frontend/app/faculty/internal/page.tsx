import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function FacultyInternal() {
  const sidebarItems = [
    { name: '校内导师', href: '/faculty/internal' },
    { name: '企业导师', href: '/faculty/enterprise' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '师资队伍', href: '/faculty/internal' },
    { name: '校内导师', href: '/faculty/internal' },
  ];

  const tutorsByMajor = {
    '机械': [
      '于化东', '王继新', '毕秋实', '刘欣', '李明', '张世忠', '陈鑫', '赵健', '崔玉鑫',
      '马志超', '王聪慧', '朱博', '刘春宝', '李学飞', '张成春', '呼咏', '胡宏宇', '章新杰',
      '王丹', '孔繁森', '刘卫东', '刘强', '杨兆军', '张君媛', '罗巍', '殷志富', '程飞',
      '王军年', '田海龙', '刘长宜', '刘鹏', '吴文征', '张建海', '金英爱', '高镇海', '窦慧莉',
      '王建华', '史卫博', '刘志峰', '齐江涛', '何佳龙', '陈传海', '金桐彤', '郭劲言', '裴永臣',
      '王顺博', '冯美', '刘国君', '闫振华', '何磊', '陈志勇', '周晓勤', '黄虎', '冀世军',
      '王亮', '吉野辰萌', '刘昕晖', '李国发', '张天时', '陈国迎', '赵宏伟', '常贺'
    ],
    '材料与化工': [
      '王大为','王海波','刘家安','李欣','沈平','张志强','赵小辉','姚卫国','韩奇钢','王文权',
      '王珵','严庆光','杨春成','宋雨来','张鹏','胡志清','徐晓峰','曾毅','王明辉','文懋','李乙',
      '谷晓鹏','张立军','张新戈','查敏','高一鹏','鄢俊敏','王金国','朱永福','李芳菲','谷晓燕',
      '张伟','陈超','侯甲子','高钱','窦艳丽'
    ],
    '电子信息':[
      '马锐','田振男','刘宏飞','孙锋','宋俊峰','范子沛','周逢道','徐速','蒋川东','王世隆','刘长英',
      '刘洋','李玉','张大明','林红波','赵静','栾卉','韩霄松','王红波','刘文彬','齐红','李刚','张宇',
      '林君','胡云峰','高炳荣','程永春','王爱民','刘汉武','许芳','李寿涛','张冠宇','易晓峰','宫洵',
      '康辉','魏金贝','王磊','刘永顺','孙庚','李赞','张歆东','周丰丰','秦贵和','阎凯歌','石屹然',
      '刘华虓','孙铭会','何丽莉','陈晨','周柚','索辉','随阳轶'
    ],
    '资源与环境':[
      '于清杨','冯威','朱珊','杨言辰','张春鹏','赵容生','郭威','董军','王晰','吕聪','李昂','肖长来',
      '陈慧娥','柳蓉','梁秀娟'
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">校内导师</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="师资队伍" items={sidebarItems} />
            </aside>
            
            <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
              

              {Object.entries(tutorsByMajor).map(([major, tutors]) => (
                <div key={major} className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">{major}</h2>
                  <div className="grid grid-cols-9 gap-4">
                    {tutors.map((name, index) => (
                      <div key={index} className="text-center text-gray-700 hover:text-blue-600 cursor-pointer transition-colors">
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

