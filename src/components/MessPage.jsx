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
import { BsCheck, BsCheckAll } from "react-icons/bs";

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

  // Add new state for message statuses
  const [messageStatuses, setMessageStatuses] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [allMessage]);

  // Update message statuses when messages change
  useEffect(() => {
    const newStatuses = {};
    allMessage.forEach(msg => {
      if (msg.status) {
        newStatuses[msg._id] = msg.status;
      }
    });
    setMessageStatuses(prev => ({...prev, ...newStatuses}));
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
    if (socketConnection && userId) {
      setIsLoading(true);
      setLoadError(null);
      
      // Only emit message-page event if we have a valid connection and userId
      const loadTimeout = setTimeout(() => {
        socketConnection.emit("message-page", userId);
      }, 100); // Small delay to prevent rapid re-emissions

      return () => {
        clearTimeout(loadTimeout);
      };
    }
  }, [userId, socketConnection]); // Remove retryCount dependency

  useEffect(() => {
    if (socketConnection) {
      // Clean up previous listeners first
      const cleanupListeners = () => {
        socketConnection.off("message-user");
        socketConnection.off("message");
        socketConnection.off("new_message");
        socketConnection.off("error");
        socketConnection.off("delete_success");
        socketConnection.off("message_status_update");
        socketConnection.off("messages_seen_batch");
        socketConnection.off("force_message_update");
        socketConnection.off('block_success');
        socketConnection.off('unblock_success');
      };

      cleanupListeners();
      
      socketConnection.on("message-user", (data) => {
        if (data.user._id === userId) { // Only update if it's for the current chat
          setDataUser(data.user);
          setCurrentConversation(data.conversationId);
          setIsBlocked(data.user.isBlocked);
          setIsLoading(false);
          
          if (data.user.isBlocked) {
            setAllMessage([]);
            setMessageStatuses({});
          }
        }
      });

      // Handle messages seen in batch
      socketConnection.on("messages_seen_batch", ({ messageIds, seenAt }) => {
        setMessageStatuses(prev => {
          const newStatuses = { ...prev };
          messageIds.forEach(messageId => {
            newStatuses[messageId] = 'seen';
          });
          return newStatuses;
        });

        setAllMessage(prevMessages => 
          prevMessages.map(msg => 
            messageIds.includes(msg._id) 
              ? { ...msg, status: 'seen', seenAt, seen: true }
              : msg
          )
        );
      });

      // Handle new messages with immediate status updates
      socketConnection.on("new_message", (data) => {
        if (data && Array.isArray(data.messages) && data.messages.length > 0) {
          const newMessage = data.messages[0];
          
          if (!isBlocked && (!currentConversation || data.conversationId === currentConversation)) {
            // Update status immediately
            setMessageStatuses(prev => ({
              ...prev,
              [newMessage._id]: newMessage.status || 'sent'
            }));

            setAllMessage(prev => {
              // If this is replacing a temporary message
              if (data.replaceTemp) {
                return prev.map(msg => 
                  msg._id === data.replaceTemp ? newMessage : msg
                );
              }
              
              // If this is a temporary message
              if (data.isTemp) {
                return [...prev, newMessage];
              }
              
              // If this is a new message from another user
              if (newMessage.msgByUserId !== user?._id) {
                // Mark as seen immediately
                if (socketConnection && data.conversationId) {
                  socketConnection.emit('message_seen', {
                    messageId: newMessage._id,
                    conversationId: data.conversationId
                  });
                }
                return [...prev, newMessage];
              }
              
              // For regular messages
              if (!prev.some(msg => msg._id === newMessage._id)) {
                return [...prev, newMessage];
              }
              return prev;
            });
          }
        }
      });

      // Handle initial messages and updates
      socketConnection.on("message", (data) => {
        if (data && Array.isArray(data.messages)) {
          if (!currentConversation || 
              data.conversationId === currentConversation ||
              (data.participants && 
               (data.participants.sender === userId || data.participants.receiver === userId))) {
            
            if (isBlocked) {
              setAllMessage([]);
              setMessageStatuses({});
              return;
            }

            const updatedMessages = data.messages.filter(msg => 
              !(msg.deleted && msg.msgByUserId === user?._id)
            );
            
            // Update message statuses in batch
            setMessageStatuses(prev => {
              const newStatuses = { ...prev };
              updatedMessages.forEach(msg => {
                if (msg.status && (!newStatuses[msg._id] || getStatusPriority(msg.status) > getStatusPriority(newStatuses[msg._id]))) {
                  newStatuses[msg._id] = msg.status;
                }
              });
              return newStatuses;
            });
            
            setAllMessage(updatedMessages);
            setCurrentConversation(data.conversationId);

            // Mark messages as seen in batch
            const unseenMessages = updatedMessages.filter(msg => 
              msg.msgByUserId !== user?._id && msg.status !== 'seen'
            );

            if (unseenMessages.length > 0 && socketConnection && data.conversationId) {
              // Update local status immediately for all unseen messages
              setMessageStatuses(prev => {
                const newStatuses = { ...prev };
                unseenMessages.forEach(msg => {
                  newStatuses[msg._id] = 'seen';
                });
                return newStatuses;
              });

              // Send seen status to server for all messages at once
              unseenMessages.forEach(msg => {
                socketConnection.emit('message_seen', {
                  messageId: msg._id,
                  conversationId: data.conversationId
                });
              });
            }
          }
        }
      });

      // Handle message status updates
      socketConnection.on("message_status_update", ({ messageId, status, deliveredAt, seenAt }) => {
        setMessageStatuses(prev => {
          const currentStatus = prev[messageId];
          if (!currentStatus || getStatusPriority(status) > getStatusPriority(currentStatus)) {
            // Update the message in allMessage to include timestamps
            setAllMessage(prevMessages => 
              prevMessages.map(msg => 
                msg._id === messageId 
                  ? {
                      ...msg,
                      status,
                      deliveredAt: deliveredAt || msg.deliveredAt,
                      seenAt: seenAt || msg.seenAt,
                      seen: status === 'seen'
                    }
                  : msg
              )
            );
            return { ...prev, [messageId]: status };
          }
          return prev;
        });
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
          setMessageStatuses({});
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

      return cleanupListeners;
    }
  }, [socketConnection, userId, currentConversation, user?._id, isBlocked]);

  // Helper function to determine status priority
  const getStatusPriority = (status) => {
    const priorities = { sent: 1, delivered: 2, seen: 3 };
    return priorities[status] || 0;
  };

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
    if ((message?.text?.trim() || message?.imageUrl || message?.videoUrl) && socketConnection) {
      const messageToSend = {
        text: message.text?.trim() || "",
        imageUrl: message.imageUrl || "",
        videoUrl: message.videoUrl || "",
      };

      // Clear input immediately for better UX
      setMessage({
        text: "",
        videoUrl: "",
        imageUrl: "",
      });

      // Send message only once
      socketConnection.emit("new message", {
        sender: user?._id,
        receiver: userId,
        ...messageToSend,
        msgByUserId: user?._id,
        conversationId: currentConversation
      });
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

  // Update MessageStatus component to use messageStatuses and timestamps
  const MessageStatus = ({ messageId, createdAt, message }) => {
    const status = messageStatuses[messageId] || message.status || 'sent';
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-300">
          {moment(message.sentAt || createdAt).format("hh:mm A")}
        </span>
        {status === 'sent' && (
          <BsCheck className="text-slate-300" title="Sent" />
        )}
        {status === 'delivered' && (
          <BsCheckAll 
            className="text-slate-300" 
            title={`Delivered ${message.deliveredAt ? moment(message.deliveredAt).format('MMM D, h:mm A') : ''}`}
          />
        )}
        {status === 'seen' && (
          <BsCheckAll 
            className="text-blue-500" 
            title={`Seen ${message.seenAt ? moment(message.seenAt).format('MMM D, h:mm A') : ''}`}
          />
        )}
      </div>
    );
  };

  // Add this helper function at the top of the file, after imports
  const getMessageDateGroup = (date) => {
    const today = moment().startOf('day');
    const messageDate = moment(date).startOf('day');
    const yesterday = moment().subtract(1, 'days').startOf('day');
    
    if (messageDate.isSame(today)) {
      return 'Today';
    } else if (messageDate.isSame(yesterday)) {
      return 'Yesterday';
    } else if (messageDate.isSame(today, 'year')) {
      return messageDate.format('dddd, MMMM D'); // e.g. "Monday, June 1"
    } else {
      return messageDate.format('dddd, MMMM D, YYYY'); // e.g. "Monday, June 1, 2023"
    }
  };

  // Add function to check if message is within 15 minutes
  const isMessageDeletable = (messageTime) => {
    const timeDifference = moment().diff(moment(messageTime), 'minutes');
    return timeDifference <= 15;
  };

  // Add this component for the date header
  const DateHeader = ({ date }) => (
    <div className="flex justify-center my-4">
      <div className="bg-[#202c33] text-[#8696a0] text-xs px-4 py-2 rounded-lg">
        {date}
      </div>
    </div>
  );

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
              {isLoading ? (
                <div className="animate-pulse flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
                  <div>
                    <div className="h-4 w-24 bg-gray-600 rounded"></div>
                    <div className="h-3 w-16 bg-gray-600 rounded mt-2"></div>
                  </div>
                </div>
              ) : loadError ? (
                <div className="text-red-400">{loadError}</div>
              ) : (
                <>
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
                </>
              )}
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
          {isLoading ? (
            <div className="flex flex-col gap-4 p-4">
              <div className="animate-pulse flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-start">
                    <div className="bg-gray-600 h-10 w-48 rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-red-400 mb-4">{loadError}</p>
              <button
                onClick={() => {
                  setLoadError(null);
                  if (socketConnection) {
                    socketConnection.emit("message-page", userId);
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 py-3 lg:mx-5 mx-2" ref={currentMessage}>
              {!isBlocked && Array.isArray(allMessage) && allMessage.length > 0 ? (
                <>
                  {allMessage.reduce((groups, msg, index) => {
                    const messageDate = moment(msg.sentAt || msg.createdAt).startOf('day').valueOf();
                    
                    // If this is the first message or the date is different from the previous message
                    if (index === 0 || messageDate !== moment(allMessage[index - 1].sentAt || allMessage[index - 1].createdAt).startOf('day').valueOf()) {
                      groups.push(
                        <DateHeader 
                          key={`date-${messageDate}`} 
                          date={getMessageDateGroup(msg.sentAt || msg.createdAt)} 
                        />
                      );
                    }
                    
                    groups.push(
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
                          {!msg.deleted && user?._id === msg.msgByUserId && isMessageDeletable(msg.sentAt || msg.createdAt) && (
                            <button
                              onClick={() => handleDeleteMessage(msg)}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-red-500 hover:bg-opacity-20"
                              title="Delete message (available for 15 minutes)"
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
                                    className="object-cover h-[320px]"
                                    alt=""
                                  />
                                </a>
                                <p className="text-lg break-words mt-2">{msg.text}</p>
                                {user?._id === msg.msgByUserId && (
                                  <MessageStatus 
                                    messageId={msg._id} 
                                    createdAt={msg.createdAt}
                                    message={msg} 
                                  />
                                )}
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
                                {user?._id === msg.msgByUserId && (
                                  <MessageStatus 
                                    messageId={msg._id} 
                                    createdAt={msg.createdAt}
                                    message={msg} 
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="flex justify-between items-end w-full gap-2">
                                <p className="text-lg break-words">{msg.text}</p>
                                {user?._id === msg.msgByUserId ? (
                                  <MessageStatus 
                                    messageId={msg._id} 
                                    createdAt={msg.createdAt}
                                    message={msg} 
                                  />
                                ) : (
                                  <span className="text-xs text-slate-300">
                                    {moment(msg.createdAt).format("hh:mm A")}
                                  </span>
                                )}
                              </div>
                            )
                          ) : null}
                        </div>
                      </div>
                    );
                    
                    return groups;
                  }, [])}
                </>
              ) : (
                <div className="text-center text-gray-400 py-4">
                  {isBlocked ? 'Messages are hidden while this user is blocked.' : 'No messages yet. Start a conversation!'}
                </div>
              )}
            </div>
          )}

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