'use client';

import React from 'react'
import { 
FacebookShareButton, 
FacebookIcon, 
RedditShareButton, 
RedditIcon, 
WhatsappShareButton, 
WhatsappIcon, 
LinkedinShareButton, 
LinkedinIcon,
EmailShareButton,
EmailIcon,
TelegramShareButton,
TelegramIcon, 
} from 'next-share'; 

const Page = ({ params }: { params: { id: string } }) => {
    return (
        <div className="p-6 max-w-4xl mx-auto text-center text-light-1">
            <h1 className="text-4xl font-bold mb-6">Social Share</h1>
            <p className="text-lg mb-8">
                Share this post with your friends on social media.
            </p>
            <div className="flex justify-center space-x-4 mb-8"> 
                <FacebookShareButton 
                    url={`http://localhost:3000/thread/${params.id}`} > 
                    <FacebookIcon size={32} round /> 
                </FacebookShareButton> 
                <EmailShareButton
                    url={`http://localhost:3000/thread/${params.id}`} >
                    <EmailIcon size={32} round />
                </EmailShareButton>
                <RedditShareButton 
                    url={`http://localhost:3000/thread/${params.id}`} > 
                    <RedditIcon size={32} round /> 
                </RedditShareButton> 
                <WhatsappShareButton 
                    url={`http://localhost:3000/thread/${params.id}`} > 
                    <WhatsappIcon size={32} round /> 
                </WhatsappShareButton> 
                <LinkedinShareButton 
                    url={`http://localhost:3000/thread/${params.id}`} > 
                    <LinkedinIcon size={32} round /> 
                </LinkedinShareButton>
                <TelegramShareButton
                    url={`http://localhost:3000/thread/${params.id}`} >
                    <TelegramIcon size={32} round />
                </TelegramShareButton> 
            </div> 
            
            <div className="text-left mt-10">
                <h2 className="text-2xl font-semibold mb-4">How to Share</h2>
                <p className="text-base">Click on any of the icons above to share this post on your favorite social media platform.</p>
            </div>
        </div> 
        
    ) 
};

export default Page
