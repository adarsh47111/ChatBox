import {
  CircleX,
  Video,
  Phone,
  ChevronRight,
  Star,
  Bell,
  Flag,
  Trash2,
  UserRoundPlus,
  UserRoundX,
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import PulseAnimation from "../../assets/PulseAnimation.svg";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useDispatch, useSelector } from "react-redux";
import {
  ToggleContactSidebar,
  UpdateContactSidebarType,
} from "../../redux/slices/app";
import { useEffect, useState } from "react";
import { getCommonGroups, getGroupInfo, getUserInfo } from "@/utils/api";
import { Button } from "../ui/button";
import ToolTipCustom from "./ToolTipCustom";
import { socket } from "@/socket";
import { toast } from "sonner";

const ProfileTab = () => {
  const { chat_type } = useSelector((state) => state.app);
  return (
    <div className="flex flex-col w-1/4 h-screen border">
      <Header />
      <ScrollArea className="flex-1 w-full rounded-md">
        <UserInfoSection />
        <MediaSection />
        <StarSection />
        <Separator className="w-[90%] mx-auto" />
        <Separator className="w-[90%] mx-auto" />
        {chat_type == "PRIVATE_CHAT" && <CommonGroupSection />}
        {chat_type == "GROUP_CHAT" && <GroupMembersSection />}
      </ScrollArea>
    </div>
  );
};

export default ProfileTab;

const Header = () => {
  const dispatch = useDispatch();

  return (
    <div className="flex border items-center px-5 space-x-5 h-20">
      <div onClick={() => dispatch(ToggleContactSidebar())}>
        <CircleX className="cursor-pointer" strokeWidth={1} />
      </div>
      <p className="text-muted-foreground">Contact Info</p>
    </div>
  );
};

const UserInfoSection = () => {
  const { token } = useSelector((state) => state.auth);
  const { other_user_id } = useSelector(
    (state) => state.conversations.current_conversation
  );
  const { chat_type, room_id } = useSelector((state) => state.app);

  const [info, setInfo] = useState({
    username: "NA",
    groupname: "NA",
    email: "NA",
    about: "NA",
    avatar: "",
  });

  useEffect(() => {
    if (chat_type === "GROUP_CHAT") {
      (async () => {
        const { status, data, message } = await getGroupInfo(token, room_id);
        if (status === "success")
          setInfo({
            groupname: data.name,
            avatar: data.avatar,
          });
      })();
    } else {
      (async () => {
        const { status, data, message } = await getUserInfo(
          token,
          other_user_id
        );
        if (status === "success")
          setInfo({
            username: data.username,
            email: data.email,
            avatar: data.avatar,
            about: data.about,
          });
      })();
    }
  }, []);

  return (
    <>
      <div>
        <div className="flex items-center px-6 space-x-8 h-28">
          <Avatar className="h-16 w-16">
            <AvatarImage src={info.avatar} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col font-medium space-y-1">
            <p>
              {chat_type === "PRIVATE_CHAT" ? info.username : info.groupname}
            </p>
            <p className=" text-sm">{info.email}</p>
          </div>
        </div>
        <Separator className="w-[90%] mx-auto" />
        {chat_type === "PRIVATE_CHAT" && (
          <>
            <div className="flex flex-col justify-center space-y-4 h-28 px-4">
              <p className="text-sm text-muted-foreground">About</p>
              <p className="font-medium">{info.about}</p>
            </div>
            <Separator className="w-[90%] mx-auto" />
          </>
        )}
      </div>
    </>
  );
};

