import React, { useEffect, useRef, useState } from "react";
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
import backgroundImage from "../assets/wallpaper.jpg";
import { IoMdSend } from "react-icons/io";
import moment from "moment";

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
  const [allMessage, setAllMessage] = useState([]);
  const currentMessage = useRef(null);

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [allMessage]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    toast.promise(uploadFile(file), {
      loading: "Uploading image...",
      success: (data) => {
        setMessage((prev) => ({
          ...prev,
          imageUrl: data?.secure_url,
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
          videoUrl: data?.secure_url,
        }));
        setOpenImageVideoUpload(false);
        return "Video uploaded successfully!";
      },
      error: "Failed to upload video.",
    });
  };

  const handleImageClosePreview = () => {
    setMessage((prev) => ({
      ...prev,
      imageUrl: "",
    }));
  };

  const handleVideoClosePreview = () => {
    setMessage((prev) => ({
      ...prev,
      videoUrl: "",
    }));
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

      socketConnection.on("message", ({ conversationId, messages }) => {
        if (conversationId === userId) {
          setAllMessage(messages);
        }
      });

      socketConnection.emit("seen", userId);
    }
  }, [socketConnection, userId, user]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setMessage((prev) => ({
      ...prev,
      text: value,
    }));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message?.text || message?.imageUrl || message?.videoUrl) {
      if (socketConnection) {
        socketConnection.emit("new message", {
          sender: user?._id,
          receiver: userId,
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          msgByUserId: user?._id,
        });
      }
      setMessage({
        text: "",
        videoUrl: "",
        imageUrl: "",
      });
    }
  };

  return (
    <div className="relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-[#222222] bg-opacity-30 backdrop-blur-sm"></div>
      </div>
      <div className="relative">
        <header className="sticky top-0 bg-[#202c33] text-white">
          <div className="container mx-auto flex justify-between items-center p-2.5 rounded-lg">
            <div className="flex items-center gap-4 lg:ml-3">
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
                    <span className="text-gray-300">Offline</span>
                  )}
                </p>
              </div>
            </div>
            <button className="cursor-pointer">
              <HiDotsVertical className="text-2xl text-gray-600" />
            </button>
          </div>
        </header>
        <main className="relative overflow-y-auto overflow-x-hidden h-[calc(100vh-190px)] p-4">
          <div className="absolute inset-0 overflow-y-auto">
            <div className="flex flex-col gap-5">
              {allMessage?.map((message) => (
                <div
                  key={message?._id}
                  className={`flex ${
                    message?.msgByUserId === user?._id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`p-2.5 max-w-xs sm:max-w-md rounded-lg ${
                      message?.msgByUserId === user?._id
                        ? "bg-[#005c4b] text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    {message?.text && (
                      <p className="text-base font-medium">{message?.text}</p>
                    )}
                    {message?.imageUrl && (
                      <img
                        className="mt-2 rounded-lg max-h-60 w-full object-cover"
                        src={message?.imageUrl}
                        alt=""
                      />
                    )}
                    {message?.videoUrl && (
                      <video
                        className="mt-2 rounded-lg max-h-60 w-full object-cover"
                        src={message?.videoUrl}
                        controls
                      />
                    )}
                    <span className="text-xs text-gray-400 mt-2 block">
                      {moment(message?.createdAt).fromNow()}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={currentMessage} />
            </div>
          </div>
        </main>
        <footer className="sticky bottom-0 bg-[#202c33] p-3">
          <form className="container mx-auto flex items-center" onSubmit={handleSendMessage}>
            <button
              type="button"
              className="text-[#00a884] text-3xl cursor-pointer"
              onClick={handleOpenVideoImage}
            >
              <FaCirclePlus />
            </button>
            {openImageVideoUpload && (
              <div className="fixed bottom-16 left-0 right-0 z-50 mx-auto w-full max-w-lg p-4 bg-[#111b21] border border-gray-700 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-lg text-white">Upload Image or Video</p>
                  <button
                    type="button"
                    className="text-white text-xl"
                    onClick={handleOpenVideoImage}
                  >
                    <IoClose />
                  </button>
                </div>
                <div className="flex justify-around">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <div className="flex flex-col items-center gap-1 text-[#00a884]">
                      <FaImage className="text-5xl" />
                      <span>Image</span>
                    </div>
                  </label>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={handleVideoUpload}
                    />
                    <div className="flex flex-col items-center gap-1 text-[#00a884]">
                      <FaVideo className="text-5xl" />
                      <span>Video</span>
                    </div>
                  </label>
                </div>
              </div>
            )}
            {message?.imageUrl && (
              <div className="relative ml-3">
                <button
                  type="button"
                  className="absolute top-0 right-0 p-1 text-[#00a884]"
                  onClick={handleImageClosePreview}
                >
                  <IoClose />
                </button>
                <img
                  src={message?.imageUrl}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg"
                />
              </div>
            )}
            {message?.videoUrl && (
              <div className="relative ml-3">
                <button
                  type="button"
                  className="absolute top-0 right-0 p-1 text-[#00a884]"
                  onClick={handleVideoClosePreview}
                >
                  <IoClose />
                </button>
                <video
                  src={message?.videoUrl}
                  className="w-16 h-16 object-cover rounded-lg"
                  controls
                />
              </div>
            )}
            <input
              type="text"
              name="text"
              placeholder="Type a message"
              value={message?.text}
              onChange={handleOnChange}
              className="w-full bg-[#202c33] border-none text-white outline-none p-2.5 rounded-lg mx-3"
            />
            <button type="submit" className="text-[#00a884] text-3xl">
              <IoMdSend />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}

export default MessPage;
