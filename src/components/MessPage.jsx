import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Avatar from "./Avatar";
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft, FaBan, FaUnlock } from "react-icons/fa6";
import { FaCirclePlus } from "react-icons/fa6";
import { FaImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import { FaSearch, FaArrowUp, FaArrowDown, FaTimes } from "react-icons/fa";
import uploadFile from "../utils/uploadFile";
import { IoClose } from "react-icons/io5";
import { toast } from "react-hot-toast";
import { IoMdSend } from "react-icons/io";
import moment from "moment";
import { BsCheck, BsCheckAll } from "react-icons/bs";

// Add styles for search highlighting
const searchHighlightStyles = `
  .current-search-highlight {
    animation: highlightFade 2s ease-out;
  }
  
  @keyframes highlightFade {
    0% { background-color: rgba(88, 101, 242, 0.3); }
    100% { background-color: rgba(88, 101, 242, 0.1); }
  }
  
  .message-item {
    transition: background-color 0.2s ease-out;
  }
`;

// Add style tag to document head
if (!document.getElementById('search-highlight-styles')) {
  const styleSheet = document.createElement("style");
  styleSheet.id = 'search-highlight-styles';
  styleSheet.textContent = searchHighlightStyles;
  document.head.appendChild(styleSheet);
}

// Add this CSS at the top of the file with other styles
const additionalStyles = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.2s ease-out forwards;
  }
`;

if (!document.getElementById('additional-styles')) {
  const styleSheet = document.createElement("style");
  styleSheet.id = 'additional-styles';
  styleSheet.textContent = additionalStyles;
  document.head.appendChild(styleSheet);
}

// Update dark theme styles with subtle doodle pattern
const chatBackgroundStyles = `
  .chat-background {
    background: linear-gradient(160deg, #111b21 0%, #202c33 100%);
    position: relative;
    color: #e9edef;
  }

  .chat-background::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M25 25h10v10H25zM45 25h10v10H45zM65 25h10v10H65zM25 45h10v10H25zM45 45h10v10H45zM65 45h10v10H65zM25 65h10v10H25zM45 65h10v10H45zM65 65h10v10H65z'/%3E%3Cpath d='M15 15c0 2.7614-2.2386 5-5 5s-5-2.2386-5-5 2.2386-5 5-5 5 2.2386 5 5zM35 15c0 2.7614-2.2386 5-5 5s-5-2.2386-5-5 2.2386-5 5-5 5 2.2386 5 5zM55 15c0 2.7614-2.2386 5-5 5s-5-2.2386-5-5 2.2386-5 5-5 5 2.2386 5 5zM75 15c0 2.7614-2.2386 5-5 5s-5-2.2386-5-5 2.2386-5 5-5 5 2.2386 5 5zM15 35c0 2.7614-2.2386 5-5 5s-5-2.2386-5-5 2.2386-5 5-5 5 2.2386 5 5zM35 35c0 2.7614-2.2386 5-5 5s-5-2.2386-5-5 2.2386-5 5-5 5 2.2386 5 5zM55 35c0 2.7614-2.2386 5-5 5s-5-2.2386-5-5 2.2386-5 5-5 5 2.2386 5 5zM75 35c0 2.7614-2.2386 5-5 5s-5-2.2386-5-5 2.2386-5 5-5 5 2.2386 5 5z'/%3E%3C/g%3E%3C/svg%3E"),
                url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    background-position: center;
    opacity: 0.4;
    mix-blend-mode: soft-light;
    pointer-events: none;
  }

  .chat-background::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(32, 44, 51, 0.3) 100%);
    pointer-events: none;
  }

  .message-container {
    background-color: transparent;
    position: relative;
    z-index: 1;
  }

  .message-bubble-sent {
    background-color: #005c4b;
    color: #e9edef;
    border-radius: 8px 8px 2px 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;
  }

  .message-bubble-sent::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.03) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.03) 50%, rgba(255, 255, 255, 0.03) 75%, transparent 75%, transparent);
    background-size: 4px 4px;
    opacity: 0.1;
  }

  .message-bubble-received {
    background-color: #202c33;
    color: #e9edef;
    border-radius: 8px 8px 8px 2px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;
  }

  .message-bubble-received::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.02) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.02) 50%, rgba(255, 255, 255, 0.02) 75%, transparent 75%, transparent);
    background-size: 4px 4px;
    opacity: 0.1;
  }