const MediaSection = () => {
  const dispatch = useDispatch();
  const { current_messages } = useSelector((state) => state.conversations);

  // Filter out the first 3 images from the current_messages array and store them in a separate array.
  // to display in the media section
  const images = [];
  for (let i = 0; i < current_messages?.length; i++) {
    const { type } = current_messages[i];
    if (type === "Image") {
      images.push(current_messages[i]);
    }
    if (images.length === 3) {
      break; // Stop the loop once we reach the limit
    }
  }

  return (
    <>
      <div className="pb-4">
        <div
          className="p-4 flex justify-between cursor-pointer"
          onClick={() => dispatch(UpdateContactSidebarType("SHARED"))}
        >
          <p className="text-sm text-muted-foreground">Media, links and docs</p>
          <div className="flex space-x-4 items-center">
            <div>
              <ChevronRight className="cursor-pointer" strokeWidth={1} />
            </div>
          </div>
        </div>

        <div className="flex justify-between px-5">
          {images.map((image, index) => (
            <div key={index} className="border bg-accent p-2 rounded-md">
              <img className="h-20 w-20" src={image.fileUrl} alt="" />
            </div>
          ))}
        </div>
      </div>
      <Separator className="w-[90%] mx-auto" />
    </>
  );
};

const StarSection = () => {
  const dispatch = useDispatch();

  return (
    <div
      className="flex justify-between items-center h-20 px-4 cursor-pointer"
      onClick={() => dispatch(UpdateContactSidebarType("STARRED"))}
    >
      <div className="flex items-center space-x-5">
        <Star strokeWidth={1} />
        <p className="text-sm text-muted-foreground">Starred Messages</p>
      </div>
      <div>
        <ChevronRight className="cursor-pointer" strokeWidth={1} />
      </div>
    </div>
  );
};

