import { fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";

interface Props {
  currentUserId: string;
  accountId: string;
  userId: string;
}

const ThreadsTab = async ({ currentUserId, accountId, userId }: Props) => {
  let result = await fetchUserPosts(userId);

  if (!result) redirect("/");

  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.threads.map((thread: any) => {
        const post = JSON.parse(JSON.stringify(thread))
        
        return (
            <ThreadCard
              key={post._id}
              id={post._id}
              currentUserId={currentUserId}
              accountId={accountId}
              parentId={post.parentId}
              content={post.text}
              author={
                {name: result.name, image: result.image, id: result.id} 
              }
              createdAt={post.createdAt}
              comments={post.children}
              initialLikedBy={post.likedBy}
            />
      )})}
    </section>
  );
};

export default ThreadsTab;
