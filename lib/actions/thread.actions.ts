"use server"

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}

export async function createThread({ text, author, communityId, path }: Params) {
    try{
        connectToDB();

        const createdThread = await Thread.create({
            text, author, community: null, 
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
  
      // Find the thread to be deleted (the main thread)
      const mainThread = await Thread.findById(id).populate("author community");
  
      if (!mainThread) {
        throw new Error("Thread not found");
      }
  
      // Fetch all child threads and their descendants recursively
      const descendantThreads = await fetchAllChildThreads(id);
  
      // Get all descendant thread IDs including the main thread ID and child thread IDs
      const descendantThreadIds = [
        id,
        ...descendantThreads.map((thread) => thread._id),
      ];
  
      // Extract the authorIds and communityIds to update User and Community models respectively
      const uniqueAuthorIds = new Set(
        [
          ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
          mainThread.author?._id?.toString(),
        ].filter((id) => id !== undefined)
      );
  
      // Recursively delete child threads and their descendants
      await Thread.deleteMany({ _id: { $in: descendantThreadIds } });
  
      // Update User model
      await User.updateMany(
        { _id: { $in: Array.from(uniqueAuthorIds) } },
        { $pull: { threads: { $in: descendantThreadIds } } }
      );
  
      revalidatePath(path);
    } catch (error: any) {
      throw new Error(`Failed to delete thread: ${error.message}`);
    }
  }