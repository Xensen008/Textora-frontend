import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { logout, setUser, setOnlineUser, setSocketConnection } from "../stores/userSlice";
import SidebarUser from "../components/SidebarUser";
import logo from "../assets/Textora3.jpg";
import io from 'socket.io-client';

function Home() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserDetails = async () => {
    try {
      const url = `${import.meta.env.VITE_APP_BACKEND_URL}/api/user-data`;
      const response = await axios.get(url, {
        withCredentials: true,
      });
      dispatch(setUser(response.data.data));

      if (response?.data?.data?.logout) {
        dispatch(logout());
        navigate("/email");
      }
    } catch (error) {
      console.error("error:", error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // socket connection
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_APP_BACKEND_URL.replace(/^http/, 'ws');
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token not found');
      return;
    }

    const socketConnection = io(socketUrl, {
      auth: {
        token: token,
      },
      transports: ['websocket'], // Ensure only websocket transport is used
    });

    socketConnection.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    socketConnection.on('onlineUser', (data) => {
      console.log(data);
      dispatch(setOnlineUser(data));
    });

    dispatch(setSocketConnection(socketConnection));
    return () => {
      socketConnection.disconnect();
    };
  }, [dispatch]);

  const basePath = location.pathname === "/";
  return (
    <div className="grid lg:grid-cols-[380px,1fr] h-screen max-h-screen">
      <section className={`bg-[#d1d8cd] ${!basePath && "hidden"} lg:block`}>
        <SidebarUser />
      </section>
      {/* Message component  */}
      <section className={`${basePath && "hidden"}`}>
        <Outlet />
      </section>

      <div className={`justify-center items-center flex-col hidden ${!basePath ? "hidden" : "lg:flex"}`}>
        <div className="blend">
          <img
            src={logo}
            alt="lgo"
            width={350}
          />
        </div>
        <p className="font-bold text-xl ">Select User To Start Chatting</p>
      </div>
    </div>
  );
}

export default Home;
