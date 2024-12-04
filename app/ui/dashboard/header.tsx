import React from 'react'
import Image from 'next/image';
import Search from '@/app/ui/search';
import { BellIcon,ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'

export default function Header() {
  return (
     
      <div className="flex flex-col my-1 mr-1  bg-gray-10  ">
        <div className="flex flex-row">
          <div className="basis-1/2 text-left ml-1 mb-2 mt-1" >
            <div className="mt-2 flex items-center justify-between gap-2 md:mt-2">
              <Search placeholder="Search classes..." />
            </div>
          </div>
          <div className="basis-1/4 text-center mb-2 mt-1 ">
          
          </div>
          <div className="basis-1/4 items-end place-items-end mb-2 mt-1 ">
                <div className='flex flex-row space-x-4 my-2 mr-5'>
                    <BellIcon className="w-8 h-8 mr-2" />
                    <ChatBubbleLeftEllipsisIcon className="w-8 h-8 mr-2" />
                    <Image className='w-8 h-8 mr-2 rounded-full' src="https://loremflickr.com/640/480" 
                    height={28} width={28} alt="profile"/>
                    <div className='text-xs text-left mt-2'>
                      Rishi
                    </div>
                </div>
          </div>  
        </div>
            <hr className ="h-px p-0 border-0 bg-gray-300"></hr>  
      </div>
  )
}
