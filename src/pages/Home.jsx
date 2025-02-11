import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  logout,
  setUser,
  setOnlineUser,
  setSocketConnection,
} from "../stores/userSlice";
import SidebarUser from "../components/SidebarUser";
import logo from "../assets/Textora3.jpg";
import io from "socket.io-client";

function Home() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, redirecting to login");
        navigate("/email");
        return;
      }

      const url = `${import.meta.env.VITE_APP_BACKEND_URL}/api/user-data`;
      const response = await axios.get(url, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response?.data?.data) {
        dispatch(setUser(response.data.data));
      } else {
        console.log("No user data received");
        dispatch(logout());
        navigate("/email");
      }

      if (response?.data?.data?.logout) {
        dispatch(logout());
        navigate("/email");
      }
    } catch (error) {
      console.error("error:", error);
      dispatch(logout());
      navigate("/email");
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // socket connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found for socket connection");
      navigate("/email");
      return;
    }

    const socketUrl = import.meta.env.VITE_APP_BACKEND_URL;
    if (!socketUrl) {
      console.error("Backend URL not configured");
      return;
    }

    const wsUrl = socketUrl.replace(/^http/, "ws");
    
    const socketConnection = io(wsUrl, {
      auth: {
        token: token,
      },
      transports: ["websocket"],
      withCredentials: true
    });

    socketConnection.on("disconnect", (reason) => {
      console.error("disconnected :", reason);

      if (reason === "io server disconnect") {
        socketConnection.connect();
      }
    });

    socketConnection.on("onlineUser", (data) => {
      console.log(data);
      dispatch(setOnlineUser(data));
    });

    dispatch(setSocketConnection(socketConnection));
    return () => {
      socketConnection.disconnect();
    };
  }, [dispatch, navigate]);

  const basePath = location.pathname === "/";
  return (
    <div className="grid lg:grid-cols-[380px,1fr] h-screen max-h-screen">
      <section className={`bg-[#d1d8cd] ${!basePath && "hidden"} lg:block`}>
        <SidebarUser />
      </section>
      {/* Message component  */}
      <section className={`${basePath && "hidden"} lg:h-screen sm:h-[calc(100vh-60px)]`}>
        <Outlet />
      </section>

      <div
        className={`justify-center items-center flex-col hidden ${
          !basePath ? "hidden" : "lg:flex"
        }`}
      >
        <div className="blend">
          <img src={logo} alt="logo" width={350} />
        </div>
        <p className="font-bold text-xl">Select User To Start Chatting</p>
      </div>
    </div>
  );
}

export default Home;
