"use client"
import Image from "next/image";
import Link from "next/link";
import DeleteThread from "../forms/DeleteThread";
import { addLikedByUser, removeLikedByUser } from "@/lib/actions/thread.actions";
import { addLikedPost, removeLikedPost } from "@/lib/actions/user.actions";
import { useState } from "react";
import { format } from 'date-fns';
import { usePathname } from "next/navigation";

interface Props {
  id: string;
  currentUserId: string;
  accountId: string;
  parentId: string | null;
  content: string;
  author: {
    name: string;
    image: string;
    id: string;
  };
  createdAt: string;
  comments: {
    author: {
      image: string;
    };
  }[];
  isComment?: boolean;
  initialLikedBy: string[];
}

const ThreadCard = ({
  id,
  currentUserId,
  accountId,
  parentId,
  content,
  author,
  createdAt,
  comments,
  isComment,
  initialLikedBy,
}: Props) => {
  const pathname = usePathname();
  const [likedBy, setLikedBy] = useState<string[]>(initialLikedBy);
  const isLiked = likedBy.includes(currentUserId);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await removeLikedByUser({userId: currentUserId, threadId: id, path: pathname});
        await removeLikedPost({userId: currentUserId, threadId: id, path: pathname});
        setLikedBy((prev) => prev.filter((userId) => userId !== currentUserId));
      } else {
        await addLikedByUser({userId: currentUserId, threadId: id, path: pathname});
        await addLikedPost({userId: currentUserId, threadId: id, path: pathname});
        setLikedBy((prev) => [...prev, currentUserId]);
      }
    } catch (error) {
      console.error("Failed to update like status:", error);
    }
  };

  const formattedDate = format(new Date(createdAt), "p - d MMM yyyy");

  return (
    <article
      className={`lex w-full flex-col rounded-xl  ${
        isComment ? `px-0 xs:px-7` : `bg-dark-2 p-7`
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex w-full flex-1 flex-row gap-4">
          <div className="flex flex-col items-center">
            <Link href={`/profile/${author.id}`} className="relative h-11 w-11">
              <Image
                src={author.image}
                alt="Profile image"
                fill
                className="cursor-pointer rounded-full"
              />
            </Link>
            <div className="thread-card_bar" />
          </div>

          <div className="flex w-full flex-col">
            <Link href={`/profile/${author.id}`} className="w-fit">
              <h4 className="cursor-pointer text-base-semibold text-light-1">
                {author.name}
              </h4>
            </Link>

            <p className="mt-2 text-small-regular text-light-2">{content}</p>

            <div className={`${isComment && `mb-10`} mt-5 flex flex-col gap-3`}>
              <div className="flex gap-3.5">
                <Image
                  src={isLiked ? "/assets/heart-filled.svg" : "/assets/heart-gray.svg"}
                  alt="like"
                  width={24}
                  height={24}
                  className="cursor-pointer object-contain"
                  onClick={handleLike}
                />

                <Link href={`/thread/${id}`}>
                  <Image
                    src="/assets/reply.svg"
                    alt="like"
                    width={24}
                    height={24}
                    className="cursor-pointer object-contain"
                  />
                </Link>

                 <Link href={`/thread/${id}/share`}>
                  <Image
                    src="/assets/repost.svg"
                    alt="like"
                    width={24}
                    height={24}
                    className="cursor-pointer object-contain"
                  />
                 </Link>
               
              </div>

              {isComment && comments.length > 0 && (
                <Link href={`/thread/${id}`}>
                  <p className="mt-1 text-subtle-medium text-gray-1">
                    {comments.length} replies
                  </p>
                </Link>
              )}
            </div>
          </div>
        </div>
        <DeleteThread
          threadId={JSON.stringify(id)}
          currentUserId={accountId}
          authorId={author.id}
          parentId={parentId}
          isComment={isComment}
        />
      </div>
      {!isComment && comments.length > 0 && (
        <div className='ml-1 mt-3 flex items-center gap-2'>
          {comments.slice(0, 2).map((comment, index) => (
            <Image
              key={index}
              src={comment.author.image}
              alt={`user_${index}`}
              width={24}
              height={24}
              className={`${index !== 0 && "-ml-5"} rounded-full object-cover`}
            />
          ))}

          <Link href={`/thread/${id}`}>
            <p className='mt-1 text-subtle-medium text-gray-1'>
              {comments.length} repl{comments.length > 1 ? "ies" : "y"}
            </p>
          </Link>
        </div>
      )}

      {!isComment && (
        <div className="mt-5 flex items-center">
          <p className="ml-3 text-subtle-medium text-gray-1">
            {formattedDate}
          </p>
        </div>
      )}
    </article>
  );
};

export default ThreadCard;
