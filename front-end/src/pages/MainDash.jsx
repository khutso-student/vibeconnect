import React, { useState, useContext  } from 'react';
import Dashbaord from './Dashboard';
import EventSide from './EventSide';
import OverView from './OverView';
import Settings from './Settings';
import {AuthContext} from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; 

import Logo from '../assets/Logo.svg';
import { IoIosSearch } from "react-icons/io";
import { TbLayoutDashboard } from "react-icons/tb"; 
import { CiBoxList } from "react-icons/ci"; 
import { GoChecklist } from "react-icons/go"; 
import { IoSettingsOutline } from "react-icons/io5";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { RxHamburgerMenu } from "react-icons/rx"; 
import { IoClose } from "react-icons/io5"; 

export default function MainDash() {
    const [activeTab, setActiveTab] = useState('Dashbaord');
    const [sideNavOpen, setSideNavOpen] = useState(true);
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
    };

    const toggleSideNav = () => {
        setSideNavOpen((prev) => !prev);
 

    };

    const handleLogout = () => {
        logout();
        navigate('/login'); 
    };

    const navButtonClass = (tabName) =>
        `flex justify-start items-center w-full py-2.5 px-6 gap-2 text-sm rounded-md cursor-pointer transition-all duration-200 mb-2 ${
      activeTab === tabName
        ? 'bg-[#F46BF9] text-[#fff] hover:text-white'
        : 'bg-[#EAECFC] text-[#344576] hover:bg-[#F46BF9] hover:text-white'
    }`;

    const mobileClass = (tabName) =>
      `flex justify-center items-center  w-10 h-10 rounded-md text-xl ${
     activeTab === tabName
        ? 'bg-[#F46BF9] text-[#fff] hover:text-white'
        : 'bg-[#EAECFC] text-[#344576] hover:bg-[#F46BF9] hover:text-white'
    }`;

    

  return (
    <div className="flex flex-col w-full h-screen bg-[#F6F6F6]">
      {/* Top bar */}
      <div className="flex flex-col gap-2  bg-[#fff] w-full h-auto p-2">
        <div className='flex justify-between items-center  w-full'>
            <div className="flex items-center gap-3">
            <a href="">
              <img src={Logo} alt="Logo" className="w-40" />
            </a>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[#949494] bg-[#F6F6F6] w-1/2 h-10 rounded-md border border-[#EAEAEA] p-3">
              <IoIosSearch />
              <input
                type="search"
                placeholder="Search your items here....."
                className="w-full text-sm text-[#414141] focus:outline-none"
              />
            </div>

            <div className="flex gap-2 w-auto p-2">
              <button
                onClick={() => handleTabChange('Settings')}
                className="flex justify-center items-center text-[#414141] hover:text-white hover:animate-spin bg-[#F6F6F6] hover:bg-[#F46BF9] w-10 h-10 rounded-full duration-300 cursor-pointer"
              >
                <IoSettingsOutline />
              </button>
              <div className='w-10 h-10 bg-[#000] rounded-full hover:animate-ping duration-300'>

              </div>

                <button
                onClick={toggleSideNav}
                className="hidden  sm:flex items-center justify-center w-10 h-10 rounded-full bg-[#F6F6F6] text-[#414141] hover:bg-[#F46BF9] hover:text-white transition duration-300"
              >
                {sideNavOpen ? <IoClose /> : <RxHamburgerMenu />}
              </button>
            </div>
        </div>
          {/* movile nav bar */}
        <div className='flex justify-center items-center gap-5 sm:hidden w-full h-12 '>
            <button onClick={() => handleTabChange('Dashbaord') }
            className={mobileClass('Dashbaord')}>
                <TbLayoutDashboard />
            </button>

            <button onClick={() => handleTabChange('EventSide') }
            className={mobileClass('EventSide')}>
                <CiBoxList />
            </button>

              <button onClick={() => handleTabChange('OverView') }
            className={mobileClass('OverView')}>
                <GoChecklist />
            </button>

            <button onClick={handleLogout}
              className='flex justify-center items-center  w-10 h-10 rounded-md text-xl bg-[#EAECFC] text-[#344576] hover:bg-[#F46BF9] hover:text-white'>
                <RiLogoutCircleRLine />
          
            </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex gap-0.5 w-full h-full mt-2">
        {/* Side Nav */}
        <div
          className={`relative hidden  sm:flex flex-col items-center  h-full rounded-tr-[60px] border  py-8 px-2 transition-all duration-300 overflow-hidden ${
            sideNavOpen ? 'w-50 rounded-tr-[60px] bg-[#EEF0FF] border-[#EAEAEA]' : 'w-0 rounded-tr-none bg-[#eef0ff09] border-none'
          }`}
        >
          {sideNavOpen && (
            <>
              <h1 className="text-[#F46BF9] text-xl font-bold mb-1">
                {user?.role || "User"}
              </h1>
              <p className="text-sm text-[#555555] mb-8">
                {user?.name || "Guest"} 
              </p>

              <button
                onClick={() => handleTabChange('Dashbaord')}
                className={navButtonClass('Dashbaord')}
              >
                <TbLayoutDashboard />
                Dashboard
              </button>

              <button
                onClick={() => handleTabChange('EventSide')}
                className={navButtonClass('EventSide')}
              >
                <CiBoxList />
                Events
              </button>

              <button
                onClick={() => handleTabChange('OverView')}
                className={navButtonClass('OverView')}
              >
                <GoChecklist />
                OverView
              </button>

              <button onClick={handleLogout}
              className='absolute bottom-2 bg-[#EAECFC] hover:bg-[#F46BF9] text-[#344576] hover:text-white  flex justify-center items-center w-auto p-4 gap-2 text-sm rounded-full cursor-pointer transition-all duration-200'>
                <RiLogoutCircleRLine />
          
              </button>
            </>
          )}
        </div>



        {/* Main panel */}
        <div className="flex-1 overflow-y-auto transition-all duration-300">
          {activeTab === 'Dashbaord' && <Dashbaord />}
          {activeTab === 'EventSide' && <EventSide />}
          {activeTab === 'OverView' && <OverView />}
          {activeTab === 'Settings' && <Settings />}
        </div>
      </div>
    </div>
  );
}