`;

if (!document.getElementById('chat-background-styles')) {
  const styleSheet = document.createElement("style");
  styleSheet.id = 'chat-background-styles';
  styleSheet.textContent = chatBackgroundStyles;
  document.head.appendChild(styleSheet);
}

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
  const [showMenu, setShowMenu] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  // Add new state for message statuses
  const [messageStatuses, setMessageStatuses] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [exactWordMatch, setExactWordMatch] = useState(true);

  // Update scroll behavior to be more controlled
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Add after the existing state declarations
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  // Update highlightText function for better visibility
  const highlightText = (text, message) => {
    if (!searchQuery.trim() || !text) return text;
    
    const messageIndex = allMessage.indexOf(message);
    const isCurrentResult = searchResults[currentSearchIndex] === messageIndex;
    
    let parts;
    if (exactWordMatch) {
      const regex = new RegExp(`(\\b${searchQuery}\\b)`, 'gi');
      parts = text.split(regex);
    } else {
      const regex = new RegExp(`(${searchQuery})`, 'gi');
      parts = text.split(regex);
    }
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === searchQuery.toLowerCase()) {
        return (
          <span 
            key={index} 
            className={`px-1 rounded ${
              isCurrentResult 
                ? "bg-[#5865f2] text-white" 
                : "bg-[#5865f2]/20 text-[#dbdee1]"
            }`}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

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

  // Add scroll event listener
  useEffect(() => {
    const messageContainer = messageContainerRef.current;
    if (messageContainer) {
      messageContainer.addEventListener('scroll', handleScroll);
      return () => messageContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Update initial load effect
  useEffect(() => {
    if (socketConnection && userId) {
      setIsLoading(false);
      setLoadError(null);
      
      socketConnection.emit("message-page", userId);
      
      // Initial scroll to bottom with no animation
      setTimeout(() => {
        scrollToBottom('auto');
        // Show scroll button initially
        handleScroll();
      }, 100);
    }
  }, [userId, socketConnection]);

  useEffect(() => {
    if (socketConnection) {
      // Clean up previous listeners first
      const cleanupListeners = () => {
        socketConnection.off("message-user");
        socketConnection.off("message");
        socketConnection.off("new_message");
        socketConnection.off("error");
        socketConnection.off("message_status_update");
        socketConnection.off("messages_seen_batch");
        socketConnection.off('block_success');
        socketConnection.off('unblock_success');
      };

      cleanupListeners();

      // Remove delete-related socket handlers
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

            setAllMessage(data.messages);
            setCurrentConversation(data.conversationId);

            // Mark messages as seen in batch
            const unseenMessages = data.messages.filter(msg => 
              msg.msgByUserId !== user?._id && !msg.seen
            );

            if (unseenMessages.length > 0 && socketConnection && data.conversationId) {
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

      // Keep other existing socket handlers
      socketConnection.on("message-user", (data) => {
        if (data.user._id === userId) {
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

      // Scroll to bottom smoothly after sending
      requestAnimationFrame(() => {
        scrollToBottom('smooth');
        setShowScrollBottom(false);
      });
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

  // Add this component for the date header
  const DateHeader = ({ date }) => (
    <div className="flex justify-center my-4">
      <div className="bg-[#202c33] text-[#8696a0] text-xs px-4 py-2 rounded-lg">
        {date}
      </div>
    </div>
  );

  // Update search effect to be more stable and handle message updates properly
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = allMessage.reduce((matches, msg, index) => {
        if (msg.text && !msg.deleted) {
          const messageText = msg.text.toLowerCase();
          const searchTerm = searchQuery.toLowerCase();
          
          let isMatch = false;
          if (exactWordMatch) {
            const regex = new RegExp(`\\b${searchTerm}\\b`, 'gi');
            isMatch = regex.test(messageText);
          } else {
            isMatch = messageText.includes(searchTerm);
          }

          if (isMatch) {
            matches.push(index);
          }
        }
        return matches;
      }, []);
      
      setSearchResults(results);
      
      // Only scroll to first result when search query changes, not on message updates
      if (results.length > 0 && currentSearchIndex === -1) {
        setCurrentSearchIndex(0);
        requestAnimationFrame(() => {
          scrollToMessage(0);
        });
      } else if (results.length === 0) {
        setCurrentSearchIndex(-1);
      }
    } else {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
    }
  }, [searchQuery, exactWordMatch]); // Remove allMessage dependency to prevent re-search on updates

  // Add separate effect to handle message updates
  useEffect(() => {
    if (searchQuery.trim() && searchResults.length > 0) {
      const newResults = searchResults.filter(index => {
        const msg = allMessage[index];
        return msg && msg.text && !msg.deleted && (
          exactWordMatch 
            ? new RegExp(`\\b${searchQuery.toLowerCase()}\\b`, 'gi').test(msg.text.toLowerCase())
            : msg.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });

      if (newResults.length !== searchResults.length) {
        setSearchResults(newResults);
        if (newResults.length === 0) {
          setCurrentSearchIndex(-1);
        } else if (currentSearchIndex >= newResults.length) {
          setCurrentSearchIndex(newResults.length - 1);
          scrollToMessage(newResults.length - 1);
        }
      }
    }
  }, [allMessage]);

  // Update scrollToMessage function to be more reliable
  const scrollToMessage = (index) => {
    const messageContainer = document.querySelector('.scrollbar-messages');
    const messageElements = document.querySelectorAll('.message-item');
    const targetMessage = messageElements[searchResults[index]];
    
    if (targetMessage && messageContainer) {
      // Calculate scroll position to center the message
      const containerHeight = messageContainer.clientHeight;
      const messageTop = targetMessage.offsetTop;
      const messageHeight = targetMessage.clientHeight;
      const scrollPosition = messageTop - (containerHeight / 2) + (messageHeight / 2);
      
      messageContainer.scrollTo({
        top: scrollPosition,
        behavior: 'auto'
      });

      // Apply highlight effect
      const currentHighlight = document.querySelector('.current-search-highlight');
      if (currentHighlight) {
        currentHighlight.classList.remove('current-search-highlight');
      }
      
      targetMessage.classList.add('current-search-highlight');
    }
  };

  // Update navigation functions to be more reliable
  const handleNextSearch = () => {
    if (searchResults.length > 0) {
      const nextIndex = (currentSearchIndex + 1) % searchResults.length;
      setCurrentSearchIndex(nextIndex);
      requestAnimationFrame(() => {
        scrollToMessage(nextIndex);
      });
    }
  };

  const handlePreviousSearch = () => {
    if (searchResults.length > 0) {
      const prevIndex = currentSearchIndex <= 0 ? searchResults.length - 1 : currentSearchIndex - 1;
      setCurrentSearchIndex(prevIndex);
      requestAnimationFrame(() => {
        scrollToMessage(prevIndex);
      });
    }
  };

  // Update keyboard shortcuts
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

  // Update search close handler to just clear states
  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
    setCurrentSearchIndex(-1);
  };

  // Update message rendering to remove edit button
  const MessageContent = ({ msg }) => {
    return (
      <div className={`relative ${
        msg.imageUrl || msg.videoUrl ? "max-w-[420px] w-full" : "max-w-full"
      } ${
        user?._id === msg.msgByUserId
          ? "bg-[#36393f] hover:bg-[#3c3f45]"
          : "bg-[#2b2d31] hover:bg-[#313338]"
      } rounded-2xl ${
        user?._id === msg.msgByUserId 
          ? "rounded-tr-md" 
          : "rounded-tl-md"
      } shadow-sm transition-colors duration-200`}>
        <div className="flex flex-col w-full overflow-hidden">
          {msg.imageUrl && (
            <div className="relative w-full">
              <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={msg.imageUrl}
                  className="w-full h-auto rounded-t-2xl object-cover max-h-[300px]"
                  alt=""
                />
              </a>
            </div>
          )}
          {msg.videoUrl && (
            <div className="relative w-full">
              <video
                controls
                className="w-full h-auto rounded-t-2xl" 
                src={msg.videoUrl}
              />
            </div>
          )}
          
          <div className={`${
            msg.imageUrl || msg.videoUrl 
              ? 'p-2 pt-1.5' 
              : 'px-3 py-2'
          }`}>
            <div className="flex flex-col">
              {msg.text && (
                <div className="flex items-end gap-1.5">
                  <p className="text-[15px] text-[#dbdee1] leading-[21px] tracking-[0.2px] whitespace-pre-wrap break-words flex-1 min-w-0">
                    {msg.text ? highlightText(msg.text, msg) : msg.text}
                  </p>
                  <div className="flex items-center gap-0.5 flex-shrink-0 mb-[1px] ml-1">
                    <span className="text-[11px] text-[#949ba4] min-w-[42px] text-right">
                      {moment(msg.sentAt || msg.createdAt).format("h:mm A")}
                    </span>
                    {user?._id === msg.msgByUserId && (
                      <div className="text-[#949ba4] ml-0.5">
                        {messageStatuses[msg._id] === 'sent' && (
                          <BsCheck className="w-[15px] h-[15px]" title="Sent" />
                        )}
                        {messageStatuses[msg._id] === 'delivered' && (
                          <BsCheckAll 
                            className="w-[15px] h-[15px]" 
                            title={`Delivered ${msg.deliveredAt ? moment(msg.deliveredAt).format('MMM D, h:mm A') : ''}`}
                          />
                        )}
                        {messageStatuses[msg._id] === 'seen' && (
                          <BsCheckAll 
                            className="w-[15px] h-[15px] text-[#949cf7]" 
                            title={`Seen ${msg.seenAt ? moment(msg.seenAt).format('MMM D, h:mm A') : ''}`}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Update the scrollToBottom function for smoother behavior
  const scrollToBottom = (behavior = 'smooth') => {
    if (messageContainerRef.current) {
      const { scrollHeight, clientHeight } = messageContainerRef.current;
      messageContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior,
        // Add a small offset to ensure the message is fully visible
        offset: 20
      });
    }
  };

  // Update scroll detection for better arrow button behavior
  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setShowScrollBottom(distanceFromBottom > 50); // Show button when not at bottom
    }
  };

  // Update the effect for new messages
  useEffect(() => {
    if (messageContainerRef.current && allMessage.length > 0 && !showSearch) {
      const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      // Auto-scroll if user is near bottom (100px threshold) or if the new message is from the current user
      const lastMessage = allMessage[allMessage.length - 1];
      const isFromCurrentUser = lastMessage?.msgByUserId === user?._id;
      
      if (distanceFromBottom < 100 || isFromCurrentUser) {
        requestAnimationFrame(() => {
          scrollToBottom('smooth');
          setShowScrollBottom(false);
        });
      } else {
        // Show scroll button if we're not scrolling automatically
        setShowScrollBottom(true);
      }
    }
  }, [allMessage, showSearch]);

  return (
    <div className="relative chat-background">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      >
        <div className="absolute inset-0 bg-[#222222] bg-opacity-30 backdrop-blur-sm"></div>
      </div>
      <div className="relative flex flex-col h-screen">
        <header className="sticky top-0 bg-[#313338] text-white z-10 h-[48px] border-b border-[#1e1f22] flex items-center">
          {!showSearch ? (
            <>
              <div className="flex-1 flex items-center min-w-0 h-full px-4">
                <Link className="lg:hidden mr-2 p-2 hover:bg-[#404249] rounded-full transition-colors" to={"/"}>
                  <FaAngleLeft className="text-[#b5bac1] text-xl" />
                </Link>
                {isLoading ? (
                  <div className="animate-pulse flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#404249] rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-[#404249] rounded"></div>
                      <div className="h-3 w-16 bg-[#404249] rounded mt-2"></div>
                    </div>
                  </div>
                ) : loadError ? (
                  <div className="text-red-400">{loadError}</div>
                ) : (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <Avatar
                        width={32}
                        height={32}
                        imageUrl={dataUser?.profile_pic}
                        name={dataUser?.name}
                        userId={dataUser?._id}
                      />
                      {Array.isArray(onlineUsers) && onlineUsers.includes(dataUser?._id) && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-[13px] h-[13px] bg-[#313338] rounded-full flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-[#23a559] rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[16px] text-[#f3f4f5] truncate">
                        {dataUser?.name}
                      </h3>
                      <p className="text-[12px] font-medium">
                        {Array.isArray(onlineUsers) && onlineUsers.includes(dataUser?._id) ? (
                          <span className="text-[#a1a3a6]">Online</span>
                        ) : (
                          <span className="text-[#a1a3a6]">Offline</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center h-full px-4 gap-1">
                <button 
                  onClick={() => setShowSearch(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#404249] transition-colors"
                  title="Search"
                >
                  <FaSearch className="text-[#b5bac1] text-lg" />
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#404249] transition-colors"
                    title="More"
                  >
                    <HiDotsVertical className="text-[#b5bac1] text-xl" />
                  </button>
                  
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#313338] rounded-md shadow-lg border border-[#1e1f22] overflow-hidden z-50">
                      {isBlocked ? (
                        <button
                          onClick={handleUnblockUser}
                          className="flex items-center w-full px-3 py-2 text-[14px] text-[#dbdee1] hover:bg-[#404249] transition-colors"
                        >
                          <FaUnlock className="mr-2 text-[#dbdee1]" />
                          Unblock User
                        </button>
                      ) : (
                        <button
                          onClick={handleBlockUser}
                          className="flex items-center w-full px-3 py-2 text-[14px] text-[#f23f42] hover:bg-[#404249] transition-colors"
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
            <div className="flex items-center w-full h-full px-2 gap-2">
              <button 
                onClick={handleCloseSearch}
                className="p-2 hover:bg-[#404249] rounded-full transition-colors"
              >
                <FaTimes className="text-[#b5bac1]" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in chat..."
                  className="w-full bg-[#1e1f22] text-[#dbdee1] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5865f2] placeholder-[#949ba4]"
                  autoFocus
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={exactWordMatch}
                      onChange={(e) => setExactWordMatch(e.target.checked)}
                      className="form-checkbox h-3 w-3 text-[#5865f2] rounded border-[#72767d] focus:ring-0"
                    />
                    <span className="text-[#b5bac1] text-xs">Match words</span>
                  </label>
                  {searchResults.length > 0 && (
                    <>
                      <span className="text-xs text-[#b5bac1] border-l border-[#4f545c] pl-4">
                        {currentSearchIndex + 1}/{searchResults.length}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button 
                onClick={handlePreviousSearch}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#404249] transition-colors disabled:opacity-50"
                disabled={searchResults.length === 0}
                title="Previous (Shift + Enter)"
              >
                <FaArrowUp className="text-[#b5bac1]" />
              </button>
              <button 
                onClick={handleNextSearch}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#404249] transition-colors disabled:opacity-50"
                disabled={searchResults.length === 0}
                title="Next (Enter)"
              >
                <FaArrowDown className="text-[#b5bac1]" />
              </button>
            </div>
          )}
        </header>

        {isBlocked && (
          <div className="bg-red-500 bg-opacity-10 text-red-400 text-center py-2 px-4 border-b border-red-500 border-opacity-20">
            You have blocked this user. They can still send messages, but you won't see them.
          </div>
        )}

        <section 
          ref={messageContainerRef}
          className={`${getMessageSectionHeight()} overflow-x-hidden overflow-y-scroll scrollbar-messages flex-grow relative`}
        >
          {loadError ? (
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
                    
                    const shouldShowAvatar = (index) => {
                      // Show avatar if:
                      // 1. First message
                      // 2. Previous message was from different user
                      // 3. Time difference between messages is more than 10 minutes
                      // 4. Different day from previous message
                      if (index === 0) return true;
                      const prevMsg = allMessage[index - 1];
                      const currentMsg = allMessage[index];
                      
                      const timeDiff = moment(currentMsg.sentAt || currentMsg.createdAt).diff(
                        moment(prevMsg.sentAt || prevMsg.createdAt),
                        'minutes'
                      );
                      
                      const isSameDay = moment(currentMsg.sentAt || currentMsg.createdAt).isSame(
                        moment(prevMsg.sentAt || prevMsg.createdAt),
                        'day'
                      );
                      
                      return prevMsg.msgByUserId !== currentMsg.msgByUserId || 
                             timeDiff > 10 || 
                             !isSameDay;
                    };

                    groups.push(
                      <div
                        key={msg._id || index}
                        className={`message-item flex items-start gap-2 px-3 group mb-[2px] ${
                          user?._id === msg.msgByUserId ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        {/* Avatar container with fixed width for alignment */}
                        <div className="w-8 flex-shrink-0">
                          {shouldShowAvatar(index) && (
                            <Avatar
                              width={32}
                              height={32}
                              imageUrl={user?._id === msg.msgByUserId ? user?.profile_pic : dataUser?.profile_pic}
                              name={user?._id === msg.msgByUserId ? user?.name : dataUser?.name}
                              userId={user?._id === msg.msgByUserId ? user?._id : dataUser?._id}
                            />
                          )}
                        </div>

                        <div className={`flex flex-col ${
                          user?._id === msg.msgByUserId ? "items-end" : "items-start"
                        } max-w-[90%] sm:max-w-[75%] lg:max-w-[65%]`}>
                          {/* Show name for first message in sequence */}
                          {shouldShowAvatar(index) && user?._id !== msg.msgByUserId && (
                            <span className="text-[13px] text-[#949cf7] font-medium ml-0.5 mb-0.5">
                              {dataUser?.name}
                            </span>
                          )}
                          
                          <div
                            className={`relative inline-block ${
                              msg.imageUrl || msg.videoUrl ? "max-w-[280px] sm:max-w-[420px] w-full" : "max-w-full"
                            } ${
                              msg.deleted 
                                ? "bg-gray-700/50" 
                                : user?._id === msg.msgByUserId
                                  ? "bg-[#36393f] hover:bg-[#3c3f45]"
                                  : "bg-[#2b2d31] hover:bg-[#313338]"
                            } rounded-2xl ${
                              user?._id === msg.msgByUserId 
                                ? "rounded-tr-md" 
                                : "rounded-tl-md"
                            } shadow-sm transition-colors duration-200`}
                          >
                            <div className="flex flex-col overflow-hidden break-words">
                              {/* Media content */}
                              {msg.imageUrl && (
                                <div className="relative w-full">
                                  <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                                    <img
                                      src={msg.imageUrl}
                                      className="w-full h-auto rounded-t-2xl object-cover max-h-[300px]"
                                      alt=""
                                    />
                                  </a>
                                </div>
                              )}
                              {msg.videoUrl && (
                                <div className="relative w-full">
                                  <video
                                    controls
                                    className="w-full h-auto rounded-t-2xl" 
                                    src={msg.videoUrl}
                                  />
                                </div>
                              )}
                              
                              {/* Text content */}
                              <div className={`${
                                msg.imageUrl || msg.videoUrl 
                                  ? 'p-2 pt-1.5' 
                                  : 'px-3 py-2'
                              }`}>
                                <div className="flex flex-col">
                                  {msg.text && (
                                    <div className="flex flex-col sm:flex-row sm:items-end gap-1">
                                      <p className="text-[15px] text-[#dbdee1] leading-[21px] tracking-[0.2px] whitespace-pre-wrap break-words min-w-0 overflow-hidden">
                                        {msg.text ? highlightText(msg.text, msg) : msg.text}
                                      </p>
                                      <div className="flex items-center gap-0.5 flex-shrink-0 self-end mt-1 sm:mt-0 sm:ml-1">
                                        <span className="text-[11px] text-[#949ba4] min-w-[42px] text-right">
                                          {moment(msg.sentAt || msg.createdAt).format("h:mm A")}
                                        </span>
                                        {user?._id === msg.msgByUserId && (
                                          <div className="text-[#949ba4] ml-0.5">
                                            {messageStatuses[msg._id] === 'sent' && (
                                              <BsCheck className="w-[15px] h-[15px]" title="Sent" />
                                            )}
                                            {messageStatuses[msg._id] === 'delivered' && (
                                              <BsCheckAll 
                                                className="w-[15px] h-[15px]" 
                                                title={`Delivered ${msg.deliveredAt ? moment(msg.deliveredAt).format('MMM D, h:mm A') : ''}`}
                                              />
                                            )}
                                            {messageStatuses[msg._id] === 'seen' && (
                                              <BsCheckAll 
                                                className="w-[15px] h-[15px] text-[#949cf7]" 
                                                title={`Seen ${msg.seenAt ? moment(msg.seenAt).format('MMM D, h:mm A') : ''}`}
                                              />
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                    
                    return groups;
                  }, [])}
                  <div ref={messagesEndRef} /> {/* Add this at the end of messages */}
                </>
              ) : (
                <div className="text-center text-gray-400 py-4">
                  {isBlocked ? 'Messages are hidden while this user is blocked.' : 'No messages yet. Start a conversation!'}
                </div>
              )}
            </div>
          )}

          {message?.imageUrl && (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="relative max-w-4xl w-full">
                <div className="absolute -top-12 right-0 flex items-center gap-2">
                  <button
                    onClick={handleImageClosePreview}
                    className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    Close
                    <IoClose size={20} className="inline-block ml-2" />
                  </button>
                </div>
                <div className="bg-[#313338] rounded-lg overflow-hidden shadow-2xl">
                  <div className="relative group">
                    <img
                      src={message?.imageUrl}
                      alt="Preview"
                      className="w-full h-auto object-contain max-h-[70vh]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-4 border-t border-[#3f4147]">
                    <form className="flex items-center gap-4" onSubmit={handleSendMessage}>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Add a caption..."
                          value={message.text}
                          onChange={handleOnChange}
                          className="w-full py-2.5 px-4 bg-[#383a40] text-[#dbdee1] placeholder-[#949ba4] rounded-md outline-none focus:ring-2 focus:ring-[#23a559]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#23a559] hover:bg-[#1e9150] text-white font-medium rounded-md transition-colors flex items-center gap-2"
                      >
                        Send
                        <IoMdSend size={18} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
          {message?.videoUrl && (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="relative max-w-4xl w-full">
                <div className="absolute -top-12 right-0 flex items-center gap-2">
                  <button
                    onClick={handleVideoClosePreview}
                    className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    Close
                    <IoClose size={20} className="inline-block ml-2" />
                  </button>
                </div>
                <div className="bg-[#313338] rounded-lg overflow-hidden shadow-2xl">
                  <div className="relative">
                    <video
                      src={message?.videoUrl}
                      className="w-full h-auto max-h-[70vh]"
                      controls
                      autoPlay
                      muted
                    />
                  </div>
                  <div className="p-4 border-t border-[#3f4147]">
                    <form className="flex items-center gap-4" onSubmit={handleSendMessage}>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Add a caption..."
                          value={message.text}
                          onChange={handleOnChange}
                          className="w-full py-2.5 px-4 bg-[#383a40] text-[#dbdee1] placeholder-[#949ba4] rounded-md outline-none focus:ring-2 focus:ring-[#23a559]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#23a559] hover:bg-[#1e9150] text-white font-medium rounded-md transition-colors flex items-center gap-2"
                      >
                        Send
                        <IoMdSend size={18} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add scroll to bottom button */}
          {showScrollBottom && (
            <button
              onClick={() => scrollToBottom('smooth')}
              className="fixed bottom-20 right-6 w-11 h-11 bg-[#23a559] hover:bg-[#1e9150] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 transform hover:scale-105 z-10 animate-fade-in"
              title="Scroll to bottom"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>
          )}
        </section>

        <section className="h-16 bg-[#313338] flex items-center px-4">
          <div className="relative flex-shrink-0">
            <button
              onClick={handleOpenVideoImage}
              className={`flex justify-center items-center w-9 h-9 rounded-full ${
                isBlocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#404249] text-[#b5bac1] hover:text-[#dbdee1]'
              }`}
              disabled={isBlocked}
              title="Attach a file"
            >
              <FaCirclePlus size={20} />
            </button>
            {openImageVideoUpload && !isBlocked && (
              <div className="absolute bottom-full mb-2 left-0 bg-[#313338] rounded-lg shadow-xl border border-[#3f4147] w-48 p-1 z-10">
                <form className="flex flex-col">
                  <label
                    htmlFor="image"
                    className="flex items-center gap-3 px-2 py-2 hover:bg-[#404249] rounded cursor-pointer text-[#b5bac1] hover:text-[#dbdee1]"
                  >
                    <FaImage size={20} />
                    <span>Upload Image</span>
                  </label>
                  <label
                    htmlFor="video"
                    className="flex items-center gap-3 px-2 py-2 hover:bg-[#404249] rounded cursor-pointer text-[#b5bac1] hover:text-[#dbdee1]"
                  >
                    <FaVideo size={20} />
                    <span>Upload Video</span>
                  </label>
                  <input
                    type="file"
                    id="image"
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                  />
                  <input
                    type="file"
                    id="video"
                    onChange={handleVideoUpload}
                    className="hidden"
                    accept="video/*"
                  />
                </form>
              </div>
            )}
          </div>

          <form className="flex-1 flex items-center gap-4 mx-4" onSubmit={handleSendMessage}>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={isBlocked ? "You cannot send messages while blocked" : "Message..."}
                className={`w-full py-2.5 px-4 bg-[#383a40] text-[#dbdee1] placeholder-[#949ba4] rounded-md outline-none ${
                  isBlocked ? 'opacity-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-[#23a559]'
                }`}
                value={message?.text}
                onChange={handleOnChange}
                disabled={isBlocked}
              />
            </div>
            <button 
              type="submit"
              className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${
                isBlocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#404249] text-[#b5bac1] hover:text-[#dbdee1]'
              }`}
              disabled={isBlocked}
              title="Send message"
            >
              <IoMdSend size={22} />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default MessPage;