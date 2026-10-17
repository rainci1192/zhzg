import Link from 'next/link';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="site-breadcrumb" aria-label="面包屑导航">
      {items.map((item, index) => (
        <span key={`${item.href}-${index}`} className="site-breadcrumb-segment">
          {index < items.length - 1 ? (
            <>
              <Link href={item.href}>
                {item.name}
              </Link>
              <span className="site-breadcrumb-divider" aria-hidden="true">/</span>
            </>
          ) : (
            <span aria-current="page" className="site-breadcrumb-current">{item.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

