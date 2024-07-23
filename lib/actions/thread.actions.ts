"use server"

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
    text: string,
    author: string,
    path: string,
}

interface LikedProps {
    userId: string;
    threadId: string;
    path?: string;
}

export async function createThread({ text, author, path }: Params) {
    try{
        connectToDB();

        const createdThread = await Thread.create({
            text, author,  
        });

        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id }
        })

        revalidatePath(path);

    } catch(error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
    }

    
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    const postsQuery = Thread.find({ parentId: { $in: [null, undefined] }})
                                    .sort({ createdAt: 'desc' })
                                    .skip(skipAmount)
                                    .limit(pageSize)
                                    .populate({ path: 'author', model: User })
                                    .populate({ path: 'children', 
                                        populate: { path: 'author', model: User, select: "_id name parentId image" }})

    const totalPostsCount = await Thread.countDocuments({ parentId: { $in: [null, undefined] }})
    
    const posts = await postsQuery.exec();

    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext };
}

export async function fetchThreadById(id: string){
    connectToDB();

    try{
        const thread = await Thread.findById(id)
                                    .populate({
                                        path: "author",
                                        model: User,
                                        select: "_id id name image"
                                    })
                                    .populate({
                                        path: 'children',
                                        populate: [
                                            {
                                                path: 'author',
                                                model: User,
                                                select: "_id id name parentId image"
                                            },
                                            {
                                                path: 'children',
                                                model: Thread,
                                                populate: {
                                                    path: 'author',
                                                    model: User,
                                                    select: "_id id name parentId image"
                                                }
                                            }
                                        ]
                                    }).exec()
    
        return thread;              
    } catch(error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
    }
}

export async function addCommentToThread(
    threadId: string,
    commentText: string,
    userId:string,
    path:string,
) {
    connectToDB();

    try {
        const originalThread = await Thread.findById(threadId);

        if(!originalThread) {
            throw new Error("Thread not found")
        }

        const commentThread = new Thread({
            text: commentText,
            author: userId,
            parentId: threadId,
        })

        const saveCommentThread = await commentThread.save();

        originalThread.children.push(saveCommentThread._id)

        await originalThread.save()

        revalidatePath(path)

    }  catch (error: any) {
        throw new Error(`Error adding comment to thread: ${error.message}`)
    }
}

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
    const childThreads = await Thread.find({ parentId: threadId });
  
    const descendantThreads = [];
    for (const childThread of childThreads) {
      const descendants = await fetchAllChildThreads(childThread._id);
      descendantThreads.push(childThread, ...descendants);
    }
  
    return descendantThreads;
}

export async function deleteThread(id: string, path: string): Promise<void> {
    try {
      connectToDB();

      const mainThread = await Thread.findById(id)
  
      if (!mainThread) {
        throw new Error("Thread not found");
      }

      const descendantThreads = await fetchAllChildThreads(id);
  
      const descendantThreadIds = [
        id,
        ...descendantThreads.map((thread) => thread._id),
      ];

      let parentThreadId: string | null = null;
      
      if (mainThread.parentId) {
          parentThreadId = mainThread.parentId;
      }

      if (parentThreadId) {
          await Thread.findByIdAndUpdate(parentThreadId, {
              $pull: { children: id },
          });
      }

      const uniqueAuthorIds = new Set(
        [
          ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
          mainThread.author?._id?.toString(),
        ].filter((id) => id !== undefined)
      );

      const usersWhoLiked = await User.find({ likedThreads: { $in: descendantThreadIds } });

      for (const user of usersWhoLiked) {
        await User.findByIdAndUpdate(user._id, {
          $pull: { likedThreads: { $in: descendantThreadIds } },
        });
      }

      await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

      await User.updateMany(
        { _id: { $in: Array.from(uniqueAuthorIds) } },
        { $pull: { threads: { $in: descendantThreadIds } } }
      );
  
      revalidatePath(path);
    } catch (error: any) {
      throw new Error(`Failed to delete thread: ${error.message}`);
    }
}

export async function addLikedByUser({
    userId,
    threadId,
    path,
  }: LikedProps): Promise<void> {
    connectToDB();
  
    try {
      const userExists = await User.exists({ _id: userId });
      if (!userExists) {
        throw new Error('User not found');
      }
  
      await Thread.findByIdAndUpdate(
        threadId,
        { $addToSet: { likedBy: userId } }, 
        { new: true }
      );
  
      if (path) {
        revalidatePath(path);
      }
    } catch (error: any) {
      throw new Error(`Failed to add user to likedBy array: ${error.message}`);
    }
}

export async function removeLikedByUser({
    userId,
    threadId,
    path,
  }: LikedProps): Promise<void> {
    connectToDB();
  
    try {
      const userExists = await User.exists({ _id: userId });
      if (!userExists) {
        throw new Error('User not found');
      }
  
      await Thread.findByIdAndUpdate(
        threadId,
        { $pull: { likedBy: userId } }, 
        { new: true }
      );
  
      if (path) {
        revalidatePath(path);
      }
    } catch (error: any) {
      throw new Error(`Failed to remove user from likedBy array: ${error.message}`);
    }
}

