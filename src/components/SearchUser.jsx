import React from 'react'
import { IoSearchOutline } from 'react-icons/io5'

function SearchUser() {
  return (
    <div className='fixed top-0 bottom-0 right-0 left-0 bg-slate-700 bg-opacity-40 p-3'>
       <div className='w-full max-w-lg mx-auto mt-14 m-1'>
            <div className='bg-[#fff] rounded h-14 flex overflow-hidden'>
                <input type="text" placeholder='Search User' className='w-full outline-none py-1 h-full px-4'/>
                <div className='h-14 w-14 flex justify-center items-center'>
                    <IoSearchOutline size={25} />
                </div>
            </div>
       </div>
    </div>
  )
}

export default SearchUser