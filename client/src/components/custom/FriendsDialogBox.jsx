import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FetchUsers,
  SelectConversation,
} from "@/redux/slices/app";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { socket } from "@/socket";
import { getPrivateConversation } from "@/utils/api";
import {
  AddPrivateConversation,
  UpdatePrivateConversation,
} from "../../redux/slices/conversation";
import {
  CircleX,
  Handshake,
  MessageSquareText,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";
import ToolTipCustom from "./ToolTipCustom";

const FriendsDialogBox = ({ children }) => {
  const [selectedTab, setSelectedTab] = useState(1);

  return (
    <div>
      <Dialog>
        <DialogTrigger className="flex justify-center items-center">
          {children}
        </DialogTrigger>
        <DialogContent
          showCloseButton={false}
          className=" flex flex-col w-96 h-[30rem]"
        >
          <TabMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
          {(() => {
            switch (selectedTab) {
              case 1:
                return <ExploreTab />;
              case 2:
                return <FriendsTab />;
              case 3:
                return <FriendsRequestTab />;
            }
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FriendsDialogBox;

const TabMenu = ({ selectedTab, setSelectedTab }) => {
  const Tabs = [
    { index: 1, name: "Explore" },
    { index: 2, name: "Friends" },
    { index: 3, name: "Requests" },
  ];
  return (
    <>
      <div className="flex justify-between h-8 px-4 w-full">
        {Tabs.map((tab) => (
          <div
            key={tab.index}
            className={`cursor-pointer ${
              selectedTab === tab.index ? "border-b border-primary" : ""
            }`}
            onClick={() => setSelectedTab(tab.index)}
          >
            <span className="text-sm text-muted-foreground">{tab.name}</span>
          </div>
        ))}
      </div>
    </>
  );
};

const ExploreTab = () => {
  const dispatch = useDispatch();
  const { all_users } = useSelector((state) => state.app);
  const { user_id } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(FetchUsers());
  }, []);

  const handleSendRequest = (other_user_id) => {
    socket?.emit("friend_request", {
      sender: user_id,
      recipient: other_user_id,
    });
  };

  return (
    <>
      <div className="flex-1">
        {all_users?.map((u) => (
          <div
            key={u._id}
            className="flex justify-between p-3 hover:bg-messageCard rounded-lg"
          >
            <div className="flex justify-center items-center space-x-4">
              <Avatar>
                <AvatarImage src={u.avatar} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span>{u.username}</span>
            </div>
            <div
              className="flex items-center"
              onClick={() => handleSendRequest(u._id)}
            >
              <ToolTipCustom HoverName="Send Friend Request">
                <Handshake />
              </ToolTipCustom>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const FriendsTab = () => {
  const dispatch = useDispatch();
  const { friendsList } = useSelector((state) => state.app);
  const { user_id, token } = useSelector((state) => state.auth);
  const { all_conversations } = useSelector(
    (state) => state.conversations.private_chat
  );

  const handleStartConversation = async (other_user_id) => {
    const { status, message, data } = await getPrivateConversation(
      token,
      other_user_id
    );

    if (status === "error") {
      toast(message);
      return;
    }

    // find if data exists in conversation.private_chat.conversations
    // let existing_conversation = false;
    let existing_conversation = all_conversations.find(
      (el) => el?.room_id === data._id
    );

    if (existing_conversation) {
      // update to private_chat.conversations
      dispatch(UpdatePrivateConversation({ conversation: data }));
    } else {
      // add to private_chat.conversations
      dispatch(AddPrivateConversation({ conversation: data }));
    }
    dispatch(
      SelectConversation({ chat_type: "PRIVATE_CHAT", room_id: data._id })
    );
  };

  return (
    <>
      <div className="flex-1">
        {friendsList?.map((u) => (
          <div
            key={u._id}
            className="flex justify-between p-3 hover:bg-messageCard rounded-lg"
          >
            <div className="flex justify-center items-center space-x-4">
              <Avatar>
                <AvatarImage src={u.avatar} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span>{u.username}</span>
            </div>
            <div
              className="flex items-center"
              onClick={() => {
                handleStartConversation(u._id);
              }}
            >
              <ToolTipCustom HoverName="Start Chat">
                <MessageSquareText />
              </ToolTipCustom>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const FriendsRequestTab = () => {
  const dispatch = useDispatch();
  const { friendRequests } = useSelector((state) => state.app);
  const { user_id } = useSelector((state) => state.auth);

  const handelCancelRequest = (request_id) => {
    socket?.emit("cancel_friend_request", { request_id });
  };
  return (
    <>
      <div className="flex-1">
        {friendRequests?.map((request) =>
          request.sender._id === user_id ? (
            // is current_user is a sender of request
            <div
              key={request._id}
              className="flex justify-between p-3 hover:bg-messageCard rounded-lg"
            >
              <div className="flex justify-center items-center space-x-4">
                <Avatar>
                  <AvatarImage src={request.recipient.avatar} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <span>{request.recipient.username}</span>
              </div>
              <div
                className="flex items-center"
                onClick={() => handelCancelRequest(request._id)}
              >
                <ToolTipCustom HoverName="Cancel Request">
                  <CircleX strokeWidth={1.5} />
                </ToolTipCustom>
              </div>
            </div>
          ) : (
            // is current_user is a recipient of request
            <div
              key={request._id}
              className=" flex justify-between p-3 hover:bg-messageCard rounded-lg"
            >
              <div className="flex justify-center items-center space-x-4">
                <Avatar>
                  <AvatarImage src={request.sender.avatar} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <span>{request.sender.username}</span>
              </div>
              <div className="flex items-center space-x-8">
                <div
                  onClick={() => {
                    socket.emit("accept_request", { request_id: request._id });
                  }}
                >
                  <ToolTipCustom HoverName="Accept Request">
                    <UserRoundCheck strokeWidth={1.5} />
                  </ToolTipCustom>
                </div>
                <div
                  onClick={() => {
                    socket.emit("decline_request", { request_id: request._id });
                  }}
                >
                  <ToolTipCustom HoverName="Decline Request">
                    <UserRoundX strokeWidth={1.5} />
                  </ToolTipCustom>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
};
