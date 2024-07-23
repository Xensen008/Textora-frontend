import React, { useEffect, useState } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { NavLink, Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import Avatar from "./Avatar";
import { useSelector } from "react-redux";
import EditUserData from "./EditUserData";
import Divider from "./Divider";
import { FiArrowUpLeft } from "react-icons/fi";
import SearchUser from "./SearchUser";
import { FaImage, FaVideo } from "react-icons/fa6";

function SidebarUser() {
  const user = useSelector((state) => state?.user);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [openSearch, setOpenSearch] = useState(false);
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );

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
            to="/chat"
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
          >
            <span className="-ml-2">
              <BiLogOut size={25} />
            </span>
          </button>
        </div>
      </div>

      <div className="w-full bg-[#1e2c35] text-white">
        <div className="flex h-16 items-center px-5 bg-[#202c33]">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        <Divider />

        <div className="h-[calc(100vh-75px)] overflow-x-hidden overflow-y-auto scrollbar">
          <div className="flex flex-col items-start gap-2 p-5">
            {allUsers.length === 0 && (
              <div className="w-full flex flex-col items-center justify-center mt-6 text-slate-300">
                <FiArrowUpLeft size={50} />
                <p className="text-center text-lg font-mono">
                  Add User to Start Conversation
                </p>
              </div>
            )}
            <div className="w-full flex flex-col gap-2">
              {allUsers.map((conv) => (
                <Link
                  to={`/${conv?.userDetails?._id}`}
                  key={conv?._id}
                  className="no-underline w-full"
                >
                  <div className={`flex items-center gap-2 p-3 rounded-lg transition-colors  hover:bg-[#1b252c] cursor-pointer`}>
                    <Avatar
                      imageUrl={conv?.userDetails?.profile_pic}
                      name={conv?.userDetails?.name}
                      width={50}
                      height={50}
                      userId={conv?.userDetails?._id}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-base truncate">
                        {conv?.userDetails?.name}
                      </h3>
                      <div className="text-xs text-slate-300 flex items-center gap-1">
                        {conv?.lastMsg?.imageUrl && (
                          <div className="flex items-center">
                            <FaImage className="mr-1" />
                            {!conv?.lastMsg?.text && <span>Image</span>}
                          </div>
                        )}
                        {conv?.lastMsg?.videoUrl && (
                          <div className="flex items-center">
                            <FaVideo className="mr-1" />
                            {!conv?.lastMsg?.text && <span>Video</span>}
                          </div>
                        )}
                        <p className="text-sm text-slate-300 truncate">
                          {conv?.lastMsg?.text}
                        </p>
                      </div>
                    </div>
                    {conv?.unseenMsg > 0 && (
                      <span className="ml-auto bg-green-700 text-white text-xs w-6 h-6 font-semibold p-1 rounded-full flex justify-center items-center">
                        {conv?.unseenMsg}
                      </span>
                    )}
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
