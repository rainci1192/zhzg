import Link from 'next/link';

const primaryLinks = [
  { label: '学院概况', href: '/about/intro' },
  { label: '新闻动态', href: '/news' },
  { label: '通知公告', href: '/notice' },
  { label: '招生信息', href: '/admission/master' },
  { label: '科学研究', href: '/research/institutions' },
  { label: '师资队伍', href: '/faculty/internal' },
];

export default function Footer() {
  return (
    <footer className="site-footer" aria-label="网站页脚">
      <div className="site-footer-main">
        <div className="site-footer-brand">
          <Link href="/" aria-label="返回吉林大学国家卓越工程师学院（珠海）首页">
            <img src="/images/logo.png" alt="吉林大学国家卓越工程师学院（珠海）" />
          </Link>
          <p>吉林大学国家卓越工程师学院（珠海）官方网站</p>
          <span className="site-footer-brand-en">JILIN UNIVERSITY · ZHUHAI</span>
        </div>

        <nav className="site-footer-section" aria-label="页脚快捷导航">
          <h2>快捷导航</h2>
          <div className="site-footer-link-grid">
            {primaryLinks.map(({ label, href }) => (
              <Link key={href} href={href}>{label}</Link>
            ))}
          </div>
        </nav>

        <div className="site-footer-section site-footer-related">
          <h2>相关链接</h2>
          <a href="https://www.jlu.edu.cn" target="_blank" rel="noopener noreferrer">吉林大学 <span aria-hidden="true">↗</span></a>
          <a href="https://yjsy.jlu.edu.cn" target="_blank" rel="noopener noreferrer">吉林大学研究生院 <span aria-hidden="true">↗</span></a>
        </div>

        <div className="site-footer-section site-footer-contact">
          <h2>联系我们</h2>
          <address>
            <p><span>地址</span>广东省珠海市金湾区草堂</p>
            <p><span>邮编</span>519041</p>
            <p><span>电话</span><a href="tel:07567626386">0756-7626386</a></p>
          </address>
        </div>
      </div>

      <div className="site-footer-bottom">
        <div className="site-footer-bottom-inner">
          <span>© 2026 吉林大学国家卓越工程师学院（珠海）</span>
          <span>ALL RIGHTS RESERVED</span>
        </div>
      </div>
    </footer>
  );
}
