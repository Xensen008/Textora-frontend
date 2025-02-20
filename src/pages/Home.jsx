import React, { useEffect, useState } from "react";
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
import { toast } from "react-hot-toast";
import MessPage from "../components/MessPage";
import store from "../stores/store";

function Home() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

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
        dispatch(setUser({ ...response.data.data, token }));
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
    } finally {
      setIsLoading(true);
    }
  };

  // Fetch user details first
  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Setup socket connection after we have user data
  useEffect(() => {
    let socket = null;
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 3000;

    const connectSocket = () => {
      const token = localStorage.getItem("token");
      if (!token || !user?._id) {
        console.log("Waiting for user data before connecting socket");
        return;
      }

      try {
        // Close existing connection if any
        if (socket) {
          socket.close();
        }

        const socketUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:8080";
        console.log("Connecting to socket at:", socketUrl);

        // Initialize socket with proper configuration
        socket = io(socketUrl, {
          path: '/socket.io/',
          transports: ['polling', 'websocket'],
          auth: {
            token
          },
          reconnection: true,
          reconnectionAttempts: maxRetries,
          reconnectionDelay: retryDelay,
          timeout: 20000,
          forceNew: true,
          withCredentials: true
        });

        // Connection event handlers
        socket.on("connect", () => {
          console.log("Socket connected successfully with ID:", socket.id);
          dispatch(setSocketConnection(socket));
          retryCount = 0;
          
          // Request initial conversations and online users after successful connection
          setTimeout(() => {
            if (socket.connected) {
              console.log("Requesting initial data after connection");
              socket.emit("get-conversations");
              socket.emit("get-online-users");
            }
          }, 500); // Small delay to ensure connection is stable
        });

        socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          retryCount++;
          if (retryCount >= maxRetries) {
            toast.error("Failed to connect to chat server. Please refresh the page.");
          }
        });

        socket.on("disconnect", (reason) => {
          console.log("Socket disconnected:", reason);
          if (reason === "io server disconnect") {
            // Reconnect if server disconnected us
            socket.connect();
          }
        });

        // Add handler for user status changes
        socket.on("user_status_change", ({ userId, status }) => {
          console.log("User status changed:", userId, status);
          const currentOnlineUsers = store.getState().user.onlineUser || [];
          let updatedOnlineUsers;
          
          if (status === 'online' && !currentOnlineUsers.includes(userId)) {
            updatedOnlineUsers = [...currentOnlineUsers, userId];
          } else if (status === 'offline') {
            updatedOnlineUsers = currentOnlineUsers.filter(id => id !== userId);
          } else {
            updatedOnlineUsers = currentOnlineUsers;
          }
          
          dispatch(setOnlineUser(updatedOnlineUsers));
        });

        socket.on("error", (error) => {
          console.error("Socket error:", error);
          toast.error("Chat server error. Please try refreshing the page.");
        });

        // Add handler for receiving initial conversations
        socket.on("conversations", (data) => {
          // console.log("Received initial conversations:", data);
          // The data will be handled by your conversations component
        });

        // Initial connection
        socket.connect();

      } catch (error) {
        console.error("Socket initialization error:", error);
        toast.error("Failed to initialize chat connection");
      }
    };

    if (user?._id) {
      console.log("Attempting socket connection for user:", user._id);
      connectSocket();
    }

    return () => {
      if (socket) {
        console.log("Cleaning up socket connection");
        socket.off("connect");
        socket.off("connect_error");
        socket.off("disconnect");
        socket.off("onlineUser");
        socket.off("error");
        socket.disconnect();
      }
    };
  }, [user?._id, dispatch]);

  if (isLoading && !user?._id) {
    return <div className="flex justify-center items-center h-screen">
      <p className="text-lg">Loading...</p>
    </div>;
  }

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
