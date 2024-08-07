import ProfileHeader from "@/components/shared/ProfileHeader";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from 'next/navigation'
import { profileTabs } from "@/constants";
import ThreadsTab from "@/components/shared/ThreadsTab";
import Image from "next/image";
import LikedTab from "@/components/shared/LikedTab";
import RepliesTab from "@/components/shared/RepliesTab";

async function Page({ params }: { params: { id: string }}) {
    const user = await currentUser();
    if(!user) redirect('/sign-in');  

    const userInfo = await fetchUser(params.id);
    if(!userInfo?.onboarded) redirect('/onboarding');

    const userData = JSON.parse(JSON.stringify(userInfo))

    return (
        <section>
            <ProfileHeader
                accountId={userInfo.id}
                authUserId={user.id}
                name={userInfo.name}
                username={userInfo.username}
                imgUrl={userInfo.image}
                bio={userInfo.bio}
            />

            <div className="mt-9">
                <Tabs defaultValue="threads" className="w-full">
                    <TabsList className="tab">
                        {profileTabs.map((tab) => (
                            <TabsTrigger key={tab.label} value={tab.value} className="tab">
                                <Image
                                  src={tab.icon}
                                  alt={tab.label}
                                  width={24}
                                  height={24}
                                  className="object-contain"
                                />
                                <p className="max-sm:hidden">{tab.label}</p>
                            
                                {tab.label === 'Threads' && (
                                    <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                                        {userInfo?.threads.length}
                                    </p>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent key="content-threads" value="threads" className="w-full text-light-1">
                        <ThreadsTab 
                            currentUserId={userData._id}
                            accountId={user.id}
                            userId={userData.id}
                        />
                    </TabsContent>

                    <TabsContent key="content-replies" value="replies" className="w-full text-light-1">
                        <RepliesTab 
                            currentUserId={userData._id}
                            accountId={user.id}
                        />
                    </TabsContent>

                    <TabsContent key="content-liked" value="liked" className="w-full text-light-1">
                        <LikedTab 
                            currentUserId={userData._id}
                            likedThreads={userData.likedThreads}
                            accountId={user.id}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </section>
    )
} 

export default Page;