import ThreadCard from "@/components/cards/ThreadCard";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Comment from "@/components/forms/Comment"

const Page = async ({ params }: { params: { id: string } }) => {
    if(!params.id) return null;

    const user = await currentUser();
    if(!user) redirect('/sign-in');

    const userInfo = await fetchUser(user.id);
    if(!userInfo?.onboarded) redirect('/onboarding')

    const thread = await fetchThreadById(params.id);
    const post = JSON.parse(JSON.stringify(thread))
    const userData = JSON.parse(JSON.stringify(userInfo))
    
    return (
        <section className="relative">
        <div>
          <ThreadCard
            key={post._id}
            id={post._id}
            currentUserId={userData?._id || ""}
            accountId={userData?.id}
            parentId={post.parentId}
            content={post.text}
            author={post.author}
            createdAt={post.createdAt}
            comments={post.children}
            initialLikedBy={post.likedBy}
          />
        </div>

        <div className="mt-7">
          <Comment 
            threadId={post._id} 
            currentUserImg = {userInfo.image}  
            currentUserId = {JSON.stringify(userInfo._id)}
          />
        </div>

        <div className="mt-10">
          {post.children.map((childItem: any) => (
            <ThreadCard
            key={childItem._id}
            id={childItem._id}
            currentUserId={userData?._id || ""}
            accountId={userData?.id}
            parentId={childItem.parentId}
            content={childItem.text}
            author={childItem.author}
            createdAt={childItem.createdAt}
            comments={childItem.children}
            isComment
            initialLikedBy={childItem.likedBy}
          />
          ))}
        </div>
      </section>
    )
};

export default Page;
