export default function QuickLinks() {
  const links = [
    { title: '学生登录', icon: '👨‍🎓', href: '/login/student' },
    { title: '校内老师登录', icon: '👨‍🏫', href: '/login/teacher' },
    { title: '企业老师登录', icon: '👔', href: '/login/enterprise' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
      {links.map((link) => (
        <a
          key={link.title}
          href={link.href}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all hover:scale-105 text-center"
        >
          <div className="text-4xl mb-2">{link.icon}</div>
          <div className="font-semibold">{link.title}</div>
        </a>
      ))}
    </div>
  );
}

