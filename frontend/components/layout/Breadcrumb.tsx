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
    <nav className="text-sm opacity-90">
      <span>当前位置：</span>
      {items.map((item, index) => (
        <span key={index}>
          {index < items.length - 1 ? (
            <>
              <Link href={item.href} className="hover:underline">
                {item.name}
              </Link>
              <span className="mx-2">/</span>
            </>
          ) : (
            <span>{item.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