const CommonGroupSection = () => {
  const { token } = useSelector((state) => state.auth);
  const { other_user_id } = useSelector(
    (state) => state.conversations.current_conversation
  );
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    (async () => {
      const { status, message, data } = await getCommonGroups(
        token,
        other_user_id
      );

      if (status === "error") {
        console.log(message);
        return;
      }

      setGroups(data);
    })();
  }, []);

  return (
    <>
      <div className="py-4">
        <div className="flex items-center my-2 px-4">
          <p className="text-sm text-muted-foreground">
            {groups?.length} group in common
          </p>
        </div>
        {groups?.map((g) => (
          <div key={g._id} className="space-y-4">
            <div className="flex items-center px-6 pt-4 space-x-8">
              <Avatar className="">
                <AvatarImage src={g.avatar} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="flex flex-col font-medium space-y-1">
                <p>{g.name}</p>
                <p className=" text-xs font-normal">{`${g.participants_count} members`}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const GroupMembersSection = () => {
  const { admin, participants } = useSelector(
    (state) => state.conversations.current_conversation
  );
  const { user_id } = useSelector((state) => state.auth);

  const isAdmin = admin.includes(user_id);

  return (
    <>
      <div className="py-4">
        <div className="flex items-center my-2 px-4">
          <p className="text-sm text-muted-foreground">Members</p>
        </div>
        {isAdmin && (
          <div className="flex justify-between px-5">
            <AddMembersDialogBox>
              <span className="min-w-20 h-8 bg-primary border rounded-md flex justify-center items-center">
                Add
              </span>
            </AddMembersDialogBox>
            <RemoveMembersDialogBox>
              <span className="min-w-20 h-8 bg-primary border rounded-md flex justify-center items-center">
                Remove
              </span>
            </RemoveMembersDialogBox>
            <AdminDialogBox>
              <span className="min-w-20 h-8 bg-primary border rounded-md flex justify-center items-center">
                Admin
              </span>
            </AdminDialogBox>
          </div>
        )}
        {participants?.map((p) => (
          <div key={p._id} className="flex justify-between items-center mr-9 space-y-4">
            <div className="flex items-center px-6 pt-4 space-x-5">
              <Avatar className="">
                <AvatarImage src={p.avatar} />
                <AvatarFallback>Avatar</AvatarFallback>
              </Avatar>
              <div className="flex items-center font-medium space-x-1 space-y-1">
                <p>{p.username}</p>
                {p.status === "Online" && (
                  <img src={PulseAnimation} alt="online" />
                )}
              </div>
            </div>
            {admin.includes(p._id) && (
              <span className=" border border-slate-400 rounded text-xs px-1 h-fit">
                Admin
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

const AddMembersDialogBox = ({ children }) => {
  const { friendsList } = useSelector((state) => state.app);
  const { participants } = useSelector(
    (state) => state.conversations.current_conversation
  );
  const { room_id } = useSelector((state) => state.app);
  const { username } = useSelector((state) => state.auth);

  const handleAddMember = (id) => {
    socket?.emit("addMemberToGroup", id, room_id, username);
  };

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
          <h2>Add members to group</h2>
          {friendsList?.map((friend) => (
            <div
              key={friend._id}
              className="flex items-center justify-between px-6 py-2 space-x-3 hover:bg-messageCard rounded-lg"
            >
              <div className="flex justify-center items-center space-x-4">
                <Avatar>
                  <AvatarImage src={friend.avatar} />
                  <AvatarFallback>Avatar</AvatarFallback>
                </Avatar>
                <span>{friend.username}</span>
              </div>
              {participants.some(({ _id }) => _id == friend._id) ? (
                <i className="text-xs">Already in the group</i>
              ) : (
                <ToolTipCustom HoverName="Add to group">
                  <UserRoundPlus
                    strokeWidth={1.5}
                    onClick={() => handleAddMember(friend._id)}
                  />
                </ToolTipCustom>
              )}
            </div>
          ))}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const RemoveMembersDialogBox = ({ children }) => {
  const { admin, participants } = useSelector(
    (state) => state.conversations.current_conversation
  );
  const { room_id } = useSelector((state) => state.app);
  const { user_id, username } = useSelector((state) => state.auth);

  const handleRemoveMember = (id) => {
    if (admin.includes(id)) {
      toast.warning("Cannot remove admin");
      return;
    }
    socket?.emit("removeMemberFromGroup", id, room_id, username);
  };

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
          <h2>Remove members from group</h2>
          {participants?.map((p) => {
            if (p._id === user_id) return null;

            return (
              <div
                key={p._id}
                className="flex items-center justify-between px-6 py-2 space-x-3 hover:bg-messageCard rounded-lg"
              >
                <div className="flex justify-center items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={p.avatar} />
                    <AvatarFallback>Avatar</AvatarFallback>
                  </Avatar>
                  <span>{p.username}</span>
                </div>
                <ToolTipCustom HoverName="Remove from group">
                  <UserRoundX
                    strokeWidth={1.5}
                    onClick={() => handleRemoveMember(p._id)}
                  />
                </ToolTipCustom>
              </div>
            );
          })}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AdminDialogBox = ({ children }) => {
  const { admin, participants } = useSelector(
    (state) => state.conversations.current_conversation
  );
  const { room_id } = useSelector((state) => state.app);
  const { username, avatar, user_id } = useSelector((state) => state.auth);

  const handleAddAdmin = (id) => {
    socket?.emit("addToAdminOfGroup", id, room_id, username);
  };

  const handleRemoveAdmin = (id) => {
    socket?.emit("removeFronAdminOfGroup", id, room_id, username);
  };

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
          <h2>Change Admin</h2>
          <div className="flex items-center justify-between px-6 py-2 space-x-3 hover:bg-messageCard rounded-lg">
            <div className="flex justify-center items-center space-x-4">
              <Avatar>
                <AvatarImage src={avatar} />
                <AvatarFallback>Avatar</AvatarFallback>
              </Avatar>
              <span>{username}</span>
            </div>
          </div>
          <Separator />

          {participants?.map((p) => {
            if (p._id === user_id) return null;
            return (
              <div
                key={p._id}
                className="flex items-center justify-between px-6 py-2 space-x-3 hover:bg-messageCard rounded-lg"
              >
                <div className="flex justify-center items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={p.avatar} />
                    <AvatarFallback>Avatar</AvatarFallback>
                  </Avatar>
                  <span>{p.username}</span>
                </div>
                {admin.includes(p._id) ? (
                  <Button onClick={() => handleRemoveAdmin(p._id)}>
                    Remove as Admin
                  </Button>
                ) : (
                  <Button onClick={() => handleAddAdmin(p._id)}>
                    Make admin
                  </Button>
                )}
              </div>
            );
          })}
        </DialogContent>
      </Dialog>
    </div>
  );
};
