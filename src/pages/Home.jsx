import React from 'react'
import { Outlet } from 'react-router-dom'

function Home() {
  return (
    <div>Home


        {/* Message component  */}
        <section>
            <Outlet/>
        </section>
    </div>
  )
}

export default Home