import Breadcrumb from './Breadcrumb';

type Crumb = { name: string; href: string };

export default function PageHero({ title, items, eyebrow }: { title: string; items: Crumb[]; eyebrow?: string }) {
  return (
    <section className="site-page-hero" aria-labelledby="site-page-title">
      <div className="site-page-hero-inner">
        <span className="site-page-eyebrow">JLU · {eyebrow || items[1]?.name || '国家卓越工程师学院'}</span>
        <h1 id="site-page-title">{title}</h1>
        <Breadcrumb items={items} />
      </div>
    </section>
  );
}
