import React from 'react'
import {PiUserCircle} from 'react-icons/pi'
import { useSelector } from 'react-redux';

function Avatar({ userId, name, imageUrl, width, height, iconColor = '#dbdee1' }) {
    const onlineUser = useSelector((state) => state?.user?.onlineUser || []);
    
    const getInitials = (name) => {
        if (!name) return "";
        const words = name.split(" ");
        if (words.length >= 2) {
            return `${words[0][0]}${words[1][0]}`.toUpperCase();
        }
        return name[0].toUpperCase();
    };

    const getRandomColor = (userId) => {
        const colors = [
            "#5865f2", // Discord Blurple
            "#949cf7", // Light Purple
            "#4f545c", // Grey
            "#2d2f33", // Dark Grey
            "#36393f", // Discord Dark
        ];
        
        if (!userId) return colors[0];
        const index = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        return colors[index];
    };

    const isOnline = Array.isArray(onlineUser) && onlineUser.includes(userId);
    const bgColor = getRandomColor(userId);

    return (
        <div style={{ width: width + "px", height: height + "px" }} 
             className={`relative overflow-hidden rounded-full ${
                 isOnline ? 'ring-[3px] ring-[#23a559]' : ''
             }`}>
            {imageUrl ? (
                <img 
                    src={imageUrl} 
                    alt={name} 
                    width={width} 
                    height={height} 
                    className="w-full h-full object-cover"
                />
            ) : name ? (
                <div 
                    style={{ backgroundColor: bgColor }}
                    className="w-full h-full flex items-center justify-center text-[#dbdee1] font-medium"
                >
                    <span style={{ fontSize: `${Math.floor(width * 0.4)}px` }}>
                        {getInitials(name)}
                    </span>
                </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: bgColor }}>
                    <PiUserCircle size={Math.floor(width * 0.5)} className="text-[#dbdee1]"/>
                </div>
            )}
        </div>
    );
}

export default Avatar