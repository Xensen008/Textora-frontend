import React, { useEffect, useState } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import Avatar from "./Avatar";
import { useSelector } from "react-redux";
import EditUserData from "./EditUserData";
import Divider from "./Divider";
import { FiArrowUpLeft } from "react-icons/fi";
import SearchUser from "./SearchUser";

function SidebarUser() {
  const user = useSelector((state) => state?.user);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [openSearch, setOpenSearch] = useState(false);
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );

  useEffect(() => {
    if(socketConnection){
      socketConnection.emit('sidebar',user?._id)
      }
  },[socketConnection,user])


  return (
    <div className="w-full h-full grid grid-cols-[48px,1fr]">
      <div className="bg-[#111b21] w-12 h-full rounded-tr-md rounded-br-md py-5 flex flex-col items-center justify-between">
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

        <div className="flex flex-col items-center border-none">
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
              {" "}
              <BiLogOut size={25} />
            </span>
          </button>
        </div>
      </div>

      {/* users */}
      <div className="w-full">
        <div className="flex h-16 items-center">
          <h2 className="text-xl font-bold p-5">Message</h2>
        </div>
        <Divider />

        {/* user details */}
        <div className="h-[calc(100vh-75px)] overflow-x-hidden overflow-y-auto scrollbar">
          <div className="flex items-center gap-3 p-5">
            {allUsers.length === 0 && (
              <div>
                <div className="mt-6 text-slate-700">
                  <FiArrowUpLeft size={50} />
                </div>
                <p className="text-center text-lg text-slate-700 font-mono">
                  Add User to Start Conversation
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* user details */}
      {editUserOpen && (
        <EditUserData
          onClose={() => {
            setEditUserOpen(false);
          }}
          user={user}
        />
      )}

      {/* searching user */}
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
