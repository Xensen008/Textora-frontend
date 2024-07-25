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

      socketConnection.on("message", (data) => {
        console.log("message convo", data);
        if (data && data.length > 0 && (data[0].sender === userId || data[0].receiver === userId)) {
          setAllMessage(data);
        }
      });

      socketConnection.emit('seen', userId);
    }
  }, [socketConnection, userId, user]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    setMessage((prev) => {
      return {
        ...prev,
        text: value,
      };
    });
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
        <header className="sticky top-0 bg-[#202c33] text-white ">
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

        <section className="h-[calc(100vh-134px)] overflow-x-hidden overflow-y-scroll scrollbar">
          <div className="flex flex-col gap-2 py-3 lg:mx-5 mx-2" ref={currentMessage}>
            {allMessage.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  user?._id === msg.msgByUserId ? "justify-end" : "justify-start "
                }`}
              >
                <div
                  className={`${
                    msg.imageUrl || msg.videoUrl ? "flex-col" : "flex"
                  } items-center gap-4 py-2 px-4 rounded-lg shadow-lg ${
                    user?._id === msg.msgByUserId
                      ? "bg-[#074d40] text-[#fdfcfc]"
                      : "bg-[#323131] text-[#fffefe]"
                  }`}
                >
                  {msg.imageUrl ? (
                    <div className="md:w-22 aspect-square w-[95%] h-full max-w-sm m-2 object-scale-down">
                      <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={msg.imageUrl}
                          className="object-cover h-[320px]"
                          alt=""
                        />
                      </a>
                      <p className="text-lg break-words mt-2">{msg.text}</p>
                      <p className="text-xs mt-2 text-slate-300">
                        {moment(msg.createdAt).format("hh:mm A")}
                      </p>
                    </div>
                  ) : msg.videoUrl ? (
                    <div className="md:w-22 w-full h-full max-w-sm m-2 p-0">
                      <video
                        controls
                        className="w-[250px] h-auto m-0"
                        src={msg.videoUrl}
                      >
                      </video>
                      <p className="text-lg break-words mt-2">{msg.text}</p>
                      <p className="text-xs text-slate-300">
                        {moment(msg.createdAt).format("hh:mm A")}
                      </p>
                    </div>
                  ) : (
                    <div className="flex justify-between w-full">
                      <p className="text-lg break-words flex-grow">
                        {msg.text}
                      </p>
                      <p className="text-xs ml-4 self-end text-slate-300">
                        {moment(msg.createdAt).format("hh:mm A")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {message?.imageUrl && (
            <div className="w-full h-full sticky bottom-0 bg-slate-800 bg-opacity-30 px-1 py-1 text-white">
              <div className="relative w-32 aspect-square rounded-md">
                <img
                  src={message.imageUrl}
                  alt="uploaded"
                  className="w-full h-full object-cover rounded-md"
                />
                <span
                  onClick={handleImageClosePreview}
                  className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-md cursor-pointer"
                >
                  <IoClose size={20} />
                </span>
              </div>
            </div>
          )}
          {message?.videoUrl && (
            <div className="w-full h-full sticky bottom-0 bg-slate-800 bg-opacity-30 px-1 py-1 text-white">
              <div className="relative w-32 h-32 rounded-md">
                <video
                  src={message.videoUrl}
                  className="w-full h-full object-cover rounded-md"
                />
                <span
                  onClick={handleVideoClosePreview}
                  className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-md cursor-pointer"
                >
                  <IoClose size={20} />
                </span>
              </div>
            </div>
          )}
        </section>

        <footer className="sticky bottom-0 w-full bg-[#202c33] text-white py-3">
          <div className="container mx-auto flex justify-center items-center gap-4 px-2">
            <div className="relative">
              <FaCirclePlus
                className="text-2xl text-slate-500"
                onClick={handleOpenVideoImage}
              />
              {openImageVideoUpload && (
                <div className="absolute top-8 right-0 bg-slate-800 bg-opacity-40 p-3 rounded-md flex flex-col gap-4">
                  <label className="cursor-pointer">
                    <FaImage className="text-2xl" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <label className="cursor-pointer">
                    <FaVideo className="text-2xl" />
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoUpload}
                    />
                  </label>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex-grow flex gap-2">
              <input
                type="text"
                className="flex-grow bg-[#2b3942] py-2 px-4 rounded-md outline-none text-white"
                placeholder="Type a message..."
                name="text"
                value={message.text}
                onChange={handleOnChange}
              />
              <button type="submit">
                <IoMdSend className="text-2xl text-slate-500" />
              </button>
            </form>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default MessPage;
