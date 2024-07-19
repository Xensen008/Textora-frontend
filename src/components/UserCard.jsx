import React from 'react'
import Avatar from './Avatar'
import { Link } from 'react-router-dom'

function UserCard({user, onclose}) {
  return (
    <Link to={'/'+user?._id} onClick={onclose} className='flex items-center gap-2 lg:p-4 border border-transparent border-b-slate-300 p-2 rounded hover:bg-[#a4b1a1]'>
        <div>
            <Avatar
            width={50}
            height={50}
            imageUrl={user?.profile_pic}
            name={user.name}
            />
        </div>
        <div>
           <div className='font-semibold text-ellipsis line-clamp-1'>
             {user?.name}
           </div>
            <p className='text-ellipsis line-clamp-1'>{user?.email}</p>
        </div>
    </Link>
  )
}

export default UserCard