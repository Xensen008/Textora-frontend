import React, { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import Divider from "./Divider";
import uploadFile from "../utils/uploadFile";
import toast from "react-hot-toast";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../stores/userSlice";

function EditUserData({ onClose, user }) {
  const [data, setData] = useState({
    name: user?.user,
    profile_pic: user?.profile_pic,
  });

  const uploadPhotoRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    setData((prev) => {
      return {
        ...prev,
        ...user,
      };
    });
  }, [user]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };
  const handleOpenFile = () => {
    uploadPhotoRef.current.click();
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    const uploadPhoto= await uploadFile(file);
    console.log(uploadPhoto);
    setData((prev) => {
        return {
            ...prev,
            profile_pic: uploadPhoto?.url,
        };
        });
  };


  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `${import.meta.env.VITE_APP_BACKEND_URL}/api/update`;
      const response = await axios.post(url, data,{
        withCredentials: true,
      });
      console.log(response)
      toast.success(response?.data?.message);

      if(response.data.success){
        dispatch(setUser(response.data.data));
        onClose();
      }
    } catch (error) {
      console.log(error);    
      toast.error(error?.response?.data.message);
    }
  };

  
  return (
    <div className="fixed top-0 bottom-0 right-0 left-0 bg-[#141c21] bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-4 py-6 m-1 rounded w-full max-w-sm">
        <h1 className="font-bold">Profile Details</h1>
        <p className="text-sm">Edit user</p>

        <form onSubmit={handleOnSubmit} className="grid gap-3 mt-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              name="name"
              id="name"
              value={data?.name}
              onChange={handleOnChange}
              className="w-full py-1 px-2 focus:outline-outline border-0.5"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div>Photo:</div>
            <div className="my-1 flex items-center gap-3">
              <Avatar
                width={50}
                height={50}
                iconColor="#fff"
                imageUrl={data?.profile_pic}
                name={data?.name}
              />
              <label htmlFor="profile_pic">
                <button type='button' className="font-semibold" onClick={handleOpenFile}>
                  Change Photo
                </button>
                <input
                  type="file"
                  id="profile_pic"
                  className="hidden"
                  ref={uploadPhotoRef}
                  onChange={handleUploadPhoto}
                />
              </label>
            </div>
          </div>
          <Divider />
          <div className="flex gap-4 w-fit ml-auto ">
            <button
              onClick={onClose}
              className="border-[#008d6f] border text-outline px-4 py-1 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleOnSubmit}
              className="bg-[#111b21] text-white py-2 px-4 border rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserData;
