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

      socketConnection.on("message", ({ conversationId, messages }) => {
        if (conversationId === userId) {
          if (Array.isArray(messages)) {
            setAllMessage(messages);
          } else {
            console.error("Received messages is not an array:", messages);
          }
        }
      });

      socketConnection.emit("seen", userId);
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
        {/* Overlay with blur or transparency */}
        <div className="absolute inset-0 bg-[#222222] bg-opacity-30 backdrop-blur-sm"></div>
      </div>
      <div className="relative">
        <header className="sticky top-0  bg-[#202c33]  text-white ">
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

        {/* show all message */}

        <section className="h-[calc(100vh-134px)] overflow-x-hidden overflow-y-scroll scrollbar">
          <div
            className="flex flex-col gap-2 py-3 lg:mx-5 mx-2"
            ref={currentMessage}
          >
            {allMessage.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  user?._id === msg.msgByUserId
                    ? "justify-end"
                    : "justify-start "
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
                      <a
                        href={msg.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={msg.imageUrl}
                          className=" object-cover h-[320px]"
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
                      ></video>
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
            <div className="w-full h-full sticky bottom-0 bg-slate-600 bg-opacity-40 flex justify-center items-center rounded overflow-hidden">
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
            <div className="w-full h-full sticky bottom-0 bg-slate-600 bg-opacity-40 flex justify-center items-center rounded overflow-hidden">
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
        </section>

        <section className="h-16 bg-[#1a2326] flex items-center px-2">
          <div className="relative ">
            <button
              onClick={handleOpenVideoImage}
              className="flex justify-center items-center w-10 h-10 rounded-full hover:bg-[#323131]"
            >
              <FaCirclePlus size={20} className="text-[#b5c0b0]" />
            </button>
            {openImageVideoUpload && (
              <div className="bg-[#1a2326] shadow rounded absolute bottom-14 w-36 p-2 ">
                <form>
                  <label
                    htmlFor="image"
                    className="flex items-center p-2 gap-3  hover:bg-[#323131] cursor-pointer"
                  >
                    <div className="text-[#b5c0b0]">
                      <FaImage size={18} />
                    </div>
                    <p className="text-[#b5c0b0]">Image</p>
                  </label>
                  <label
                    htmlFor="video"
                    className="flex items-center p-2 gap-3  hover:bg-[#323131] cursor-pointer"
                  >
                    <div className="text-[#b5c0b0]">
                      <FaVideo size={18} />
                    </div>
                    <p className="text-[#b5c0b0]">Video</p>
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

          {/* input for mess */}
          <form
            className="h-full w-full flex gap-3"
            onSubmit={handleSendMessage}
          >
            <input
              type="text"
              placeholder="Type a Message..."
              className="py-1 px-4 outline-none w-full h-full bg-[#131c21] text-[#FFFFFF] placeholder-[#B5C0B0] rounded-full"
              value={message?.text}
              onChange={handleOnChange}
            />
            <button className="cursor-pointer hover:text-[#B5C0B0]">
              <IoMdSend size={25} className="text-[#b5c0b0]" />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default MessPage;
