import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import LoadingComponent from "./Loading";
import toast from "react-hot-toast";
import axios from "axios";
import { debounce } from "lodash";
import { IoClose } from "react-icons/io5";
import Avatar from "./Avatar";
import { useNavigate } from "react-router-dom";

function SearchUser({ onClose }) {
  const [searchUser, setSearchUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchUserInput, setSearchUserInput] = useState("");
  const navigate = useNavigate();

  // Debounce search input to make loading smoother
  const debouncedSearch = debounce(async () => {
    if (searchUserInput.trim().length > 1) {
      setLoading(true);
      const url = `${import.meta.env.VITE_APP_BACKEND_URL}/api/search`;
      try {
        const response = await axios.post(url, { search: searchUserInput });
        setSearchUser(response?.data?.data);
      } catch (error) {
        toast.error(error?.response?.data?.message);
      } finally {
        setLoading(false);
      }
    } else {
      setSearchUser([]);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [searchUserInput]);

  const handleStartChat = (userId) => {
    navigate(`/${userId}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/[.85] z-50 flex items-center justify-center p-4">
      <div className="bg-[#313338] w-full max-w-[440px] rounded-lg shadow-xl mx-4">
        <div className="p-4 border-b border-[#3f4147]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[#f3f4f5] text-xl font-semibold">Start a Chat</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#3f4147] transition-colors"
            >
              <IoClose size={24} className="text-[#b5bac1]" />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by username or email..."
              onChange={(e) => setSearchUserInput(e.target.value)}
              value={searchUserInput}
              className="w-full h-[40px] bg-[#1e1f22] text-[#dbdee1] rounded-[4px] px-4 pr-10 outline-none focus:ring-2 focus:ring-[#23a559] placeholder-[#949ba4]"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#949ba4]">
              <IoSearchOutline size={20} />
            </div>
          </div>
        </div>
        
        <div className="p-4 max-h-[60vh] overflow-y-auto scrollbar">
          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse flex items-center gap-3 p-2">
                  <div className="w-10 h-10 bg-[#3f4147] rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-[#3f4147] rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-[#3f4147] rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchUser.length > 0 ? (
            <div className="flex flex-col gap-2">
              {searchUser.map((user) => (
                <div 
                  key={user._id} 
                  onClick={() => handleStartChat(user._id)}
                  className="flex items-center gap-3 p-2 rounded hover:bg-[#35373c] transition-colors cursor-pointer"
                >
                  <div className="relative">
                    <Avatar
                      width={40}
                      height={40}
                      imageUrl={user?.profile_pic}
                      name={user?.name}
                      userId={user?._id}
                    />
                    <div className="absolute -bottom-[2px] -right-[2px] w-[14px] h-[14px] bg-[#313338] rounded-full flex items-center justify-center ring-[2px] ring-[#313338]">
                      <div className="w-2.5 h-2.5 bg-[#23a559] rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[16px] text-[#f3f4f5] truncate">
                      {user?.name}
                    </h3>
                    <p className="text-[14px] text-[#949ba4] truncate">
                      {user?.email}
                    </p>
                  </div>
                  <div className="px-4 py-1.5 bg-[#23a559] hover:bg-[#1e9150] text-white text-[14px] font-medium rounded transition-colors">
                    Message
                  </div>
                </div>
              ))}
            </div>
          ) : searchUserInput.trim().length > 1 ? (
            <div className="text-center py-8">
              <p className="text-[#b5bac1] text-[15px]">No users found</p>
              <p className="text-[#949ba4] text-sm mt-1">Try searching for someone else</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#b5bac1] text-[15px]">Enter a username or email to search</p>
              <p className="text-[#949ba4] text-sm mt-1">Must be at least 2 characters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchUser;