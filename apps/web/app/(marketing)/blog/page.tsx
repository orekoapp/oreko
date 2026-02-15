import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Blog | QuoteCraft',
  description: 'Tips, tutorials, and updates from the QuoteCraft team.',
};

const posts = [
  {
    title: 'Introducing QuoteCraft: The Open-Source Quote & Invoice Builder',
    excerpt:
      'We\'re excited to announce the launch of QuoteCraft, the free and open-source alternative to expensive invoicing tools.',
    date: 'February 15, 2026',
    category: 'Announcements',
    slug: '#',
  },
  {
    title: 'How to Write Quotes That Actually Get Accepted',
    excerpt:
      'Learn the psychology behind winning quotes and how to structure your proposals for maximum conversion.',
    date: 'February 10, 2026',
    category: 'Tips',
    slug: '#',
  },
  {
    title: 'Self-Hosting QuoteCraft: A Complete Guide',
    excerpt:
      'Step-by-step instructions for deploying QuoteCraft on your own server using Docker.',
    date: 'February 5, 2026',
    category: 'Tutorials',
    slug: '#',
  },
  {
    title: '5 Invoicing Mistakes That Are Costing You Money',
    excerpt:
      'Common invoicing errors that delay payments and how to avoid them with better processes.',
    date: 'January 28, 2026',
    category: 'Tips',
    slug: '#',
  },
];

export default function BlogPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground">
            Tips, tutorials, and updates from the QuoteCraft team.
          </p>
        </div>

        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.title}
              className="group rounded-lg border p-6 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge variant="secondary">{post.category}</Badge>
                <span className="text-sm text-muted-foreground">{post.date}</span>
              </div>
              <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                <Link href={post.slug}>{post.title}</Link>
              </h2>
              <p className="text-muted-foreground mb-4">{post.excerpt}</p>
              <Link
                href={post.slug}
                className="text-sm font-medium text-primary hover:underline"
              >
                Read more &rarr;
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Want to contribute to the blog?
          </p>
          <Button asChild variant="outline">
            <a
              href="https://github.com/quotecraft/quotecraft"
              target="_blank"
              rel="noopener noreferrer"
            >
              Submit a Post on GitHub
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
