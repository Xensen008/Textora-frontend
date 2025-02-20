import React, { useEffect, useState } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import Avatar from "./Avatar";
import { useDispatch, useSelector } from "react-redux";
import EditUserData from "./EditUserData";
import Divider from "./Divider";
import { FiArrowUpLeft } from "react-icons/fi";
import SearchUser from "./SearchUser";
import { FaImage, FaVideo, FaCircle } from "react-icons/fa6";
import { logout } from "../stores/userSlice";

function SidebarUser() {
  const user = useSelector((state) => state?.user);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [openSearch, setOpenSearch] = useState(false);
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );

  const dispatch = useDispatch();
  const navigate = useNavigate()
  const location = useLocation();

  const handleLogout = () => {
      dispatch(logout());
      navigate('/email')
      localStorage.clear()
  }
  useEffect(() => {
    if (socketConnection) {
      const requestConversations = () => {
        console.log("Requesting initial conversations");
        socketConnection.emit("get-conversations");
      };

      // Initial load of conversations
      requestConversations();

      // Handle conversation updates
      socketConnection.on("conversations", (data) => {
        // console.log("Received conversations data:", data);
        if (data && Array.isArray(data.conversations)) {
          const conversationUserData = data.conversations
            .sort((a, b) => {
              // Sort by last message timestamp
              const aTime = a.lastMsg?.createdAt || a.createdAt;
              const bTime = b.lastMsg?.createdAt || b.createdAt;
              return new Date(bTime) - new Date(aTime);
            })
            .map((ConvoUser) => {
              const isCurrentUser = ConvoUser.sender?._id === user?._id;
              const otherUser = isCurrentUser ? ConvoUser?.receiver : ConvoUser?.sender;
              return {
                ...ConvoUser,
                userDetails: otherUser,
                isActive: ConvoUser._id === data.currentConversationId,
                lastMessage: ConvoUser.lastMsg
              };
            });
          // console.log("Processed conversation data:", conversationUserData);
          setAllUsers(conversationUserData);
        } else {
          console.warn("Invalid conversation data received:", data);
          setAllUsers([]);
        }
      });

      // Handle socket reconnection
      socketConnection.on("connect", () => {
        console.log("Socket reconnected, requesting conversations");
        requestConversations();
      });

      // Handle online status updates
      socketConnection.on("onlineUser", (onlineUsers) => {
        // console.log("Received online users update:", onlineUsers);
        setAllUsers(prevUsers => 
          prevUsers.map(user => ({
            ...user,
            userDetails: {
              ...user.userDetails,
              online: onlineUsers.includes(user.userDetails?._id)
            }
          }))
        );
      });

      return () => {
        if (socketConnection) {
          socketConnection.off("conversations");
          socketConnection.off("onlineUser");
          socketConnection.off("connect");
        }
      };
    }
  }, [socketConnection, user?._id]);

  // Update conversation list when route changes
  useEffect(() => {
    if (socketConnection && user?._id) {
      console.log("Route changed, requesting conversations again");
      socketConnection.emit("get-conversations");
    }
  }, [location.pathname, socketConnection, user?._id]);

  return (
    <div className="w-full h-screen flex">
      {/* Left sidebar - Navigation */}
      <div className="bg-[#1e1f22] w-[72px] h-full py-3 flex flex-col items-center justify-between border-r border-[#2d2d31]">
        <div className="flex flex-col gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-[#36373d] rounded-[16px] transition-all duration-200 ${
                isActive ? "bg-[#36373d]" : "bg-[#2d2d31] hover:bg-[#36373d]"
              }`
            }
            title="Chat"
          >
            <IoChatbubbleEllipsesOutline size={26} className="text-[#23a559]" />
          </NavLink>
          <div
            onClick={() => setOpenSearch(true)}
            className="w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-[#36373d] rounded-[16px] transition-all duration-200 bg-[#2d2d31]"
            title="Add User"
          >
            <FaUserPlus size={22} className="text-[#23a559]" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            className="w-12 h-12 rounded-full overflow-visible hover:opacity-80 transition-all duration-300 relative group"
            title={`Profile - ${user?.name}`}
            onClick={() => setEditUserOpen(true)}
          >
            <div className="relative">
              <Avatar
                width={48}
                height={48}
                iconColor="#fff"
                imageUrl={user?.profile_pic}
                userId={user?._id}
                name={user?.name}
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-[#1e1f22] bg-[#23a559]"></div>
            </div>
          </button>
          <button
            className="w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-[#36373d] rounded-[16px] transition-all duration-200 text-[#f23f42]"
            title="Logout"
            onClick={handleLogout}
          >
            <BiLogOut size={26} />
          </button>
        </div>
      </div>

      {/* Right sidebar - Chat list */}
      <div className="w-full bg-[#2b2d31] text-white">
        <div className="flex h-[48px] items-center px-4 bg-[#2b2d31] border-b border-[#1e1f22]">
          <h2 className="text-[16px] font-semibold text-[#f3f4f5]">Direct Messages</h2>
        </div>

        <div className="h-[calc(100vh-48px)] overflow-x-hidden overflow-y-auto scrollbar">
          <div className="flex flex-col items-start p-2">
            {allUsers.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center mt-6 text-[#949ba4]">
                <FiArrowUpLeft size={50} />
                <p className="text-center text-[15px] mt-2">
                  Add users to start messaging
                </p>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-[2px]">
                {allUsers.map((conv) => (
                  <Link
                    to={`/${conv?.userDetails?._id}`}
                    key={conv?._id}
                    className="no-underline w-full"
                  >
                    <div 
                      className={`flex items-center gap-3 px-2 py-[6px] rounded-[4px] transition-colors hover:bg-[#35373c] cursor-pointer ${
                        conv.isActive ? 'bg-[#35373c]' : ''
                      }`}
                    >
                      <div className="relative">
                        <Avatar
                          imageUrl={conv?.userDetails?.profile_pic}
                          name={conv?.userDetails?.name}
                          width={32}
                          height={32}
                          userId={conv?.userDetails?._id}
                        />
                        {conv?.userDetails?.online && (
                          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-[2.5px] border-[#2b2d31] bg-[#23a559]"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center w-full">
                          <h3 className="font-medium text-[16px] text-[#f3f4f5] line-clamp-1 text-ellipsis">
                            {conv?.userDetails?.name}
                          </h3>
                          <span className="text-xs text-[#949ba4]">
                            {conv?.lastMsg?.createdAt &&
                              new Date(conv.lastMsg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-[2px]">
                          <div className="flex items-center gap-1 text-[14px] text-[#949ba4] line-clamp-1 text-ellipsis max-w-[85%]">
                            {conv?.lastMsg?.imageUrl && (
                              <FaImage className="mr-1 flex-shrink-0 text-[12px]" />
                            )}
                            {conv?.lastMsg?.videoUrl && (
                              <FaVideo className="mr-1 flex-shrink-0 text-[12px]" />
                            )}
                            <p className="text-ellipsis overflow-hidden whitespace-nowrap">
                              {conv?.lastMsg?.text
                                ? conv?.lastMsg?.text.length > 30
                                  ? conv?.lastMsg?.text.substring(0, 30) + "..."
                                  : conv?.lastMsg?.text
                                : conv?.lastMsg?.imageUrl
                                ? "Image"
                                : conv?.lastMsg?.videoUrl
                                ? "Video"
                                : ""}
                            </p>
                          </div>
                          {conv?.unseenMsg > 0 && (
                            <span className="ml-2 bg-[#23a559] text-white text-[12px] min-w-[18px] h-[18px] font-medium rounded-full flex justify-center items-center">
                              {conv?.unseenMsg}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {editUserOpen && <EditUserData onClose={() => setEditUserOpen(false)} />}
      {openSearch && <SearchUser onClose={() => setOpenSearch(false)} />}
    </div>
  );
}

export default SidebarUser;
