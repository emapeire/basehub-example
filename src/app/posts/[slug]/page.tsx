import Link from "next/link";
import { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { basehub } from "basehub";
import { Pump } from "basehub/react-pump";
import { Post } from "@/components/ui/post";
import { MoreStories } from "@/components/ui/more-stories";
import { getMorePosts, postBySlugQuery } from "@/lib/queries";

export async function generateStaticParams() {
  const {
    blog: { posts },
  } = await basehub({ cache: "no-store" }).query({
    blog: {
      posts: {
        items: {
          _slug: true,
        },
      },
    },
  });

  return posts.items.map((post) => ({ slug: post._slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { blog } = await basehub({
    next: { revalidate: 60 },
    draft: draftMode().isEnabled,
  }).query(postBySlugQuery(params.slug));
  const [post] = blog.posts.items;
  if (!post) notFound();

  return {
    title: `Post / ${post._title}`,
    description: post.excerpt,
  };
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <Pump
      next={{ revalidate: 60 }}
      draft={draftMode().isEnabled}
      queries={[postBySlugQuery(params.slug)]}
    >
      {async ([{ blog }]) => {
        "use server";

        const [post] = blog.posts.items;
        if (!post) notFound();

        const morePosts = await getMorePosts(
          params.slug,
          draftMode().isEnabled
        );

        return (
          <main className="container mx-auto px-5">
            <h2 className="mb-20 mt-8 text-2xl font-bold leading-tight tracking-tight md:text-4xl md:tracking-tighter">
              <Link href="/" className="hover:underline">
                Blog
              </Link>
              .
            </h2>
            <Post post={post} />
            <hr className="border-accent-2 mt-28 mb-24" />
            <MoreStories morePosts={morePosts} />
          </main>
        );
      }}
    </Pump>
  );
}
