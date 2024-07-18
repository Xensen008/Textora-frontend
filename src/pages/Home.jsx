import React, { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setUser } from '../stores/userSlice';
import SidebarUser from '../components/SidebarUser';
import logo from '../assets/Textora3.jpg';

function Home() {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();


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

      // console.log('current user details:', response);
    } catch (error) {
      console.error('error:', error )
    }
  }

  useEffect(() => {
    fetchUserDetails();
  }
  ,[]);


  const basePath = location.pathname === "/"
  return (
    <div className='grid lg:grid-cols-[380px,1fr] h-screen max-h-screen'>
        <section className={`bg-[#d1d8cd]  ${!basePath && "hidden"} lg:block`}>
          <SidebarUser/>
        </section>
        {/* Message component  */}
        <section className={`${basePath && "hidden"}`}>
            <Outlet/>
        </section>

        <div className='lg:flex justify-center items-center flex-col hidden'>
          <div className='blend'>
            <img src={logo} alt="lgo"
            // className='w-32 h-32 mx-auto mt-10'
            width={350}
             />
          </div>
          <p className='font-bold text-xl '>Select User To Start Chatting</p>          
        </div>
    </div>
  )
}

export default Home