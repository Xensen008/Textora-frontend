import React, { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import uploadFile from "../utils/uploadFile";
import toast from "react-hot-toast";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../stores/userSlice";
import { IoClose } from "react-icons/io5";
import { FaCamera } from "react-icons/fa6";

function EditUserData({ onClose }) {
  const user = useSelector((state) => state?.user);
  const [data, setData] = useState({
    name: user?.name || "",
    profile_pic: user?.profile_pic || "",
  });

  const uploadPhotoRef = useRef();
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      name: user?.name || "",
      profile_pic: user?.profile_pic || "",
    }));
  }, [user]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenFile = () => {
    uploadPhotoRef.current.click();
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setIsUploading(true);
    toast
      .promise(uploadFile(file), {
        loading: "Uploading...",
        success: "Profile picture updated!",
        error: "Upload failed",
      })
      .then((uploadPhoto) => {
        setData((prev) => ({
          ...prev,
          profile_pic: uploadPhoto?.secure_url,
        }));
      })
      .catch((error) => {
        console.error("Upload error:", error);
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    
    if (!data.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    // Check if name is unchanged
    if (data.name.trim() === user?.name && data.profile_pic === user?.profile_pic) {
      toast.error("No changes to save");
      return;
    }

    try {
      const payload = {
        name: data.name.trim(),
        profile_pic: data.profile_pic,
      };

      const url = `${import.meta.env.VITE_APP_BACKEND_URL}/api/update`;
      const response = await axios.post(url, payload, {
        withCredentials: true,
      });

      if (response.data.success) {
        dispatch(setUser(response.data.data));
        toast.success("Profile updated successfully!", {
          duration: 3000,
          style: {
            background: '#23a559',
            color: '#fff',
            borderRadius: '8px',
          },
        });
        onClose();
      }
    } catch (error) {
      console.log(error);
      // Check for duplicate name error
      if (error?.response?.data?.message?.includes('E11000') || 
          error?.response?.data?.message?.includes('duplicate key')) {
        toast.error("This name is already taken. Please choose another name.", {
          duration: 4000,
          style: {
            background: '#f23f42',
            color: '#fff',
            borderRadius: '8px',
          },
        });
      } else {
        toast.error(error?.response?.data?.message || "Failed to update profile", {
          duration: 4000,
          style: {
            background: '#f23f42',
            color: '#fff',
            borderRadius: '8px',
          },
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/[.85] flex items-center justify-center z-50 p-4">
      <div className="bg-[#313338] w-full max-w-[440px] rounded-lg shadow-xl mx-4">
        <div className="p-4 border-b border-[#3f4147]">
          <div className="flex justify-between items-center">
            <h2 className="text-[#f3f4f5] text-xl font-semibold">Profile Settings</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#3f4147] transition-colors"
            >
              <IoClose size={24} className="text-[#b5bac1]" />
            </button>
          </div>
        </div>

        <form onSubmit={handleOnSubmit} className="p-4">
          <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer" onClick={handleOpenFile}>
              <div className="w-[80px] h-[80px] rounded-full overflow-hidden ring-4 ring-[#1e1f22] transition-transform duration-200 transform group-hover:scale-105">
                <Avatar
                  width={80}
                  height={80}
                  iconColor="#fff"
                  imageUrl={data?.profile_pic}
                  name={data?.name}
                  userId={data?._id}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200">
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                  <FaCamera size={24} className="text-white" />
                </div>
              </div>
              <input
                type="file"
                id="profile_pic"
                className="hidden"
                ref={uploadPhotoRef}
                onChange={handleUploadPhoto}
                accept="image/*"
              />
            </div>
            <button
              type="button"
              onClick={handleOpenFile}
              className="mt-3 text-[#00a8fc] text-sm font-medium hover:underline flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-[#00a8fc]/10 transition-colors"
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#00a8fc] border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </div>
              ) : (
                <>
                  <FaCamera size={14} />
                  <span>Change Avatar</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-[#b5bac1] text-xs font-medium uppercase mb-2">
                Display Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={data?.name}
                onChange={handleOnChange}
                maxLength={32}
                className="w-full h-10 px-3 bg-[#1e1f22] text-[#dbdee1] rounded-[4px] outline-none focus:ring-2 focus:ring-[#00a8fc]"
                placeholder="Enter your display name"
              />
              <p className="text-[#b5bac1] text-xs mt-1">
                {data?.name?.length}/32
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[#dbdee1] hover:underline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-4 py-2 bg-[#23a559] hover:bg-[#1e9150] text-white font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserData;
