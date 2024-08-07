"use server"

import { connectToDB } from "../mongoose"
import User from "../models/user.model"
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

interface Props {
    userId: string
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
}

interface LikedProps {
    userId: string;
    threadId: string;
    path?: string;
}

export async function updateUser({
    username, userId, name, bio, image, path
} : Props): Promise<void> {
    connectToDB();

    try {
        await User.findOneAndUpdate(
            { id: userId },
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true,
            },
            { upsert: true }
        );

        if(path === '/profile/edit') {
            revalidatePath(path)
        }

    } catch(error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
    }
}

export async function fetchUser(userId: string) {
    try {
        connectToDB();
        return await User.findOne({ id: userId })

    } catch(error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
    }
}

export async function fetchUserPosts(userId: string) {
    try{
        connectToDB();

        const threads = await User.findOne({ id: userId })
                                    .populate({
                                        path: 'threads',
                                        model: Thread,
                                        populate: {
                                            path: 'children',
                                            model: Thread,
                                            populate: {
                                                path: 'author',
                                                model: User,
                                                select: 'name image id'
                                            }
                                        }
                                    })
                                    
        return threads;                                

    } catch (error: any) {
        throw new Error(`Failed to fetch user posts: ${error.message}`)
    }
}

export async function fetchUsers({ 
    userId,
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc"
} : {
   userId: string;
   searchString?: string;
   pageNumber?: number;
   pageSize?: number;
   sortBy?: SortOrder; 
}) {
    try {
        connectToDB();

        const skipAmount = (pageNumber - 1) * pageSize;

        const regex = new RegExp(searchString, "i");

        const query: FilterQuery<typeof User> = {
            id: { $ne: userId }
        }

        if(searchString.trim() !== '') {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } }
            ]
        }

        const sortOptions = { createdAt: sortBy }

        const usersQuery = User.find(query)
                                .sort(sortOptions)
                                .skip(skipAmount)
                                .limit(pageSize)

        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec();

        const isNext = totalUsersCount > skipAmount + users.length;

        return { users, isNext}

    } catch (error: any) {
        throw new Error(`Failed to fetch users: ${error.message}`)
    }
}

export async function getActivity(userId: string) {
    try {
        connectToDB();

        const userThreads = await Thread.find({ author: userId })

        const childThreadIds = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children)
        }, []) 

        const replies = await Thread.find({
            _id: { $in: childThreadIds },
            author: { $ne: userId },
        }).populate({
            path: 'author',
            model: User,
            select: 'name image _id'
        })
        
        return replies;


    } catch (error: any) {
        throw new Error(`Failed to fetch activity: ${error.message}`)
    }
}

export async function addLikedPost({
    userId, threadId, path
  }: LikedProps) {
    try {
        const threadExists = await Thread.exists({ _id: threadId });
        if (!threadExists) {
          throw new Error('Thread not found');
        }
    
        await User.findByIdAndUpdate(
          userId,
          { $addToSet: { likedThreads: threadId } },
          { new: true }
        );
    
        if (path) {
          revalidatePath(path);
        }
      } catch (error: any) {
        throw new Error(`Failed to add thread to liked threads: ${error.message}`);
      }
}

export async function removeLikedPost({
    userId,
    threadId,
    path,
  }: LikedProps): Promise<void> {
    connectToDB();
  
    try {
      await User.findByIdAndUpdate(
        userId,
        { $pull: { likedThreads: threadId } },
        { new: true } 
      );
  
      if (path) {
        revalidatePath(path);
      }
    } catch (error: any) {
      throw new Error(`Failed to remove thread from liked threads: ${error.message}`);
    }
}

export const fetchUserComments = async (userId: string) => {
    try {
      await connectToDB();
  
      const userReplies = await Thread.find({ author: userId, parentId: { $ne: null } })
                                        .populate({
                                            path: 'author',
                                            model: User,
                                            select: 'name image _id id'
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
                                        })
  
      return userReplies;
    } catch (error) {
      console.error("Failed to fetch user replies:", error);
      throw new Error("Failed to fetch user replies");
    }
  };