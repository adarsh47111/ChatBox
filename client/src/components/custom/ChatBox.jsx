import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToggleContactSidebar } from "../../redux/slices/app";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Dot,
  Video,
  Phone,
  Search,
  ChevronDown,
  Link,
  Smile,
  Send,
  EllipsisVertical,
  Image,
  File,
  BookUser,
  BarChartHorizontalBig,
  Star,
  Trash2,
  Download,
  SquareX,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import ToolTipCustom from "./ToolTipCustom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";
import { socket } from "@/socket";
import { getCurrentTimeIn12HourFormat } from "@/utils/getCurrentTimeIn12HourFormat";
import { getTimeLine } from "@/utils/getTimeLine";
import Lottie from "react-lottie";
import typing_indicator from "../../animation/typing_indicator.json";
import star from "../../assets/star.svg";
import PulseAnimation from "../../assets/PulseAnimation.svg";
import Loading from "../../assets/Loading.svg";
import { DeleteMessage, StarMessage } from "@/redux/slices/conversation";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import { pdf, doc, file, ppt, csv, xls } from "../../assets";
import { uploadFile } from "@/utils/FireBase";
import wall from "../../assets/peakpx.jpg";
import { useTheme } from "../ui/theme-provider";

const ChatBox = () => {
  return (
    <div className="min-w-[50%] flex-1 h-screen flex flex-col justify-between">
      <Header />
      <MessageArea />
      <Footer />
    </div>
  );
};

export default ChatBox;

