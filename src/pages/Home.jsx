import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setUser } from '../stores/userSlice';
import SidebarUser from '../components/SidebarUser';


function Home() {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log('redux user:', user);

  const fetchUserDetails = async () => {
    try {
      const url = `${import.meta.env.VITE_APP_BACKEND_URL}/api/user-data`;
      const response = await axios.get(url,{
        url:url,
        withCredentials:true
      });

      dispatch(setUser(response.data.data));

      if(response.data.logout){
        dispatch(logout());
        navigate('/email');
      }

      console.log('current user details:', response);
    } catch (error) {
      console.error('error:', error )
    }
  }

  useEffect(() => {
    fetchUserDetails();
  }
  ,[]);

  return (
    <div className='grid lg:grid-cols-[380px,1fr] h-screen max-h-screen'>
        <section className='bg-[#202c33]'>
          <SidebarUser/>
        </section>
        {/* Message component  */}
        <section>
            <Outlet/>
        </section>
    </div>
  )
}

export default Home