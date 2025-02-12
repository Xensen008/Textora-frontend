import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Avatar from "./Avatar";
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft, FaTrash, FaBan, FaUnlock } from "react-icons/fa6";
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
  const onlineUsers = useSelector((state) => state?.user?.onlineUser || []);
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );
  const dispatch = useDispatch();
  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profile_pic: "",
    _id: "",
  });

  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);

  const [message, setMessage] = useState({
    text: "",
    videoUrl: "",
    imageUrl: "",
  });

  const [allMessage, setAllMessage] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const currentMessage = useRef(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

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

  const getMessageSectionHeight = () => {
    if (isBlocked) {
      return "h-[calc(100vh-166px)]";
    }
    return "h-[calc(100vh-134px)]";
  };

  useEffect(() => {
    if (socketConnection) {
      socketConnection.off("message-user");
      socketConnection.off("message");
      socketConnection.off("error");
      socketConnection.off("delete_success");
      
      socketConnection.emit("leave-conversation");
      
      socketConnection.emit("message-page", userId);
  
      socketConnection.on("message-user", (data) => {
        console.log("Received message-user data:", data);
        if (data && data.user) {
          setDataUser(data.user);
          setCurrentConversation(data.conversationId);
          setIsBlocked(data.user.isBlocked);
          
          if (data.user.isBlocked) {
            setAllMessage([]);
          }
        }
      });

      socketConnection.on("message", (data) => {
        console.log("Received message data:", data);
        if (data && Array.isArray(data.messages)) {
          if (!currentConversation || 
              data.conversationId === currentConversation ||
              (data.participants && 
               (data.participants.sender === userId || data.participants.receiver === userId))) {
            
            if (isBlocked) {
              setAllMessage([]);
              return;
            }

            const updatedMessages = data.messages.filter(msg => {
              if (msg.deleted && msg.msgByUserId === user?._id) {
                return false;
              }
              return true;
            });
            
            setAllMessage(updatedMessages);
            setCurrentConversation(data.conversationId);
          }
        }
      });

      socketConnection.on("delete_success", ({ messageId }) => {
        console.log("Message deleted successfully:", messageId);
        toast.success("Message deleted successfully");
        
        setAllMessage(prevMessages => 
          prevMessages.filter(msg => msg._id !== messageId)
        );

        socketConnection.emit("force_message_update", {
          messageId,
          conversationId: currentConversation,
          receiverId: userId
        });
      });

      socketConnection.on("force_message_update", ({ messageId }) => {
        setAllMessage(prevMessages => 
          prevMessages.map(msg => 
            msg._id === messageId 
              ? { ...msg, deleted: true }
              : msg
          )
        );
      });

      socketConnection.on("error", (error) => {
        console.error("Socket error:", error);
        toast.error(error);
      });

      socketConnection.on('block_success', ({ blockedUserId }) => {
        if (blockedUserId === userId) {
          setIsBlocked(true);
          setAllMessage([]);
          toast.success('User blocked successfully');
          setShowMenu(false);
        }
      });

      socketConnection.on('unblock_success', ({ unblockedUserId }) => {
        if (unblockedUserId === userId) {
          setIsBlocked(false);
          socketConnection.emit("message-page", userId);
          toast.success('User unblocked successfully');
          setShowMenu(false);
        }
      });
    }

    return () => {
      if (socketConnection) {
        socketConnection.emit("leave-conversation");
        socketConnection.off("message-user");
        socketConnection.off("message");
        socketConnection.off("error");
        socketConnection.off("delete_success");
        socketConnection.off("force_message_update");
        socketConnection.off('block_success');
        socketConnection.off('unblock_success');
      }
    };
  }, [socketConnection, userId, currentConversation, user?._id, isBlocked]);

  useEffect(() => {
    if (socketConnection && userId) {
      setCurrentConversation(null);
      setAllMessage([]);
      
      socketConnection.emit("message-page", userId);
    }
  }, [userId, socketConnection]);

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
    if ((message?.text?.trim() || message?.imageUrl || message?.videoUrl)) {
      console.log("Sending message with data:", {
        sender: user?._id,
        receiver: userId,
        text: message.text,
        imageUrl: message.imageUrl,
        videoUrl: message.videoUrl,
        msgByUserId: user?._id,
        conversationId: currentConversation
      });

      if (socketConnection) {
        const messageToSend = {
          text: message.text?.trim() || "",
          imageUrl: message.imageUrl || "",
          videoUrl: message.videoUrl || "",
        };

        setMessage({
          text: "",
          videoUrl: "",
          imageUrl: "",
        });

        socketConnection.emit("new message", {
          sender: user?._id,
          receiver: userId,
          ...messageToSend,
          msgByUserId: user?._id,
          conversationId: currentConversation
        });
      }
    }
  };

  const handleDeleteMessage = (message) => {
    setMessageToDelete(message);
  };

  const confirmDelete = () => {
    if (messageToDelete && socketConnection && currentConversation) {
      try {
        socketConnection.emit('delete_message', {
          messageId: messageToDelete._id,
          conversationId: currentConversation
        });
        setMessageToDelete(null);
      } catch (error) {
        console.error("Error deleting message:", error);
        toast.error("Failed to delete message");
      }
    }
  };

  const handleBlockUser = () => {
    if (socketConnection && userId) {
      socketConnection.emit('block_user', { userIdToBlock: userId });
    }
  };

  const handleUnblockUser = () => {
    if (socketConnection && userId) {
      socketConnection.emit('unblock_user', { userIdToUnblock: userId });
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
      <div className="relative flex flex-col h-screen">
        <header className="sticky top-0 bg-[#202c33] text-white z-10">
          <div className="container mx-auto flex justify-between items-center p-2.5 rounded-lg">
            <div className="flex items-center gap-4 lg:ml-3">
              {" "}
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
                  {Array.isArray(onlineUsers) && onlineUsers.includes(dataUser?._id) ? (
                    <span className="text-green-600">Online</span>
                  ) : (
                    <span className="text-gray-300">Offline</span>
                  )}
                </p>
              </div>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="cursor-pointer p-2 hover:bg-[#323131] rounded-full"
              >
                <HiDotsVertical className="text-2xl text-gray-600" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#202c33] rounded-md shadow-lg z-50">
                  {isBlocked ? (
                    <button
                      onClick={handleUnblockUser}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#323131]"
                    >
                      <FaUnlock className="mr-2" />
                      Unblock User
                    </button>
                  ) : (
                    <button
                      onClick={handleBlockUser}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-[#323131]"
                    >
                      <FaBan className="mr-2" />
                      Block User
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {isBlocked && (
          <div className="bg-red-500 bg-opacity-10 text-red-400 text-center py-2 px-4 border-b border-red-500 border-opacity-20">
            You have blocked this user. They can still send messages, but you won't see them.
          </div>
        )}

        <section className={`${getMessageSectionHeight()} overflow-x-hidden overflow-y-scroll scrollbar flex-grow`}>
          <div className="flex flex-col gap-2 py-3 lg:mx-5 mx-2" ref={currentMessage}>
            {!isBlocked && Array.isArray(allMessage) && allMessage.length > 0 ? (
              allMessage.map((msg, index) => (
                <div
                  key={msg._id || index}
                  className={`flex ${
                    user?._id === msg.msgByUserId ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`relative group ${
                      msg.imageUrl || msg.videoUrl ? "flex-col" : "flex"
                    } items-center gap-4 py-2 px-4 rounded-lg shadow-lg ${
                      msg.deleted 
                        ? "bg-gray-700 bg-opacity-50" 
                        : user?._id === msg.msgByUserId
                          ? "bg-[#074d40] text-[#fdfcfc]"
                          : "bg-[#323131] text-[#fffefe]"
                    }`}
                  >
                    {!msg.deleted && user?._id === msg.msgByUserId && (
                      <button
                        onClick={() => handleDeleteMessage(msg)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-red-500 hover:bg-opacity-20"
                        title="Delete message"
                      >
                        <FaTrash className="text-red-500 w-3 h-3" />
                      </button>
                    )}
                    
                    {msg.deleted && msg.msgByUserId !== user?._id ? (
                      <div className="flex items-center gap-2 text-gray-400 italic">
                        <FaTrash className="w-3 h-3" />
                        <span className="text-sm">Message was deleted</span>
                      </div>
                    ) : !msg.deleted ? (
                      msg.imageUrl ? (
                        <div className="md:w-22 aspect-square w-[95%] h-full max-w-sm m-2 object-scale-down">
                          <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
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
                          >
                          </video>
                          <p className="text-lg break-words mt-2">{msg.text}</p>
                          <p className="text-xs text-slate-300">
                            {moment(msg.createdAt).format("hh:mm A")}
                          </p>
                        </div>
                      ) : (
                        <div className="flex justify-between w-full">
                          <p className="text-lg break-words flex-grow pr-6">
                            {msg.text}
                          </p>
                          <p className="text-xs ml-4 self-end text-slate-300">
                            {moment(msg.createdAt).format("hh:mm A")}
                          </p>
                        </div>
                      )
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">
                {isBlocked ? 'Messages are hidden while this user is blocked.' : 'No messages yet. Start a conversation!'}
              </div>
            )}
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

        <section className="h-16 bg-[#1a2326] flex items-center px-2 mt-auto">
          <div className="relative ">
            <button
              onClick={handleOpenVideoImage}
              className={`flex justify-center items-center w-10 h-10 rounded-full ${
                isBlocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#323131]'
              }`}
              disabled={isBlocked}
            >
              <FaCirclePlus size={20} className="text-[#b5c0b0]" />
            </button>
            {openImageVideoUpload && !isBlocked && (
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

          <form
            className="h-full w-full flex gap-3"
            onSubmit={handleSendMessage}
          >
            <input
              type="text"
              placeholder={isBlocked ? "You cannot send messages while blocked" : "Type a Message..."}
              className={`py-1 px-4 outline-none w-full h-full bg-[#131c21] text-[#FFFFFF] placeholder-[#B5C0B0] rounded-full ${
                isBlocked ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              value={message?.text}
              onChange={handleOnChange}
              disabled={isBlocked}
            />
            <button 
              className={`cursor-pointer hover:text-[#B5C0B0] ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isBlocked}
            >
              <IoMdSend size={25} className="text-[#b5c0b0]" />
            </button>
          </form>
        </section>
      </div>

      {messageToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#202c33] p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Delete Message?</h3>
            <p className="text-gray-300 mb-6">This message will be deleted for everyone in this chat. This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setMessageToDelete(null)}
                className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessPage;