import React, { useEffect } from "react";
import MenuBar from "./components/custom/MenuBar";
import ChatBox from "./components/custom/ChatBox";
import ProfileTab from "./components/custom/ProfileTab";
import { useDispatch, useSelector } from "react-redux";
import StarredMessagesTab from "./components/custom/StarredMessagesTab";
import SharedTab from "./components/custom/SharedTab";
import { connectSocket, socket } from "./socket";
import { toast } from "sonner";
import NoChat from "./components/custom/NoChat";
import {
  AddNewMessage,
  UpdateUnreadCount,
  SetGroupConversations,
  SetPrivateConversations,
  UpdateLatestMessage,
  UpdateStatus,
  DeleteMessage,
  AddToParticipantList,
  RemoveFromParticipantList,
  AddAdmin,
  RemoveAdmin,
  UpdateFileMessage,
} from "./redux/slices/conversation";
import { getFriends } from "./utils/api";
import GroupChat from "./components/custom/MenuPanel/GroupChat";
import PrivateChat from "./components/custom/MenuPanel/PrivateChat";
import {
  AddFriendRequest,
  AddToFriendList,
  FetchFriendList,
  FetchFriendRequests,
  RemoveFriendRequest,
  RemoveFromUserList,
} from "./redux/slices/app";
import Settings from "./components/custom/MenuPanel/Settings";
import Profile from "./components/custom/Settings/Profile";
import ThemePage from "./components/custom/Settings/ThemePage";
import { persistor } from "./redux/store";
import { useNavigate } from "react-router-dom";

const App = () => {
  const { MenuPanel, ContactSidebar, chat_type, room_id, SettingsPage } =
    useSelector((state) => state.app);
  const { isLoggedIn, user_id, token } = useSelector((state) => state.auth);
  const { current_conversation } = useSelector(
    (state) => state.conversations.private_chat
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // useEffect(() => {
  //   const handleTabClose = (event) => {
  //     // Clear persisted state when the tab or browser closes
  //     persistor.purge();
  //   };

  //   window.addEventListener("beforeunload", handleTabClose);

  //   return () => {
  //     window.removeEventListener("beforeunload", handleTabClose);
  //   };
  // }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth/login");
    } else {
      // window.onload = function () {
      //   if (!window.location.hash) {
      //     window.location = window.location + "#loaded";
      //     window.location.reload();
      //   }
      // };

      // window.onload();

      (async () => {
        dispatch(SetPrivateConversations());
        dispatch(SetGroupConversations());
        dispatch(FetchFriendList());
        dispatch(FetchFriendRequests());
      })();

      if (!socket) connectSocket(user_id);

      socket.on("new_friend_request", ({ request, message }) => {
        dispatch(AddFriendRequest(request));
        toast("New friend request received");
      });

      socket.on(
        "friend_request_delivery_confirmation",
        ({ request, message }) => {
          dispatch(AddFriendRequest(request));
          dispatch(RemoveFromUserList(request.recipient._id));
        }
      );

      socket.on(
        "friend_request_cancel_confirmation",
        ({ request, message }) => {
          toast(message);
          dispatch(RemoveFriendRequest(request));
        }
      );

      socket.on("request_accepted", ({ request, message }) => {
        if (request.recipient._id === user_id) {
          toast("Friend Request Accepted");
          dispatch(AddToFriendList(request.sender));
        } else {
          toast(message);
          dispatch(AddToFriendList(request.recipient));
        }

        dispatch(RemoveFriendRequest(request));
      });

      socket.on("request_declined", ({ request, message }) => {
        if (request.recipient._id === user_id) toast("Friend Request Declined");
        else toast(message);

        dispatch(RemoveFriendRequest(request));
      });

      socket.on("new_message", (msg_doc) => {
        dispatch(AddNewMessage({ message_doc: msg_doc }));
        dispatch(UpdateLatestMessage({ message_doc: msg_doc }));
        dispatch(
          UpdateUnreadCount({
            messageRoomId:
              msg_doc.room_type === "PRIVATE_CHAT"
                ? msg_doc.PrivateRoom
                : msg_doc.GroupRoom,
            room_type: msg_doc.room_type,
          })
        );
      });

      socket.on("update_FileMessage", ({msg_id, url, saveStatus}) => {
        dispatch(UpdateFileMessage({ msg_id, url, saveStatus }));
      });

      socket.on("user_status", ({ user_id, isOnline }) => {
        dispatch(UpdateStatus({ user_id, isOnline }));
      });

      socket.on("message_deleted", ({ message_id }) => {
        dispatch(DeleteMessage({ message_id }));
      });

      socket.on("new_participantAddedToGroup", ({ user, room_id, msg }) => {
        dispatch(AddToParticipantList({ user, room_id, msg }));
      });

      socket.on("participantRemovedFromGroup", ({ user_id, room_id, msg }) => {
        dispatch(RemoveFromParticipantList({ user_id, room_id, msg }));
      });

      socket.on("adminAddedToGroup", ({ user_id, room_id, msg }) => {
        dispatch(AddAdmin({ user_id, room_id, msg }));
      });

      socket.on("adminRemovedFromGroup", ({ user_id, room_id, msg }) => {
        dispatch(RemoveAdmin({ user_id, room_id, msg }));
      });

      // socket.on("start_chat", (data) => {
      //   // data ==> conversation

      //   // find if data exists in conversation.private_chat.conversations
      //   const existing_conversation = conversations.find(
      //     (el) => el?.id === data._id
      //   );

      //   if (existing_conversation) {
      //     // update to private_chat.conversations
      //     dispatch(UpdateDirectConversation({ conversation: data }));
      //   } else {
      //     // add to private_chat.conversations
      //     dispatch(AddDirectConversation({ conversation: data }));
      //   }
      //   dispatch(
      //     SelectConversation({ chat_type: "Private", room_id: data._id })
      //   );
      // });
    }

    return () => {
      socket?.off("new_friend_request");
      socket?.off("friend_request_delivery_confirmation");
      socket?.off("friend_request_cancel_confirmation");
      socket?.off("request_accepted");
      socket?.off("request_declined");
      socket?.off("request_sent");
      socket?.off("start_chat");
      socket?.off("new_message");
      socket?.off("update_FileMessage");
      socket?.off("user_status");
      socket?.off("message_deleted");
      socket?.off("new_participantAddedToGroup");
      socket?.off("participantRemovedFromGroup");
      socket?.off("adminAddedToGroup");
      socket?.off("adminRemovedFromGroup");
    };
  }, [isLoggedIn, socket]);

  return (
    <div className="flex">
      <MenuBar />
      <div className="flex flex-1">
        {(() => {
          switch (MenuPanel.type) {
            case "PRIVATE_CHAT":
              return <PrivateChat />;
            case "GROUP_CHAT":
              return <GroupChat />;
            case "SETTINGS":
              return <Settings />;
          }
        })()}
        {(() => {
          if (chat_type !== null && room_id !== null) return <ChatBox />;
          else if (SettingsPage.open) {
            switch (SettingsPage.type) {
              case "PROFILE":
                return <Profile />;
              case "THEME":
                return <ThemePage />;
            }
          } else return <NoChat />;
        })()}
        {ContactSidebar.open &&
          (() => {
            switch (ContactSidebar.type) {
              case "CONTACT":
                return <ProfileTab />;
              case "STARRED":
                return <StarredMessagesTab />;
              case "SHARED":
                return <SharedTab />;
            }
          })()}
      </div>
    </div>
  );
};

export default App;
