import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Avatar from "./Avatar";
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft, FaTrash, FaBan, FaUnlock, FaPen } from "react-icons/fa6";
import { FaCirclePlus } from "react-icons/fa6";
import { FaImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import { FaSearch, FaArrowUp, FaArrowDown, FaTimes } from "react-icons/fa";
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

  const [messageToEdit, setMessageToEdit] = useState(null);
  const [editText, setEditText] = useState("");

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [exactWordMatch, setExactWordMatch] = useState(true);

  useEffect(() => {
    if (currentMessage.current && !showSearch) {  // Only auto-scroll when not searching
      currentMessage.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [allMessage, showSearch]);

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

  // Add this useEffect to force re-render of messages every minute
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render by updating a state
      setAllMessage(prev => [...prev]);
    }, 10000); // Check every 10 seconds instead of every minute

    return () => clearInterval(interval);
  }, []);

  // Update the isMessageEditable function to be more precise
  const isMessageEditable = (messageTime) => {
    if (!messageTime) return false;
    const timeDifference = moment().diff(moment(messageTime), 'minutes', true); // Use true for floating-point precision
    return timeDifference <= 15;
  };

  // Update the isMessageDeletable function to be more precise
  const isMessageDeletable = (messageTime) => {
    if (!messageTime) return false;
    const timeDifference = moment().diff(moment(messageTime), 'minutes', true); // Use true for floating-point precision
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

  // Add handler for message edit
  const handleEditMessage = (message) => {
    setMessageToEdit(message);
    setEditText(message.text);
  };

  // Add function to save edited message
  const saveEditedMessage = () => {
    if (messageToEdit && socketConnection && currentConversation) {
      try {
        socketConnection.emit('edit_message', {
          messageId: messageToEdit._id,
          newText: editText,
          conversationId: currentConversation
        });
        setMessageToEdit(null);
        setEditText("");
      } catch (error) {
        console.error("Error editing message:", error);
        toast.error("Failed to edit message");
      }
    }
  };

  useEffect(() => {
    if (socketConnection) {
      // Add listener for edited messages
      socketConnection.on('message_edited', ({ messageId, updatedMessage }) => {
        setAllMessage(prevMessages => 
          prevMessages.map(msg => 
            msg._id === messageId ? { ...msg, ...updatedMessage } : msg
          )
        );
      });

      return () => {
        socketConnection.off('message_edited');
      };
    }
  }, [socketConnection]);

  // Add search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      // Sort results by their position in the chat (from oldest to newest)
      const results = allMessage.reduce((matches, msg, index) => {
        if (msg.text) {
          const text = msg.text.toLowerCase();
          const searchTerm = searchQuery.toLowerCase();
          
          let isMatch = false;
          if (exactWordMatch) {
            // Match whole words only using word boundaries
            const wordRegex = new RegExp(`\\b${searchTerm}\\b`, 'i');
            isMatch = wordRegex.test(text);
          } else {
            // Match any occurrence of the search term
            isMatch = text.includes(searchTerm);
          }

          if (isMatch) {
            matches.push({
              index,
              timestamp: msg.sentAt || msg.createdAt
            });
          }
        }
        return matches;
      }, []);

      // Sort results by timestamp to maintain chronological order
      results.sort((a, b) => moment(a.timestamp).valueOf() - moment(b.timestamp).valueOf());
      
      // Store only the indexes after sorting
      const sortedIndexes = results.map(r => r.index);
      
      setSearchResults(sortedIndexes);
      setCurrentSearchIndex(sortedIndexes.length > 0 ? 0 : -1);
    } else {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
    }
  }, [searchQuery, allMessage, exactWordMatch]);

  const scrollToMessage = (index) => {
    const messageElements = document.querySelectorAll('.message-item');
    if (messageElements[index]) {
      messageElements[index].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      // Add a temporary highlight effect to make it more visible
      const element = messageElements[index];
      element.style.transition = 'background-color 0.3s ease';
      element.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'; // Light blue background
      setTimeout(() => {
        element.style.backgroundColor = 'transparent';
      }, 1000);
    }
  };

  const handleNextSearch = () => {
    if (searchResults.length > 0) {
      const nextIndex = (currentSearchIndex + 1) % searchResults.length;
      setCurrentSearchIndex(nextIndex);
      scrollToMessage(searchResults[nextIndex]);
    }
  };

  const handlePreviousSearch = () => {
    if (searchResults.length > 0) {
      const prevIndex = currentSearchIndex <= 0 ? searchResults.length - 1 : currentSearchIndex - 1;
      setCurrentSearchIndex(prevIndex);
      scrollToMessage(searchResults[prevIndex]);
    }
  };

  // Add keyboard shortcuts for search navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showSearch && searchResults.length > 0) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleNextSearch();
        } else if (e.key === 'Enter' && e.shiftKey) {
          e.preventDefault();
          handlePreviousSearch();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showSearch, searchResults, currentSearchIndex]);

  // Update message rendering to include edit button and edited indicator
  const MessageContent = ({ msg }) => {
    const highlightText = (text) => {
      if (!searchQuery.trim() || !text) return text;
      
      let parts;
      if (exactWordMatch) {
        // Split by word boundaries while preserving the matched words
        const regex = new RegExp(`(\\b${searchQuery}\\b)`, 'gi');
        parts = text.split(regex);
      } else {
        // Split by any occurrence of the search term
        const regex = new RegExp(`(${searchQuery})`, 'gi');
        parts = text.split(regex);
      }

      const messageIndex = allMessage.findIndex(m => m._id === msg._id);
      const isCurrentResult = searchResults[currentSearchIndex] === messageIndex;
      
      return parts.map((part, index) => 
        part.toLowerCase() === searchQuery.toLowerCase() ? (
          <span 
            key={index} 
            className={`px-1 rounded ${
              isCurrentResult 
                ? "bg-blue-500 text-white font-bold" 
                : "bg-yellow-500 text-black"
            }`}
          >
            {part}
          </span>
        ) : part
      );
    };

    return (
      <>
        {!msg.deleted && user?._id === msg.msgByUserId && (isMessageEditable(msg.sentAt || msg.createdAt) || isMessageDeletable(msg.sentAt || msg.createdAt)) && (
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
            {isMessageEditable(msg.sentAt || msg.createdAt) && (
              <button
                onClick={() => handleEditMessage(msg)}
                className="p-1 rounded-full hover:bg-blue-500 hover:bg-opacity-20"
                title="Edit message (available for 15 minutes)"
              >
                <FaPen className="text-blue-500 w-3 h-3" />
              </button>
            )}
            {isMessageDeletable(msg.sentAt || msg.createdAt) && (
              <button
                onClick={() => handleDeleteMessage(msg)}
                className="p-1 rounded-full hover:bg-red-500 hover:bg-opacity-20"
                title="Delete message (available for 15 minutes)"
              >
                <FaTrash className="text-red-500 w-3 h-3" />
              </button>
            )}
          </div>
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
                  className="object-cover h-[320px] rounded-lg"
                  alt=""
                />
              </a>
              <div className="mt-2">
                <div className="flex-1">
                  <p className="text-lg break-words">
                    {msg.text ? highlightText(msg.text) : msg.text}
                  </p>
                </div>
                {user?._id === msg.msgByUserId && (
                  <div className="flex justify-end mt-1">
                    <MessageStatus 
                      messageId={msg._id} 
                      createdAt={msg.createdAt}
                      message={msg} 
                    />
                  </div>
                )}
              </div>
            </div>
          ) : msg.videoUrl ? (
            <div className="md:w-22 w-full h-full max-w-sm m-2 p-0">
              <video
                controls
                className="w-[250px] h-auto m-0 rounded-lg" 
                src={msg.videoUrl}
              >
              </video>
              <div className="mt-2">
                <div className="flex-1">
                  <p className="text-lg break-words">
                    {msg.text ? highlightText(msg.text) : msg.text}
                  </p>
                </div>
                {user?._id === msg.msgByUserId && (
                  <div className="flex justify-end mt-1">
                    <MessageStatus 
                      messageId={msg._id} 
                      createdAt={msg.createdAt}
                      message={msg} 
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-start w-full gap-2">
              <div className="flex-1">
                <p className="text-lg break-words">
                  {msg.text ? highlightText(msg.text) : msg.text}
                </p>
              </div>
              <div className="flex-shrink-0 self-end">
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
            </div>
          )
        ) : null}
      </>
    );
  };

  // Add edit message modal
  const EditMessageModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#202c33] p-6 rounded-lg shadow-xl max-w-lg w-full mx-4">
        <h3 className="text-xl font-semibold text-white mb-4">Edit Message</h3>
        <textarea
          value={editText}
          onChange={(e) => {
            // Limit text to 1000 characters
            if (e.target.value.length <= 1000) {
              setEditText(e.target.value);
            }
          }}
          onFocus={(e) => {
            // Set cursor to end of text
            const len = e.target.value.length;
            e.target.setSelectionRange(len, len);
          }}
          autoFocus
          className="w-full p-4 bg-[#323739] text-white rounded-lg mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] text-base"
          placeholder="Type your message..."
          rows="4"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#8696a0]">
            {editText.length}/1000 characters
          </span>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setMessageToEdit(null)}
              className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveEditedMessage}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!editText.trim() || editText.length > 1000}
            >
              Save
            </button>
          </div>
        </div>
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
            {!showSearch ? (
              <>
                <div className="flex items-center gap-4 lg:ml-3">
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
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowSearch(true)}
                    className="cursor-pointer p-2 hover:bg-[#323131] rounded-full"
                  >
                    <FaSearch className="text-xl text-gray-600" />
                  </button>
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
              </>
            ) : (
              <div className="flex items-center w-full gap-2 px-2">
                <button 
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="p-2 hover:bg-[#323131] rounded-full"
                >
                  <FaTimes className="text-gray-600" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in chat..."
                    className="w-full bg-[#323739] text-white rounded-lg px-4 py-2 focus:outline-none"
                    autoFocus
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={exactWordMatch}
                        onChange={(e) => setExactWordMatch(e.target.checked)}
                        className="form-checkbox h-3 w-3 text-blue-500 rounded"
                      />
                      <span className="text-gray-400">Match whole words</span>
                    </label>
                    {searchResults.length > 0 && (
                      <>
                        <span className="text-sm text-gray-400 border-l border-gray-600 pl-4">
                          {currentSearchIndex + 1}/{searchResults.length}
                        </span>
                        <span className="text-xs text-gray-500">
                          (Press Enter ↵)
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button 
                  onClick={handlePreviousSearch}
                  className="p-2 hover:bg-[#323131] rounded-full disabled:opacity-50"
                  disabled={searchResults.length === 0}
                  title="Previous (Shift + Enter)"
                >
                  <FaArrowUp className="text-gray-600" />
                </button>
                <button 
                  onClick={handleNextSearch}
                  className="p-2 hover:bg-[#323131] rounded-full disabled:opacity-50"
                  disabled={searchResults.length === 0}
                  title="Next (Enter)"
                >
                  <FaArrowDown className="text-gray-600" />
                </button>
              </div>
            )}
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
                        className={`message-item flex ${
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
                                ? "bg-[#005c4b] text-[#fdfcfc]"
                                : "bg-[#202c33] text-[#fffefe]"
                          }`}
                        >
                          <MessageContent msg={msg} />
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

      {messageToEdit && <EditMessageModal />}
    </div>
  );
}

export default MessPage;