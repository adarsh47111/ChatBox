import React, { useState } from "react";
import logo from "../../assets/logo.jpg";
import { ChatsCircle, Users, Gear } from "@phosphor-icons/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "../ui/theme-provider";
import { useDispatch, useSelector } from "react-redux";
import { UpdateMenuPanel } from "@/redux/slices/app";
import { LogOut } from "lucide-react";
import { LogoutUser } from "@/redux/slices/auth";
import { useNavigate } from "react-router-dom";
import { disconnectSocket, socket } from "@/socket";

const MenuBar = () => {
  const [selectedIcon, setSelectedIcon] = useState(1);
  const { setTheme, theme } = useTheme();
  const dispatch = useDispatch();
  const { avatar } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const iconList = [
    { index: 1, icon: <ChatsCircle size={26} />, name: "PRIVATE_CHAT" },
    { index: 2, icon: <Users size={26} />, name: "GROUP_CHAT" },
    { index: 4, icon: <Gear size={26} />, name: "SETTINGS" },
  ];

  const handleChangeTheme = () => {
    if (theme === "dark") setTheme("light");
    else setTheme("dark");
  };

  return (
    <>
      <div className="flex flex-col items-center justify-between bg-muted w-28 space-y-12 pt-4 pb-8 h-screen">
        <div className="flex flex-col items-center space-y-10">
          <img src={logo} alt="logo" className="h-12 w-12 rounded-lg" />
          {iconList.map((ele) => {
            return ele.index === selectedIcon ? (
              <div key={ele.index}>
                <div
                  className="h-12 w-12 flex justify-center items-center rounded-lg bg-primary cursor-pointer"
                  onClick={() => {
                    setSelectedIcon(ele.index);
                    dispatch(UpdateMenuPanel(ele.name));
                  }}
                >
                  {ele.icon}
                </div>
              </div>
            ) : (
              <div key={ele.index}>
                <div
                  className="h-auto w-12 flex justify-center cursor-pointer"
                  onClick={() => {
                    setSelectedIcon(ele.index);
                    dispatch(UpdateMenuPanel(ele.name));
                  }}
                >
                  {ele.icon}
                </div>
              </div>
            );
          })}
        </div>

        <div className=" space-y-8">
          <LogOut
            className="cursor-pointer mx-auto"
            size={26}
            onClick={() => {
              dispatch(LogoutUser());
              disconnectSocket();
              navigate("/auth/login");
            }}
          />
          <Switch
            checked={theme === "dark" ? true : false}
            onCheckedChange={handleChangeTheme}
          />
          <Avatar>
            <AvatarImage src={avatar} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </>
  );
};

export default MenuBar;