const Header = () => {
  const { current_conversation } = useSelector((state) => state.conversations);
  const { chat_type } = useSelector((state) => state.app);
  const isContactSidebarOpen = useSelector(
    (state) => state.app.ContactSidebar.open
  );

  const dispatch = useDispatch();
  const { theme } = useTheme();

  return (
    <>
      <div className=" bg-messageCard flex justify-between items-center h-20 w-full px-8">
        <div className="flex items-center space-x-5 h-full">
          <Avatar
            className="cursor-pointer"
            onClick={() => dispatch(ToggleContactSidebar())}
          >
            <AvatarImage src={current_conversation?.avatar} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-center h-[57%]">
            <p className="text-base font-semibold">
              {current_conversation?.name}
            </p>
            {chat_type !== "GROUP_CHAT" && (
              <div className="flex items-center">
                {current_conversation?.online === true ? (
                  <>
                    <img src={PulseAnimation} alt="" />
                    <p
                      className={`text-xs ${
                        theme == "dark" ? "text-green-200" : "text-green-500"
                      }`}
                    >
                      Online
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">Offline</p>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-8">
          {/* <Video className="cursor-pointer" size={22} strokeWidth={1} />
          <Phone className="cursor-pointer" size={20} strokeWidth={1} />
          <Search className="cursor-pointer" size={22} strokeWidth={1} />
          <Separator className=" h-10" orientation="vertical" /> */}
          {!isContactSidebarOpen && (
            <ChevronDown
              className="cursor-pointer"
              size={27}
              strokeWidth={1}
              onClick={() => dispatch(ToggleContactSidebar())}
            />
          )}
        </div>
      </div>
    </>
  );
};

const Footer = () => {
  const { user_id } = useSelector((state) => state.auth);
  const { chat_type, room_id } = useSelector((state) => state.app);
  const [typedValue, setTypedValue] = useState("");
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [actionListActive, setActionListActive] = useState(false);
  const [messageType, setMessageType] = useState("Text");

  const actionsList = [
    { index: 1, name: "Photos", icon: <Image strokeWidth={1.5} /> },
    { index: 2, name: "Document", icon: <File strokeWidth={1.5} /> },
    // { index: 3, name: "Contact", icon: <BookUser strokeWidth={1.5} /> },
    // {
    //   index: 4,
    //   name: "Poll",
    //   icon: <BarChartHorizontalBig strokeWidth={1.5} />,
    // },
  ];

  // TODO: Implement typing indicator
  // useEffect(() => {
  //   if (typedValue === "") {
  //     socket?.emit("stop_typing", room_id);
  //     return;
  //   }
  //   socket?.emit("typing", room_id);

  //   const timer = setTimeout(() => {
  //     socket?.emit("stop_typing", room_id);
  //   }, 2000);

  //   return () => {
  //     clearTimeout(timer);
  //   };
  // }, [typedValue]);

  useEffect(() => {
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?(www\\.)?" + // Optional protocol and "www."
        "(([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+" + // Domain name
        "([a-zA-Z]{2,63})" + // TLD (e.g., .com, .net, .org, etc.)
        "(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*" + // Optional port and path
        "(\\?[;&a-zA-Z\\d%_.~+=-]*)?" + // Optional query string
        "(\\#[-a-zA-Z\\d_]*)?$", // Optional fragment
      "i" // Case-insensitive flag
    );

    if (urlPattern.test(typedValue)) setMessageType("Link");
  }, [typedValue]);

  useEffect(() => {
    if (file !== null) {
      var reader = new FileReader();
      reader.onload = function () {
        setFileUrl(reader.result);
        console.log(file);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  const handleSendMessage = async () => {
    // TODO: customize for different types of messages
    switch (messageType) {
      case "Text":
      case "Link": {
        socket.emit("text_message", {
          sender: user_id,
          chat_type,
          room_id: room_id,
          fileType: "Text",
          message: typedValue,
          time: Date.now(),
        });
        setTypedValue("");
        return;
      }
      // case "File": {
      //   const time = Date.now();
      //   const downloadURL = await uploadFile({
      //     path: "messages",
      //     fileName: time + "$" + file.name,
      //     file,
      //   });

      //   socket.emit("file_message", {
      //     sender: user_id,
      //     chat_type,
      //     room_id: room_id,
      //     image: file.type.startsWith("image"),
      //     fileName: file.name,
      //     fileUrl: downloadURL,
      //     fileType: file.type.split("/")[1],
      //     time,
      //   });

      //   setFile(null);
      //   setFileUrl(null);

      //   return;
      // }

      case "File": {
        let msg_id;
        const time = Date.now();
        socket.emit(
          "file_message",
          {
            sender: user_id,
            chat_type,
            room_id: room_id,
            image: file.type.startsWith("image"),
            fileName: file.name,
            // fileUrl: downloadURL,
            fileType: file.type.split("/")[1],
            time,
          },
          (response) => {
            msg_id = response.msg_id;
          }
        );
        setFile(null);
        setFileUrl(null);

        try {
          const downloadURL = await uploadFile({
            path: "messages",
            fileName: time + "$" + file.name,
            file,
          });

          socket.emit(
            "fileSave_successful",
            msg_id,
            downloadURL,
            chat_type,
            room_id
          );
        } catch (error) {
          // This block will execute if the upload fails
          socket.emit("fileSave_unsuccessful", msg_id, chat_type, room_id);
        }

        return;
      }
    }
  };

  return (
    <>
      {file ? (
        <FilePreviewer
          file={file}
          fileUrl={fileUrl}
          setFile={setFile}
          setFileUrl={setFileUrl}
        />
      ) : null}
      <div className="flex justify-between items-center bg-messageCard h-20 px-10">
        <div className="flex justify-between items-center rounded-lg h-12 px-3 w-full mr-9">
          <Popover onOpenChange={() => setActionListActive((n) => !n)}>
            <PopoverTrigger>
              <Link size={20} strokeWidth={1} className="cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent className="w-fit my-8">
              <div className=" space-y-4">
                {actionListActive &&
                  actionsList.map((action) => (
                    <div key={action.index}>
                      <ToolTipCustom
                        sideOffset={22}
                        side="right"
                        HoverName={action.name}
                      >
                        {(() => {
                          switch (action.index) {
                            case 1:
                              return (
                                <>
                                  <label
                                    htmlFor="imageupload"
                                    className="cursor-pointer"
                                  >
                                    {action.icon}
                                  </label>
                                  <input
                                    id="imageupload"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      setFile(e.target.files[0]);
                                      setMessageType("File");
                                    }}
                                    // multiple
                                    hidden
                                  />
                                </>
                              );
                            case 2:
                              return (
                                <>
                                  <label
                                    htmlFor="fileupload"
                                    className="cursor-pointer"
                                  >
                                    {action.icon}
                                  </label>
                                  <input
                                    id="fileupload"
                                    type="file"
                                    accept="all/*"
                                    onChange={(e) => {
                                      setFile(e.target.files[0]);
                                      setMessageType("File");
                                    }}
                                    // multiple
                                    hidden
                                  />
                                </>
                              );
                            default:
                              return action.icon;
                          }
                        })()}
                      </ToolTipCustom>
                    </div>
                  ))}
              </div>
            </PopoverContent>
          </Popover>

          {file ? null : (
            <Input
              className="w-[93%] mx-2 border-none"
              placeholder="Type a message"
              value={typedValue}
              onChange={(e) => {
                if (messageType !== "Text") setMessageType("Text");
                setTypedValue(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
            />
          )}

          <Popover>
            <PopoverTrigger>
              <Smile size={20} strokeWidth={1} className="cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent className="mx-2 my-8 p-0 w-fit">
              <EmojiPicker
                theme="auto"
                emojiStyle="native"
                onEmojiClick={(emojiObj) => {
                  setTypedValue((n) => n + emojiObj.emoji);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div
          className="h-10 w-14 flex justify-center items-center rounded-md bg-primary"
          onClick={handleSendMessage}
        >
          <Send className="cursor-pointer" color="#ffffff" />
        </div>
      </div>
    </>
  );
};

const MessageArea = () => {
  const { current_messages, current_conversation } = useSelector(
    (state) => state.conversations
  );
  const { user_id } = useSelector((state) => state.auth);
  const scrollRef = useRef(null);
  const [typing, setTyping] = useState(false);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: typing_indicator,
    renderSettings: {
      preservedAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    socket?.on("typing", (roomID) => {
      if (current_conversation.room_id === roomID) setTyping(true);
    });
    socket?.on("stop_typing", (roomID) => {
      if (current_conversation.room_id === roomID) setTyping(false);
    });

    return () => {
      socket?.off("typing");
      socket?.off("stop_typing");
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView();
    }
  }, [current_messages]);

  return (
    <>
      <ScrollArea
        className="flex-1 rounded-md px-4 py-2 bg-cover bg-center"
        // style={{
        //   backgroundImage: `url(${wall})`,
        // }}
      >
        <div className="flex flex-col justify-end">
          {current_messages?.map((message, idx) => {
            const curent_timeLine = getTimeLine(message.time);

            switch (message.type) {
              case "Text":
                return (
                  <div key={message._id}>
                    {idx === 0 ? <TimeLine timeLine={curent_timeLine} /> : null}
                    {idx !== 0 &&
                    curent_timeLine !==
                      getTimeLine(current_messages[idx - 1].time) ? (
                      <TimeLine timeLine={curent_timeLine} />
                    ) : null}

                    <TextMessageBubble
                      id={message._id}
                      name={message.sender.username}
                      avatar={message.sender.avatar}
                      message={message.text}
                      time={getCurrentTimeIn12HourFormat(message.time)}
                      type={message.type}
                      saveStatus={message.saveStatus}
                      incoming={user_id !== message.sender._id}
                      starred={message.starred}
                      deleted={message.deleted}
                    />
                  </div>
                );
              case "Image":
                return (
                  <div key={message._id}>
                    {idx === 0 ? <TimeLine timeLine={curent_timeLine} /> : null}
                    {idx !== 0 &&
                    curent_timeLine !==
                      getTimeLine(current_messages[idx - 1].time) ? (
                      <TimeLine timeLine={curent_timeLine} />
                    ) : null}

                    <ImageBubble
                      id={message._id}
                      name={message.sender.username}
                      avatar={message.sender.avatar}
                      fileName={message.fileName}
                      fileType={message.fileType}
                      fileUrl={message.fileUrl}
                      saveStatus={message.saveStatus}
                      time={getCurrentTimeIn12HourFormat(message.time)}
                      incoming={user_id !== message.sender._id}
                      starred={message.starred}
                      deleted={message.deleted}
                    />
                  </div>
                );
              case "Document":
                return (
                  <div key={message._id}>
                    {idx === 0 ? <TimeLine timeLine={curent_timeLine} /> : null}
                    {idx !== 0 &&
                    curent_timeLine !==
                      getTimeLine(current_messages[idx - 1].time) ? (
                      <TimeLine timeLine={curent_timeLine} />
                    ) : null}

                    <DocumentBubble
                      id={message._id}
                      name={message.sender.username}
                      avatar={message.sender.avatar}
                      saveStatus={message.saveStatus}
                      fileName={message.fileName}
                      fileType={message.fileType}
                      fileUrl={message.fileUrl}
                      time={getCurrentTimeIn12HourFormat(message.time)}
                      incoming={user_id !== message.sender._id}
                      starred={message.starred}
                      deleted={message.deleted}
                    />
                  </div>
                );
              case "Info":
                return <InfoBubble key={message._id} text={message.text} />;
              // case "Link":
              //   return ();
            }
          })}
          <div ref={scrollRef} />
          {typing ? (
            <div className="border w-fit rounded-lg h-[50px]">
              <Lottie options={defaultOptions} width={100} />
            </div>
          ) : null}
        </div>
      </ScrollArea>
    </>
  );
};

const TextMessageBubble = ({
  id,
  name,
  avatar,
  message,
  time,
  starred,
  deleted,
  incoming,
  saveStatus,
}) => {
  const dispatch = useDispatch();

  return (
    <>
      <div
        className={`flex space-x-2 min-h-12 w-full px-3 my-4 ${
          incoming ? "" : "flex-row-reverse space-x-reverse"
        }`}
      >
        <Avatar>
          <AvatarImage src={avatar} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div
          className={`min-w-44 max-w-[36rem] space-y-1 ${
            incoming ? "" : "flex flex-col items-end"
          }`}
        >
          <div
            className={`flex items-center space-x-3 ${
              incoming ? "" : "flex-row-reverse space-x-reverse"
            }`}
          >
            <span className="text-base font-semibold">{name}</span>
            <span className="text-xs mt-1">{time}</span>
            {starred ? (
              <img
                src={star}
                alt=""
                className="cursor-pointer"
                onClick={() =>
                  dispatch(StarMessage({ message_id: id, starStatus: false }))
                }
              />
            ) : null}
          </div>
          <div
            className={`border flex items-start min-h-9 w-fit max-w-full rounded-xl p-3 space-x-2 ${
              incoming
                ? "rounded-tl-none bg-muted"
                : "flex-row-reverse space-x-reverse rounded-tr-none bg-primary text-white"
            }`}
          >
            <p
              className={`break-words overflow-clip px-1 text-[0.9rem] ${
                deleted ? "italic" : ""
              }`}
            >
              {deleted ? "This message was deleted" : message}
            </p>
            {deleted ? null : (
              <DropdownMenuCustom
                message={message}
                message_id={id}
                starred={starred}
                incoming={incoming}
              >
                <EllipsisVertical className="w-5 mt-1" size={16} />
              </DropdownMenuCustom>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const ImageBubble = ({
  id,
  name,
  avatar,
  fileName,
  fileUrl,
  fileType,
  time,
  incoming,
  starred,
  deleted,
  saveStatus,
}) => {
  const dispatch = useDispatch();

  return (
    <>
      <div
        className={`flex space-x-2 min-h-12 w-full px-3 my-4 ${
          incoming ? "" : "flex-row-reverse space-x-reverse"
        }`}
      >
        <Avatar>
          <AvatarImage src={avatar} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div
          className={`min-w-44 space-y-1 ${
            incoming ? "" : "flex flex-col items-end"
          }`}
        >
          <div
            className={`flex items-center space-x-3 ${
              incoming ? "" : "flex-row-reverse space-x-reverse"
            }`}
          >
            <span className="text-base font-semibold">{name}</span>
            <span className="text-xs mt-1">{time}</span>
            {starred ? (
              <img
                src={star}
                alt=""
                className="cursor-pointer"
                onClick={() =>
                  dispatch(StarMessage({ message_id: id, starStatus: false }))
                }
              />
            ) : null}
          </div>
          <div
            className={`relative border flex justify-between items-start min-h-9 rounded-xl p-3 space-x-1 ${
              !deleted ? "cursor-pointer" : ""
            } ${
              incoming
                ? "rounded-tl-none bg-muted"
                : "flex-row-reverse space-x-reverse rounded-tr-none bg-primary bg-opacity-48 text-white"
            } ${deleted || saveStatus === "FAILED" ? "italic" : ""}`}
            onClick={() => {
              if (!deleted && fileUrl) window.open(fileUrl, "_blank");
            }}
          >
            {saveStatus === "SUCCESSFUL" &&
              (deleted ? (
                <p className=" px-1 text-[0.9rem]">This message was deleted</p>
              ) : (
                <img
                  className="max-h-80 max-w-80 rounded-l shadow-sm shadow-black"
                  src={fileUrl}
                />
              ))}

            {saveStatus === "FAILED" && (
              <p className=" px-1 text-[0.9rem]">Failed to send</p>
            )}

            {saveStatus === "PENDING" && (
              <img src={Loading} alt="loading..." className="h-5" />
            )}
            {deleted ? null : (
              <DropdownMenuCustom
                message_id={id}
                starred={starred}
                msg_type="Image"
                fileName={fileName}
                fileUrl={fileUrl}
                fileType={fileType}
                incoming={incoming}
                className="absolute"
              >
                <EllipsisVertical className="w-5" size={16} />
              </DropdownMenuCustom>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const DocumentBubble = ({
  id,
  name,
  avatar,
  fileName,
  fileType,
  fileUrl,
  time,
  starred,
  deleted,
  incoming,
  saveStatus,
}) => {
  const dispatch = useDispatch();

  return (
    <>
      <div
        className={`flex space-x-2 min-h-12 w-full px-3 my-4 ${
          incoming ? "" : "flex-row-reverse space-x-reverse"
        }`}
      >
        <Avatar>
          <AvatarImage src={avatar} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div
          className={`min-w-44 space-y-1 ${
            incoming ? "" : "flex flex-col items-end"
          }`}
        >
          <div
            className={`flex items-center space-x-3 ${
              incoming ? "" : "flex-row-reverse space-x-reverse"
            }`}
          >
            <span className="text-base font-semibold">{name}</span>
            <span className="text-xs mt-1">{time}</span>
            {starred ? (
              <img
                src={star}
                alt=""
                className="cursor-pointer"
                onClick={() =>
                  dispatch(StarMessage({ message_id: id, starStatus: false }))
                }
              />
            ) : null}
          </div>
          <div
            className={`relative border flex justify-between items-start min-h-9 rounded-xl p-3 px-2 space-x-1 ${
              !deleted ? "cursor-pointer" : ""
            } ${
              incoming
                ? "rounded-tl-none bg-muted"
                : "flex-row-reverse space-x-reverse rounded-tr-none bg-primary bg-opacity-48 text-white"
            }`}
            onClick={() => {
              if (!deleted && fileUrl) window.open(fileUrl, "_blank");
            }}
          >
            <div
              className={`flex items-center space-x-2 ${
                deleted || saveStatus === "FAILED" ? "italic" : ""
              }`}
            >
              {saveStatus === "SUCCESSFUL" &&
                (deleted ? (
                  <p className="break-words overflow-clip px-1 text-[0.9rem]">
                    This message was deleted
                  </p>
                ) : (
                  <>
                    <img
                      className="h-8 w-8 rounded-l"
                      src={(() => {
                        switch (fileType) {
                          case "pdf":
                            return pdf;
                          case "doc":
                          case "docx":
                            return doc;
                          case "xls":
                          case "xlsx":
                            return xls;
                          case "ppt":
                          case "pptx":
                            return ppt;
                          case "csv":
                            return csv;
                          default:
                            return file;
                        }
                      })()}
                    />
                    <p className=" text-sm">
                      {(() => {
                        if (fileName.length <= 20) return fileName;
                        else
                          return fileName.substring(0, 20) + "... ." + fileType;
                      })()}
                    </p>
                  </>
                ))}
              {saveStatus === "FAILED" && (
                <p className=" px-1 text-[0.9rem]">Failed to send</p>
              )}

              {saveStatus === "PENDING" && (
                <img src={Loading} alt="loading..." className="h-5" />
              )}
            </div>
            {deleted ? null : (
              <DropdownMenuCustom
                message_id={id}
                starred={starred}
                msg_type="Document"
                fileName={fileName}
                fileUrl={fileUrl}
                fileType={fileType}
                incoming={incoming}
                className="absolute"
              >
                <EllipsisVertical className="w-5" size={16} />
              </DropdownMenuCustom>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const InfoBubble = ({ text }) => {
  return (
    <div className="flex justify-center items-center space-x-2 my-2 -skew-x-12">
      <i className="text-sm bg-muted px-8 py-1 rounded-md tracking-wider">
        {text}
      </i>
    </div>
  );
};

const DropdownMenuCustom = ({
  children,
  message,
  message_id,
  msg_type,
  fileName,
  fileType,
  fileUrl,
  starred,
  incoming,
}) => {
  const { chat_type, room_id } = useSelector((state) => state.app);
  const dispatch = useDispatch();

  const handleDownload = () => {
    // Create an anchor element
    const link = document.createElement("a");
    link.href = fileUrl; // Set the URL of the file
    link.setAttribute("download", `${fileName}.${fileType}`); // Use download attribute to suggest download

    // Append to the body (needed for Firefox)
    document.body.appendChild(link);
    link.click(); // Trigger the download

    // Clean up and remove the link
    document.body.removeChild(link);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="pb-2">{children}</DropdownMenuTrigger>
        <DropdownMenuContent>
          {msg_type === "Document" || msg_type === "Image" ? (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                // window.open(fileUrl, "_blank");
                handleDownload();
              }}
            >
              Download
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(message);
              }}
            >
              Copy
            </DropdownMenuItem>
          )}

          {chat_type === "GROUP_CHAT" ? (
            <DropdownMenuItem>Reply Privately</DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              if (starred)
                dispatch(StarMessage({ message_id, starStatus: false }));
              else dispatch(StarMessage({ message_id, starStatus: true }));
            }}
          >
            {starred ? "Unstar" : "Star"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              socket?.emit("delete_message", {
                room_type: chat_type,
                room_id,
                msg_type,
                message_id,
                all: false,
              });
            }}
          >
            Delete For Me
          </DropdownMenuItem>
          {incoming === false ? (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                socket?.emit("delete_message", {
                  room_type: chat_type,
                  room_id,
                  msg_type,
                  message_id,
                  all: true,
                });
              }}
            >
              Delete For Everyone
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

const TimeLine = ({ timeLine }) => {
  return (
    <div className="flex justify-center">
      <span className="px-4 py-1 bg-muted rounded-lg text-sm">{timeLine}</span>
    </div>
  );
};

const FilePreviewer = ({ file, fileUrl, setFile, setFileUrl }) => {
  return (
    <>
      <div className=" relative">
        <div className="absolute border p-2 bottom-4 left-4 rounded-lg">
          {file.type.startsWith("image") ? (
            <img
              src={fileUrl}
              className=" max-h-[20rem] max-w-[40rem] aspect-auto"
            />
          ) : (
            <div className="mb-4">
              {(() => {
                switch (file.type) {
                  case "application/pdf":
                    return <img src={pdf} className="h-40 w-40" />;
                  case "application/msword":
                  case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                    return <img src={doc} className="h-40 w-40" />;

                  case "application/vnd.ms-excel":
                  case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                    return <img src={xls} className="h-40 w-40" />;

                  case "application/vnd.ms-powerpoint":
                  case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                    return <img src={ppt} className="h-40 w-40" />;

                  case "text/csv":
                    return <img src={csv} className="h-40 w-40" />;

                  default:
                    return <img src={file} className="h-40 w-40" />;
                }
              })()}
            </div>
          )}
          <div className="flex justify-between space-x-2 px-2 mt-2">
            <p className="text-sm text-muted-foreground">{file.name}</p>
            <Trash2
              className="cursor-pointer"
              size={20}
              onClick={() => {
                setFile(null);
                setFileUrl(null);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
