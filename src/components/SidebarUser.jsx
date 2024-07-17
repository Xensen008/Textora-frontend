import React from 'react';
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import { FaUserPlus } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

function SidebarUser() {
    return (
        <div className="w-full h-full">
            <div className="bg-[#111b21] w-12 h-full rounded-tr-md rounded-br-md py-5 flex flex-col items-center">
                <div>
                    <NavLink to="/chat" className={(isActive) => `w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-[#202c33] rounded text-white ${isActive && "bg-[#26333d]"}`} title="Chat">
                        <IoChatbubbleEllipsesOutline size={29} />
                    </NavLink>
                    <NavLink to="/add-user" className="w-12 h-12 flex justify-center items-center cursor-pointer mt-2 hover:bg-[#202c33] text-white rounded" title="Add User">
                        <FaUserPlus size={29} />
                    </NavLink>
                </div>

                <div>
                    
                </div>
            </div>
        </div>
    );
}

export default SidebarUser;