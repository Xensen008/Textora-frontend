import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Avatar from "./Avatar";
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft } from "react-icons/fa6";

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

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit("message-page", userId);

      socketConnection.on("message-user", (data) => {
        setDataUser(data);
      });
    }
  }, [socketConnection, userId, user]);

  return (
    <div className="h-12 bg-gray-100 rounded-lg">
          <header className="sticky top-0  bg-[#d1d8cd]  rounded-b-lg">
            <div className="container mx-auto flex justify-between items-center p-2.5 rounded-lg">
              <div className="flex items-center gap-4 lg:ml-3"> {/* Adjusted margin here */}
                <Link className="lg:hidden" to={'/'}>
                    <FaAngleLeft size={25}/>
                </Link>
                <Avatar
                  width={50}
                  height={50}
                  imageUrl={dataUser?.profile_pic}
                  name={dataUser?.name}
                  userId={dataUser?._id}
                />
                <div>
                  <h3 className="font-semibold text-lg text-ellipsis line-clamp-1">{dataUser?.name}</h3>
                  <p className="text-sm font-semibold">
                    {dataUser?.online ? (
                      <span className="text-green-500">Online</span>
                    ) : (
                      <span className="text-gray-500">Offline</span>
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
          
        </div>
  );
}

export default MessPage;
