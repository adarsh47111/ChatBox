import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CircleX } from "lucide-react";
import { Button } from "../ui/button";
import { getGroupConversation } from "@/utils/api";
import {
  AddGroupConversation,
  UpdateGroupConversation,
} from "@/redux/slices/conversation";
import { SelectConversation } from "@/redux/slices/app";

const GroupDialogBox = ({ children }) => {
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedData, setSearchedData] = useState([]);
  const [memberList, setMemberList] = useState([]);
  const { friendsList } = useSelector((state) => state.app);
  const { user_id, token } = useSelector((state) => state.auth);
  const { all_conversations } = useSelector(
    (state) => state.conversations.group_chat
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (searchTerm === "") {
      setSearchedData([]);
      return;
    }

    const filteredData = friendsList.filter((friend) => {
      return friend.username.toLowerCase().includes(searchTerm.toLowerCase());
    });

    setSearchedData(filteredData);
  }, [searchTerm]);

  const handleAddToMemberList = (member) => {
    // member is already in the list, don't add it
    if (memberList.some((ele) => ele._id === member._id)) return;
    setMemberList((prev) => [member, ...prev]);
  };

  const handleRemoveFromMemberList = (member) => {
    const new_list = memberList.filter((ele) => ele._id !== member._id);
    setMemberList(new_list);
  };

  const handleStartChat = async () => {
    const members_id = memberList.map((member) => member._id);
    const { status, message, data } = await getGroupConversation(token, {
      group_name: groupName,
      member_list: [user_id, ...members_id],
      admin: user_id,
      creator: user_id,
    });

    if (status === "error") {
      toast(message);
      return;
    }

    const existing_conversation = all_conversations.find(
      (ele) => ele.room_id === data._id
    );

    if (existing_conversation) {
      // update to private_chat.conversations
      dispatch(UpdateGroupConversation({ conversation: data }));
    } else {
      // add to private_chat.conversations
      dispatch(AddGroupConversation({ conversation: data }));
    }
    dispatch(
      SelectConversation({ chat_type: "GROUP_CHAT", room_id: data._id })
    );
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger className="flex justify-center items-center">
          {children}
        </DialogTrigger>
        <DialogContent
          showCloseButton={true}
          className=" flex flex-col w-96 h-[30rem]"
        >
          <p>Create New Group</p>
          <div className="relative space-y-4">
            <Input
              placeholder="Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <Input
              placeholder="Search a friend"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* search list  */}
            <div
              className={`${
                searchedData.length === 0 ? "invisible" : ""
              } border rounded-lg absolute h-56 w-full z-10`}
            >
              <ScrollArea className="h-56 w-full rounded-md p-4">
                {searchedData.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center rounded-lg space-x-5 px-5 py-3 cursor-pointer hover:bg-messageCard"
                    onClick={() => {
                      // handleOpenChatPage(user.room_id, user.is_group);
                      handleAddToMemberList(user);
                      setSearchedData([]);
                      setSearchTerm("");
                    }}
                  >
                    <img
                      className="h-12 w-12 rounded-full"
                      src={user.avatar}
                      alt="avatar"
                    />
                    <p className="text-white text-base">{user.username}</p>
                  </div>
                ))}
              </ScrollArea>
            </div>

            {/* member list */}
            <ScrollArea className="h-56 w-full rounded-md border p-4">
              <div
                className={`${
                  searchedData.length === 0 ? "" : "invisible"
                } flex flex-wrap space-x-2 rounded-lg`}
              >
                {memberList.map((user) => (
                  <div
                    key={user._id}
                    className="flex justify-between items-center space-x-3 rounded-lg border border-ring w-fit h-fit px-2 py-2 m-1"
                  >
                    <span>{user.username}</span>
                    <CircleX
                      className="cursor-pointer"
                      size={18}
                      strokeWidth={1.5}
                      onClick={() => handleRemoveFromMemberList(user)}
                    />
                  </div>
                ))}
              </div>
              {memberList.length === 0 && searchTerm === "" && (
                <div className="flex justify-center items-center h-44">
                  <span className=" text-muted">Members List </span>
                </div>
              )}
            </ScrollArea>
            <div className="flex justify-end">
              <Button className="text-sm" onClick={handleStartChat}>
                Create Group
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupDialogBox;
