import { UpdateContactSidebarType } from "@/redux/slices/app";
import { ArrowLeft, StarOff } from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ScrollArea } from "../ui/scroll-area";
import ToolTipCustom from "./ToolTipCustom";
import { getCurrentTimeIn12HourFormat } from "@/utils/getCurrentTimeIn12HourFormat";
import { StarMessage } from "@/redux/slices/conversation";
import { pdf, doc, file, ppt, csv, xls } from "../../assets";

const StarredMessagesTab = () => {
  const { user_id } = useSelector((state) => state.auth);
  const { current_messages } = useSelector((state) => state.conversations);
  return (
    <>
      <div className="flex flex-col w-1/4 h-screen border">
        <Header />
        <ScrollArea className="flex-1 rounded-md px-4 py-2">
          {current_messages?.map((ele) => {
              console.log("star1", ele);
            if (ele.starred === true)
              return (
                <MessageCard
                  key={ele._id}
                  id={ele._id}
                  text={ele.text}
                  type={ele.type}
                  fileUrl={ele.fileUrl}
                  fileType={ele.fileType}
                  fileName={ele.fileName}
                  time={getCurrentTimeIn12HourFormat(ele.time)}
                  incomming={ele.sender._id !== user_id}
                />
              );
            else return null;
          })}
        </ScrollArea>
      </div>
    </>
  );
};

export default StarredMessagesTab;

const Header = () => {
  const dispatch = useDispatch();

  return (
    <div className="flex border items-center px-5 space-x-5 h-20">
      <div onClick={() => dispatch(UpdateContactSidebarType("CONTACT"))}>
        <ArrowLeft className="cursor-pointer" strokeWidth={1} />
      </div>
      <span>Starred Messages</span>
    </div>
  );
};

const MessageCard = ({
  id,
  text,
  time,
  type,
  fileUrl,
  fileType,
  fileName,
  incomming,
}) => {
  const dispatch = useDispatch();
  return (
    <div className={`flex flex-col my-6 ${incomming ? "" : " items-end"}`}>
      <div className="flex items-center space-x-2">
        <p className="text-xs my-1">{time}</p>
        <ToolTipCustom HoverName="Unstar">
          <StarOff
            className="cursor-pointer"
            size={16}
            strokeWidth={1.5}
            onClick={() =>
              dispatch(StarMessage({ message_id: id, starStatus: false }))
            }
          />
        </ToolTipCustom>
      </div>
      <div
        className={`flex items-center px-4 py-2 border rounded-lg max-w-[80%] break-words overflow-clip ${
          incomming ? "bg-messageCard" : "bg-primary"
        }`}
      >
        {(() => {
          switch (type) {
            case "Text":
              return text;
            case "Image":
              return (
                <img
                  className="max-h-80 max-w-56 rounded-l shadow-sm shadow-black"
                  src={fileUrl}
                />
              );
            case "Document":
              return (
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
              );
            case "Link":
              return "hi";
          }
        })()}
      </div>
    </div>
  );
};
