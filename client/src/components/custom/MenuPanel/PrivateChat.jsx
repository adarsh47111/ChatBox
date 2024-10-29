import { Input } from "@/components/ui/input";
import { Search, ArchiveRestore, Plus, EllipsisVertical } from "lucide-react";
import { Separator } from "../../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import FriendsDialogBox from "../FriendsDialogBox";
import { useDispatch, useSelector } from "react-redux";
import { SelectConversation, UnSelectConversation } from "@/redux/slices/app";
import { getCurrentTimeIn12HourFormat } from "@/utils/getCurrentTimeIn12HourFormat";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArchiveConversation,
  DeleteConversation,
  PinConversation,
  ResetCurrentMessages,
} from "@/redux/slices/conversation";
import { clearHistory, deleteConversation } from "@/utils/api";

const PrivateChat = () => {
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <>
      <div className="flex flex-col border h-screen w-1/4">
        <TopSection {...{ setSearchTerm, setArchiveOpen }} />
        <Separator className="w-[90%] mx-auto" />
        <ScrollArea className="flex-1 py-3">
          {archiveOpen ? (
            <ArchiveSection />
          ) : (
            <>
              <PinnedSection />
              <AllChats {...{ searchTerm }} />
            </>
          )}
        </ScrollArea>
      </div>
    </>
  );
};

export default PrivateChat;

const TopSection = ({ setSearchTerm, setArchiveOpen }) => {
  return (
    <>
      <div className="p-4 space-y-5">
        <div className="flex justify-between">
          <h1 className="text-3xl">Chats</h1>
          <div className="flex justify-center items-center h-8 w-8 rounded-full bg-muted-foreground opacity-20 cursor-pointer">
            <FriendsDialogBox>
              <Plus />
            </FriendsDialogBox>
          </div>
        </div>
        <div className="flex items-center px-4 space-x-1 bg-background border rounded-md">
          <Search />
          <input
            type="text"
            className="p-2 w-full bg-transparent outline-none"
            placeholder="Search"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-4 ">
          <div onClick={() => setArchiveOpen((n) => !n)}>
            <ArchiveRestore className="cursor-pointer" size={20} />
          </div>
          <span className="text-sm">Archived</span>
        </div>
      </div>
    </>
  );
};

const ArchiveSection = () => {
  const { all_conversations } = useSelector(
    (state) => state.conversations.private_chat
  );

  return (
    <>
      <div className="px-4">
        <p className="my-5">Archive</p>
        {all_conversations.map((ele) =>
          ele.archived === true ? <ChatCard key={ele.room_id} {...ele} /> : null
        )}
      </div>
    </>
  );
};

const PinnedSection = () => {
  const [pinnedConversation, setPinnedConversation] = useState([]);
  const { all_conversations } = useSelector(
    (state) => state.conversations.private_chat
  );

  useEffect(() => {
    if (all_conversations) {
      setPinnedConversation(all_conversations.filter((ele) => ele.pinned));
    }
  }, [all_conversations]);
  return (
    <>
      <div className="px-4">
        {pinnedConversation.length !== 0 ? (
          <p className="my-5">Pinned</p>
        ) : null}
        {pinnedConversation.map((ele) => (
          <ChatCard key={ele.room_id} {...ele} />
        ))}
      </div>
    </>
  );
};

const AllChats = ({ searchTerm }) => {
  let { all_conversations } = useSelector(
    (state) => state.conversations.private_chat
  );

  if (searchTerm !== "")
    all_conversations = all_conversations.filter((conversation) => 
      conversation.name.toLowerCase().startsWith(searchTerm.toLowerCase())
    );

  return (
    <>
      <div className="px-4">
        <p className="my-5">All Chats</p>
        {all_conversations?.map((ele) =>
          ele.pinned === false && ele.archived === false ? (
            <ChatCard key={ele.room_id} {...ele} />
          ) : null
        )}
      </div>
    </>
  );
};

const ChatCard = ({
  name,
  avatar,
  unRead,
  room_id,
  latest_message,
  pinned,
  archived,
}) => {
  const { current_conversation } = useSelector((state) => state.conversations);
  const dispatch = useDispatch();

  //TODO: modify it for different types of messages
  return (
    <>
      <div
        className={`${
          current_conversation?.room_id === room_id
            ? "bg-primary"
            : "bg-messageCard "
        } flex items-center space-x-3 pl-4 my-3 h-20 rounded-md cursor-pointer`}
        onClick={() => {
          dispatch(
            SelectConversation({ chat_type: "PRIVATE_CHAT", room_id: room_id })
          );
        }}
      >
        <Avatar>
          <AvatarImage src={avatar} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex justify-between h-[60%] w-full">
          <div
            className={`flex flex-col w-[70%] text-sm ${
              latest_message ? "justify-between" : "justify-center"
            }`}
          >
            <p className="text-base font-semibold">{name}</p>
            {(() => {
              if (latest_message?.deleted) {
                return (
                  <p className="text-sm italic">This message is deleted</p>
                );
              } else if (!latest_message?.deleted) {
                switch (latest_message?.type) {
                  case "Text":
                    return (
                      <p className="text-sm italic">{latest_message?.text}</p>
                    );
                  case "Image":
                    return <p className="text-sm italic">Image</p>;
                  case "Document":
                    return <p className="text-sm italic">Document</p>;
                  case "Link":
                    return <p className="text-sm italic">Link</p>;
                }
              }
            })()}
          </div>

          {latest_message ? (
            <div className=" text-xs flex flex-col justify-between items-center py-1">
              <p>
                {latest_message?.time
                  ? getCurrentTimeIn12HourFormat(latest_message?.time)
                  : ""}
              </p>
              {unRead !== 0 ? (
                <p className="bg-primary text-white h-4 w-4 rounded-full text-xs text-center">
                  {unRead}
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="flex items-start">
            <DropdownMenuCustom
              room_id={room_id}
              pinned={pinned}
              archived={archived}
            >
              <EllipsisVertical className="w-5" size={16} />
            </DropdownMenuCustom>
          </div>
        </div>
      </div>
    </>
  );
};

const DropdownMenuCustom = ({
  children,
  room_id,
  room_type = "PRIVATE_CHAT",
  pinned,
  archived,
}) => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  const handlePin = (e) => {
    e.stopPropagation();
    dispatch(PinConversation({ room_id, room_type, pinStatus: !pinned }));
  };

  const handleArchive = (e) => {
    e.stopPropagation();
    dispatch(
      ArchiveConversation({
        room_id,
        room_type,
        archiveStatus: !archived,
      })
    );
  };

  const handleCloseChat = (e) => {
    e.stopPropagation();
    dispatch(UnSelectConversation());
  };

  const handleClearHistory = async (e) => {
    e.stopPropagation();
    const { status } = await clearHistory(token, room_type, room_id);
    if (status === "success") dispatch(ResetCurrentMessages());
  };

  const handleDeleteConversation = async (e) => {
    e.stopPropagation();
    const { status } = await deleteConversation(token, room_type, room_id);
    if (status === "success")
      dispatch(DeleteConversation({ room_id, room_type }));
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
          {archived ? null : (
            <DropdownMenuItem onClick={handlePin}>
              {pinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handleArchive}>
            {archived ? "Unarchive" : "Archive"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleClearHistory}>
            Clear Chat
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDeleteConversation}>
            Delete Chat
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCloseChat}>
            Close Chat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
