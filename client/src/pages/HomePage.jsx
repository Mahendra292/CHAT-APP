import React, { useContext, useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import bgImage from '../assets/bgImage.svg';
import {ChatContext} from '../../context/ChatContext'

export const HomePage = () => {
  const {selectedUser} = useContext(ChatContext)

  return (
    <div
      className="border w-full h-screen sm:px-[15%] sm:py-[5%]"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div
        className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-full grid relative grid-cols-1
          ${
            selectedUser
              ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]'
              : 'md:grid-cols-2'
          }`}
      >
        <Sidebar/>
        <ChatContainer />
        <RightSidebar />
      </div>
    </div>
  )
}

export default HomePage
