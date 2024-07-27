import ThreadCard from "@/components/cards/ThreadCard";
import Pagination from "@/components/shared/Pagination";
import { fetchFilteredPosts } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home({
  params,
  searchParams,
}: {
  params: { filter: string },
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const result = await fetchFilteredPosts(
    searchParams.page ? +searchParams.page : 1,
    3,
    params.filter
  );

  
  return (
    <>
      <h1 className="head-text text-left">Popular Hoots</h1>

      <section className="mt-9 flex flex-col gap-10">
        {result.posts.length === 0 ? (
          <p className="no-result">No threads found</p>
        ) : (
          <>
            {result.posts.map((post) => {
              const thread = JSON.parse(JSON.stringify(post))
              const userData = JSON.parse(JSON.stringify(userInfo))
              return (
                <ThreadCard
                  key={thread._id}
                  id={thread._id}
                  currentUserId={userData?._id || ""}
                  accountId={userData?.id || ""}
                  parentId={thread.parentId}
                  content={thread.text}
                  author={thread.author}
                  createdAt={thread.createdAt}
                  comments={thread.children}
                  initialLikedBy={thread.likedBy}
                />
            )})}
          </>
        )}
      </section>

      <Pagination
        path={`popular/${params.filter}`}
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
      />
    </>
  );
}
