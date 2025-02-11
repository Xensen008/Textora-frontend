import React from 'react'
import {PiUserCircle} from 'react-icons/pi'
import { useSelector } from 'react-redux';

function Avatar({ userId, name, imageUrl, width, height, iconColor = 'currentColor' }) {
    const onlineUser = useSelector((state) => state?.user?.onlineUser || []);
    let avatarName = "";
    if (name) {
        const splitName = name.split(" ");
        if (splitName.length > 1) {
            avatarName = `${splitName[0][0]}${splitName[1][0]}`.toUpperCase();
        } else {
            avatarName = `${splitName[0][0]}`;
        }
    }
    const bgColor = ["bg-red-200", "bg-blue-200", "bg-green-200", "bg-yellow-200", "bg-indigo-200", "bg-purple-200", "bg-pink-200"];
    const randomNum = Math.floor(Math.random() * bgColor.length);

    const isOnline = Array.isArray(onlineUser) && onlineUser.includes(userId);

    return (
        <div style={{ width: width + "px", height: height + "px" }} 
             className={`text-slate-800 overflow-hidden relative rounded-full shadow-sm text-xl font-bold transition-all duration-300 ease-in-out
                        ${isOnline ? 'ring-[3px] ring-green-500 ring-offset-2 ring-offset-white' : ''}`}>
            {imageUrl ? (
                <img src={imageUrl} alt={name} width={width} height={height} className='object-cover rounded-full'/>
            ) : (
                name ? (
                    <div style={{ width: width + "px", height: height + "px" }} 
                         className={`flex justify-center items-center ${bgColor[randomNum]} rounded-full`}>
                        {avatarName}
                    </div>
                ) : (
                    <div className='w-fit mx-auto mb-2'>
                        <PiUserCircle size={width} color={iconColor}/>
                    </div>
                )
            )}
        </div>
    );
}

export default Avatar