import React from 'react'
import logo  from "../assets/xenssen_logo.png"

function AuthLayout({children}) {
  return (
   <>
        <header className='flex justify-center items-center py-3 h-20 shadow-md bg-gray-900'>
            {/* <img src={logo}
            alt="logo"
            height={40} 
            width={160} 
            /> */}
            <span className='text-red-600 text-2xl'>Textora</span>
        </header>

        {children}
   </>
  )
}

export default AuthLayout