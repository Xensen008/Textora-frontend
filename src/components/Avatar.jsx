import React from 'react'
import {PiUserCircle} from 'react-icons/pi'
function Avatar({userId, name, imageUrl, width, height, iconColor = 'currentColor' }) {
    let avatarName = "";
    if(name){
        const splitName = name.split(" ");
        if(splitName.length > 1){
            avatarName = `${splitName[0][0]}${splitName[1][0]}`.toUpperCase();
        }else{
            avatarName = `${splitName[0][0]}`;
        
        }
    } 
    const bgColor = ["bg-red-200","bg-blue-200","bg-green-200","bg-yellow-200","bg-indigo-200","bg-purple-200","bg-pink-200"];
    const randomNum= Math.floor(Math.random() * bgColor.length);
    return (
        <div style={{width : width+"px",height:height+"px"}} className={`text-slate-800 overflow-hidden rounded-full shadow-sm text-xl font-bold`}>
            {imageUrl ? (
                <img src={imageUrl} alt={name} width={width} height={height} className='overflow-hidden object-contain rounded-full'/>
            ) : (
                name ? (
                    <div style={{width : width+"px",height:height+"px"}} className={`overflow-hidden rounded-full flex justify-center items-center ${bgColor[randomNum]}`}>
                        {avatarName}
                    </div>
                ) : (
                    <div className='w-fit mx-auto mb-2'>
                        <PiUserCircle
                        size={width} color={iconColor}/>
                    </div> 
                )
            )}
        </div>
    )
}

export default Avatar