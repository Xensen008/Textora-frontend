import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import LoadingComponent from "./Loading";
import UserCard from "./UserCard";
import toast from "react-hot-toast";
import axios from "axios";
import { debounce } from "lodash";
import { IoClose } from "react-icons/io5";

function SearchUser({ onClose }) {
  const [searchUser, setSearchUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchUserInput, setSearchUserInput] = useState("");

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

  return (
    <div className="fixed top-0 bottom-0 right-0 left-0 bg-slate-700 bg-opacity-40 p-3 z-10">
      <div className="w-full max-w-lg mx-auto mt-14 m-1">
        <div className="bg-[#fff] rounded h-14 flex overflow-hidden">
          <input
            type="text"
            placeholder="Search User"
            onChange={(e) => setSearchUserInput(e.target.value)}
            value={searchUserInput}
            className="w-full outline-none py-1 h-full px-4"
          />
          <div className="h-14 w-14 flex justify-center items-center">
            <IoSearchOutline size={25} />
          </div>
        </div>
        <div className="bg-white mt-2 w-full p-4 rounded">
          {loading ? (
            Array.from({ length: 1 }).map((_, index) => <LoadingComponent key={index} />)
          ) : searchUser.length > 0 ? (
            searchUser.map((user) => <UserCard key={user._id} user={user} onclose={onClose} />)
          ) : (
            <p className="text-center text-slate-500">No User Found</p>
          )}
        </div>
      </div>
      <div>
        <button
          onClick={onClose}
          className="flex items-center fixed top-3 right-3 bg-red-600 text-white p-2 rounded-full"
        >
          Close<IoClose size={20}/>
        </button>
      </div>
    </div>
  );
}

export default SearchUser;