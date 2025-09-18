import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from "react-router-dom";
import Events from '../component/Events';
import Liked from '../component/Liked';
import Notification from '../component/Notification';
import Profile from '../component/Profile';

import WhiteLogo from '../assets/WhiteLogo.svg';
import { MdSearch } from "react-icons/md";

export default function Home() {

    const [activeTab, setActiveTab] = useState('Events');
    const [searchTerm, setSearchTerm] = useState(''); // <-- lifted search state
    const { user } = useContext(AuthContext);
    
    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
    };

    const navButtonClass = (tabName) =>
        ` w-20 py-1.5 px-4 gap-2 text-sm cursor-pointer transition-all duration-200 ${
          activeTab === tabName
            ? 'text-[#F46BF9]'
            : 'text-white hover:text-[#F46BF9]'
        }`;

    return(
        <div className="flex flex-col w-full h-screen">
            <div className="flex flex-col w-full h-55 bg-[#1E1E1E] p-3">
                <div className="flex justify-between items-center w-full h-20 mb-2">
                    <a href="">
                        <img src={WhiteLogo} alt="Site Logo" className='w-30 sm:w-40' />
                    </a>

                    <div className="flex justify-end w-auto gap-5 p-1 sm:justify-center sm:w-1/2">
                        <div className='hidden sm:flex w-1/2'>
                            <button onClick={() => handleTabChange('Events')}
                                className={navButtonClass('Events')}>
                                Events
                            </button>
                            {user?.role === 'user' &&(
                                <button onClick={() => handleTabChange('Liked')}
                                    className={navButtonClass('Liked')}>
                                    Liked
                                </button>
                            )}
                        </div>

                        {user?.role === 'admin' && (
                        <Link to='/maindashboard'
                            className='hidden justify-center items-center sm:flex py-1.5 px-4 border border-[#F46BF9] hover:border-white text-[#F46BF9] hover:text-white text-sm rounded-md duration-300'>
                            Dashboard
                        </Link>
                        )}

                        <Notification />
                        <Profile />
                    </div>
                </div>

                <h1 className='text-white text-xl sm:text-3xl font-semibold mb-3'>
                    Find your event here, {user?.name || "Guest"} 
                </h1>

                {/* Search Input */}
                <div className='flex items-center gap-2 w-full sm:w-1/2 h-13 bg-white rounded-xl px-5 py-3'>
                    <MdSearch className='text-[#949494] text-2xl'/>
                    <input 
                        type="search" 
                        placeholder='Search by event name, or place'
                        value={searchTerm} // <-- bind value
                        onChange={(e) => setSearchTerm(e.target.value)} // <-- update state
                        className='w-full text-[#686767] text-sm sm:text-md focus:outline-none'
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === 'Events' && <Events searchTerm={searchTerm} />} {/* <-- pass prop */}
                {activeTab === 'Liked' && <Liked />}
            </div>
        </div>
    )
}
