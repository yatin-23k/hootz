import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { fetchUserComments, getActivity } from "@/lib/actions/user.actions";

interface Props {
  currentUserId: string;
  accountId: string;
}

const LikedTab = async ({ currentUserId, accountId}: Props) => {

    const replies = await fetchUserComments(currentUserId);

  return (
    <section className="mt-9 flex flex-col gap-10">
      {replies.map((thread: any) => {
        const post = JSON.parse(JSON.stringify(thread))
        console.log("This is post...............")
        console.log(post)
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
