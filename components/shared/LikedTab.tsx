import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";
import { fetchThreadById } from "@/lib/actions/thread.actions";

interface Props {
  currentUserId: string;
  likedThreads: string[];
  accountId: string;
}

const LikedTab = async ({ currentUserId, likedThreads, accountId}: Props) => {
  let result = likedThreads;

  if (!result) redirect("/");

  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.map(async (threadId: any) => {
        const thread = await fetchThreadById(threadId)
        const post = JSON.parse(JSON.stringify(thread))
        
        return (
            <ThreadCard
              key={post._id}
              id={post._id}
              currentUserId={currentUserId}
              accountId={accountId}
              parentId={post.parentId}
              content={post.text}
              author={post.author}
              createdAt={post.createdAt}
              comments={post.children}
              initialLikedBy={post.likedBy}
            />
      )})}
    </section>
  );
};

export default LikedTab;
