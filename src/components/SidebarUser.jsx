import React, { useState } from 'react';
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import { FaUserPlus } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { BiLogOut } from 'react-icons/bi';
import Avatar from './Avatar';
import { useSelector } from 'react-redux';
import EditUserData from './EditUserData';

function SidebarUser() {
    const user = useSelector(state => state?.user);
    const [editUserOpen, setEditUserOpen] = useState(true);

    return (
        <div className="w-full h-full">
            <div className="bg-[#111b21] w-12 h-full rounded-tr-md rounded-br-md py-5 flex flex-col items-center justify-between">
                <div>
                    <NavLink to="/chat" className={(isActive) => `w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-[#202c33] rounded text-white ${isActive && "bg-[#26333d]"}`} title="Chat">
                        <IoChatbubbleEllipsesOutline size={25} />
                    </NavLink>
                    <NavLink to="/add-user" className="w-12 h-12 flex justify-center items-center cursor-pointer mt-2 hover:bg-[#202c33] text-white rounded" title="Add User">
                        <FaUserPlus size={25} />
                    </NavLink>
                </div>

                <div className='flex flex-col items-center border-none'>
                    <button
                        className='mx-auto'
                        title={`profile- ${user?.name}`}
                        onClick={() => setEditUserOpen(true)} 
                    >
                        <Avatar
                            width={40}
                            height={40}
                            iconColor="#fff"
                            imageUrl={user?.profile_pic}
                            name={user?.name}
                        />
                    </button>
                    <button className="w-12 h-12 flex justify-center items-center cursor-pointer mt-2 hover:bg-[#202c33] text-red-600 rounded" title="Logout">
                        <span className='-ml-2'> <BiLogOut size={25} /></span>
                    </button>
                </div>
            </div>

            {/* user details */}
            {
                editUserOpen && (
                    <EditUserData
                        onClose={() => {
                            setEditUserOpen(false);
                        }}
                        user={user}
                    />
                )
            }
        </div>
    );
}

export default SidebarUser;