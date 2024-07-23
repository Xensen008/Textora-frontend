import React, { useEffect, useState } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import Avatar from "./Avatar";
import { useDispatch, useSelector } from "react-redux";
import EditUserData from "./EditUserData";
import Divider from "./Divider";
import { FiArrowUpLeft } from "react-icons/fi";
import SearchUser from "./SearchUser";
import { FaImage, FaVideo } from "react-icons/fa6";
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


  const handleLogout = () => {
      dispatch(logout());
      navigate('/email')
      localStorage.clear()
  }
  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit("sidebar", user._id);

      socketConnection.on("conversation", (data) => {
        console.log("conversation", data);
        const conversationUserData = data.map((ConvoUser) => {
          if (ConvoUser.sender?._id === user?._id) {
            return {
              ...ConvoUser,
              userDetails: ConvoUser?.receiver,
            };
          } else {
            return {
              ...ConvoUser,
              userDetails: ConvoUser?.sender,
            };
          }
        });
        setAllUsers(conversationUserData);
      });
    }
  }, [socketConnection, user]);

  return (
    <div className="w-full h-full flex">
      <div className="bg-[#111b21] w-16 h-full py-5 flex flex-col items-center justify-between">
        <div>
          <NavLink
            to="/"
            className={(isActive) =>
              `w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-[#202c33] rounded text-white ${
                isActive && "bg-[#26333d]"
              }`
            }
            title="Chat"
          >
            <IoChatbubbleEllipsesOutline size={25} />
          </NavLink>
          <div
            onClick={() => setOpenSearch(true)}
            className="w-12 h-12 flex justify-center items-center cursor-pointer mt-2 hover:bg-[#202c33] text-white rounded"
            title="Add User"
          >
            <FaUserPlus size={25} />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <button
            className="mx-auto"
            title={`profile- ${user?.name}`}
            onClick={() => setEditUserOpen(true)}
          >
            <Avatar
              width={40}
              height={40}
              iconColor="#fff"
              imageUrl={user?.profile_pic}
              userId={user?._id}
              name={user?.name}
            />
          </button>
          <button
            className="w-12 h-12 flex justify-center items-center cursor-pointer mt-2 hover:bg-[#202c33] text-red-600 rounded"
            title="Logout"
            onClick={handleLogout}
          >
            <span className="-ml-2">
              <BiLogOut size={25} />
            </span>
          </button>
        </div>
      </div>

      <div className="w-full bg-[#1e2c35] text-white">
        <div className="flex h-16 items-center px-4 bg-[#202c33]">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        <Divider />

        <div className="h-[calc(100vh-75px)] overflow-x-hidden overflow-y-auto scrollbar">
          <div className="flex flex-col items-start gap-2 p-4">
            {allUsers.length === 0 && (
              <div className="w-full flex flex-col items-center justify-center mt-6 text-slate-300">
                <FiArrowUpLeft size={50} />
                <p className="text-center text-lg font-mono">
                  Add User to Start Conversation
                </p>
              </div>
            )}
            <div className="w-[279px] flex flex-col gap-2">
              {allUsers.map((conv) => (
                <Link
                  to={`/${conv?.userDetails?._id}`}
                  key={conv?._id}
                  className="no-underline w-full"
                >
                  <div className="flex items-center gap-2 p-3 rounded-lg transition-colors hover:bg-[#1b252c] cursor-pointer">
                    <Avatar
                      imageUrl={conv?.userDetails?.profile_pic}
                      name={conv?.userDetails?.name}
                      width={48}
                      height={48}
                      userId={conv?.userDetails?._id}
                    />
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex justify-between items-center w-full">
                        <h3 className="font-semibold text-base line-clamp-1 text-ellipsis mr-2">
                          {conv?.userDetails?.name}
                        </h3>
                        <span
                          className={`text-xs ${
                            conv?.unseenMsg > 0
                              ? "text-green-500"
                              : "text-gray-400"
                          }`}
                        >
                          {conv?.lastMsg?.createdAt &&
                            new Date(
                              conv.lastMsg.createdAt
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1 text-md text-slate-400 line-clamp-1 text-ellipsis max-w-[65%]">
                          {conv?.lastMsg?.imageUrl && (
                            <FaImage className="mr-1 flex-shrink-0" />
                          )}
                          {conv?.lastMsg?.videoUrl && (
                            <FaVideo className="mr-1 flex-shrink-0" />
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
                          <span className="ml-2 bg-green-600 text-white text-xs min-w-[20px] h-5 font-semibold px-1 rounded-full flex justify-center items-center">
                            {conv?.unseenMsg}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      {editUserOpen && (
        <EditUserData
          onClose={() => {
            setEditUserOpen(false);
          }}
          user={user}
        />
      )}

      {openSearch && (
        <SearchUser
          onClose={() => {
            setOpenSearch(false);
          }}
        />
      )}
    </div>
  );
}

export default SidebarUser;
