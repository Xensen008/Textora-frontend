import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Avatar from "./Avatar";
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft } from "react-icons/fa6";
import { FaCirclePlus } from "react-icons/fa6";
import { FaImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import uploadFile from "../utils/uploadFile";
import { IoClose } from "react-icons/io5";
import { toast } from "react-hot-toast";
import backgroundImage from '../assets/wallpaper2.jpg';

function MessPage() {
  const { userId } = useParams();
  const user = useSelector((state) => state?.user);
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );
  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: "",
  });
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);
  const [message, setMessage] = useState({
    text: "",
    videoUrl: "",
    imageUrl: "",
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    toast.promise(uploadFile(file), {
      loading: "Uploading image...",
      success: (data) => {
        setMessage((prev) => ({
          ...prev,
          imageUrl: data?.url,
        }));
        setOpenImageVideoUpload(false);
        return "Image uploaded successfully!";
      },
      error: "Failed to upload image.",
    });
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    toast.promise(uploadFile(file), {
      loading: "Uploading video...",
      success: (data) => {
        setMessage((prev) => ({
          ...prev,
          videoUrl: data?.url,
        }));
        setOpenImageVideoUpload(false);
        return "Video uploaded successfully!";
      },
      error: "Failed to upload video.",
    });
  };

  const handleImageClosePreview = () => {
    setMessage((prev) => {
      return {
        ...prev,
        imageUrl: "",
      };
    });
  };
  const handleVideoClosePreview = () => {
    setMessage((prev) => {
      return {
        ...prev,
        videoUrl: "",
      };
    });
  };

  const handleOpenVideoImage = () => {
    setOpenImageVideoUpload((prev) => !prev);
  };

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit("message-page", userId);

      socketConnection.on("message-user", (data) => {
        setDataUser(data);
      });
    }
  }, [socketConnection, userId, user]);

  return (
    <div className="bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <header className="sticky top-0  bg-[#d1d8cd]  rounded-b-lg">
        <div className="container mx-auto flex justify-between items-center p-2.5 rounded-lg">
          <div className="flex items-center gap-4 lg:ml-3">
            {" "}
            {/* Adjusted margin here */}
            <Link className="lg:hidden" to={"/"}>
              <FaAngleLeft size={25} />
            </Link>
            <Avatar
              width={50}
              height={50}
              imageUrl={dataUser?.profile_pic}
              name={dataUser?.name}
              userId={dataUser?._id}
            />
            <div>
              <h3 className="font-semibold text-lg text-ellipsis line-clamp-1">
                {dataUser?.name}
              </h3>
              <p className="text-sm font-semibold">
                {dataUser?.online ? (
                  <span className="text-green-600">Online</span>
                ) : (
                  <span className="text-gray-800">Offline</span>
                )}
              </p>
            </div>
          </div>
          <button className="cursor-pointer">
            <HiDotsVertical className="text-2xl text-gray-600" />
          </button>
        </div>
      </header>

      {/* show all message */}
      <section className="h-[calc(100vh-134px)] overflow-x-hidden overflow-y-scroll scrollbar">
        {message?.imageUrl && (
          <div className="w-full h-full bg-slate-600 bg-opacity-40 flex justify-center items-center rounded overflow-hidden">
            <div>
              <button
                onClick={handleImageClosePreview}
                className="flex items-center fixed top-3 right-3 bg-slate-700 text-white p-2 rounded-full"
              >
                Close
                <IoClose size={20} />
              </button>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <img
                src={message?.imageUrl}
                alt="Preview"
                className="aspect-square w-full h-full max-w-sm m-2 object-scale-down"
              />
            </div>
          </div>
        )}
        {/* video section */}
        {message?.videoUrl && (
          <div className="w-full h-full bg-slate-600 bg-opacity-40 flex justify-center items-center rounded overflow-hidden">
            <div>
              <button
                onClick={handleVideoClosePreview}
                className="flex items-center fixed top-3 right-3 bg-slate-700 text-white p-2 rounded-full"
              >
                Close
                <IoClose size={20} />
              </button>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <video
                src={message?.videoUrl}
                alt="Preview"
                className="aspect-square w-full max-h-[600px] max-w-sm m-2 object-contain"
                controls
                muted
                autoPlay
              />
            </div>
          </div>
        )}
        message
      </section>

      <section className="h-16 bg-white flex items-center px-2">
        <div className="relative ">
          <button
            onClick={handleOpenVideoImage}
            className="flex justify-center items-center w-10 h-10 rounded-full hover:bg-slate-300"
          >
            <FaCirclePlus size={20} />
          </button>
          {openImageVideoUpload && (
            <div className="bg-white shadow rounded absolute bottom-14 w-36 p-2 ">
              <form>
                <label
                  htmlFor="image"
                  className="flex items-center p-2 gap-3  hover:bg-[#a4b1a1] cursor-pointer"
                >
                  <div className="text-[#111b21]">
                    <FaImage size={18} />
                  </div>
                  <p>Image</p>
                </label>
                <label
                  htmlFor="video"
                  className="flex items-center p-2 gap-3  hover:bg-[#a4b1a1] cursor-pointer"
                >
                  <div className="text-[#111b21]">
                    <FaVideo size={18} />
                  </div>
                  <p>video</p>
                </label>

                <input
                  type="file"
                  id="image"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  type="file"
                  id="video"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default MessPage;
