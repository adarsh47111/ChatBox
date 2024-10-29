import { CircleUserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import profileIcon from "@/assets/profile_icon.gif";
import { useState } from "react";
import { UpdateSettingPage } from "@/redux/slices/app";
import { useDispatch } from "react-redux";

const Settings = () => {
  const dispatch = useDispatch();
  const [selectedMenu, setSelectedMenu] = useState(0);
  const MenuList = [
    { index: 1, name: "Profile", icon: <CircleUserRound /> },
    // { index: 2, name: "Notifications", icon: <CircleUserRound /> },
    // { index: 3, name: "Privacy", icon: <CircleUserRound /> },
    { index: 4, name: "Theme", icon: <CircleUserRound /> },
    { index: 5, name: "Chat Wallpaper", icon: <CircleUserRound /> },
    // { index: 6, name: "Security", icon: <CircleUserRound /> },
  ];

  return (
    <div className="flex flex-col border p-4 space-y-6 h-screen w-1/4">
      <TopSection />
      <div className="flex flex-col space-y-5 py-5">
        {MenuList.map(({ index, name, icon }) => (
          <div
            key={index}
            className={`flex space-x-8 items-center h-16 px-4 cursor-pointer rounded-lg ${
              index === MenuList.length ? "" : "border-b"
            } ${
              index === selectedMenu ? "bg-primary" : "hover:bg-messageCard"
            }`}
            onClick={() => {
              setSelectedMenu(index);
              dispatch(UpdateSettingPage(name));
            }}
          >
            {icon}
            <p>{name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;

const TopSection = ({
  username = "Adarsh",
  about = "Hey there! I am using WhatsApp",
}) => {
  return (
    <div>
      <p className="mb-8 flex items-center text-3xl">Settings</p>
      <div className="flex items-center space-x-5">
        <Avatar className="h-16 w-16">
          <AvatarImage src={"https://github.com/shadcn.png"} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col justify-between h-full">
          <p className="text-base font-semibold">{username}</p>
          <p className=" text-sm">{about}</p>
        </div>
      </div>
    </div>
  );
};
