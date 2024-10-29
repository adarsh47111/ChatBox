import { useDispatch, useSelector } from "react-redux";
import { UpdateContactSidebarType } from "../../redux/slices/app";
import { ArrowLeft, Link, ArrowDownToLine } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const SharedTab = () => {
  const [selectedTab, setSelectedTab] = useState("Media");
  return (
    <div className="flex flex-col w-1/4 h-screen border">
      <Header />
      <TabMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      {(() => {
        switch (selectedTab) {
          case "Media":
            return <MediaTab />;
          case "Links":
            return <LinksTab />;
          case "Docs":
            return <DocsTab />;
        }
      })()}
    </div>
  );
};

export default SharedTab;

const Header = () => {
  const dispatch = useDispatch();

  return (
    <div className="flex border items-center px-5 space-x-5 h-20">
      <div onClick={() => dispatch(UpdateContactSidebarType("CONTACT"))}>
        <ArrowLeft className="cursor-pointer" strokeWidth={1} />
      </div>
    </div>
  );
};

const TabMenu = ({ selectedTab, setSelectedTab }) => {
  const Menu = [
    { index: 1, name: "Media" },
    // { index: 2, name: "Links" },
    { index: 3, name: "Docs" },
  ];
  return (
    <>
      <div className="flex justify-center items-center border mx-auto my-4 rounded-md h-11 w-fit px-1">
        {Menu.map((menu) =>
          selectedTab === menu.name ? (
            <span
              key={menu.index}
              className="flex justify-center items-center border bg-primary text-sm text-white h-[80%] w-16 rounded cursor-pointer
              "
              onClick={() => setSelectedTab(menu.name)}
            >
              {menu.name}
            </span>
          ) : (
            <span
              key={menu.index}
              className="flex justify-center items-center text-sm h-[80%] w-16 cursor-pointer"
              onClick={() => setSelectedTab(menu.name)}
            >
              {menu.name}
            </span>
          )
        )}
      </div>
    </>
  );
};

const MediaTab = () => {
  const { current_messages } = useSelector((state) => state.conversations);
  let cnt = 0;
  return (
    <>
      <ScrollArea className="flex-1 rounded-md px-1">
        <div className="flex flex-wrap cursor-pointer">
          {current_messages.map((msg) => {
            if (msg.deleted === false && msg.type === "Image" && msg.fileUrl)
              return (
                <div
                  key={msg._id}
                  className="border w-fit m-2 p-2 rounded-lg bg-accent cursor-pointer"
                  onClick={() => {
                    if (msg.fileUrl) window.open(msg.fileUrl, "_blank");
                  }}
                >
                  <img
                    className="h-20 w-20 rounded-lg"
                    src={msg.fileUrl}
                    alt=""
                  />
                </div>
              );
          })}
          {(() => {
            console.log(cnt);
          })()}
        </div>
      </ScrollArea>
    </>
  );
};

const LinksTab = () => {
  const { current_messages } = useSelector((state) => state.conversations);

  const LinkList = [
    { index: 1, src: "https://www.google.com", name: "google.com" },
    { index: 2, src: "https://www.google.com", name: "google.com" },
    { index: 3, src: "https://www.google.com", name: "google.com" },
    { index: 4, src: "https://www.google.com", name: "google.com" },
    { index: 5, src: "https://www.google.com", name: "google.com" },
    { index: 6, src: "https://www.google.com", name: "google.com" },
    { index: 7, src: "https://www.google.com", name: "google.com" },
    { index: 8, src: "https://www.google.com", name: "google.com" },
    { index: 9, src: "https://www.google.com", name: "google.com" },
    { index: 10, src: "https://www.google.com", name: "google.com" },
  ];
  return (
    <>
      <ScrollArea className="flex-1 px-1">
        {LinkList.map((link) => (
          <div className="flex items-center border rounded-xl px-6 mx-2 my-4 space-x-8 h-28">
            <div className="h-16 w-16 border rounded-xl bg-secondary flex justify-center items-center">
              <Link size={30} strokeWidth={1} />
            </div>
            <div className="flex flex-col font-medium space-y-1">
              <p className="text-sm underline">{link.src}</p>
              <p className="text-sm text-blue-300">{link.name}</p>
            </div>
          </div>
        ))}
      </ScrollArea>
    </>
  );
};

const DocsTab = () => {
  const { current_messages } = useSelector((state) => state.conversations);

  const LinkList = [
    { index: 1, type: "excel", name: "invoice" },
    { index: 2, type: "excel", name: "invoice" },
    { index: 3, type: "excel", name: "invoice" },
    { index: 4, type: "excel", name: "invoice" },
    { index: 5, type: "excel", name: "invoice" },
  ];

  return (
    <>
      <ScrollArea className="flex-1 px-1">
        {current_messages.map((msg) => {
          if (msg.deleted === false && msg.type === "Document" && msg.fileUrl)
            return (
              <div className="border rounded-xl p-4 mx-2 my-4">
                <div className="flex justify-center items-center bg-slate-900 h-40 w-full mb-4 rounded-lg">
                  Doc
                </div>
                <div
                  className="flex justify-between items-center px-4 w-full cursor-pointer"
                  onClick={() => {
                    if (msg.fileUrl) window.open(msg.fileUrl, "_blank");
                  }}
                >
                  <div className="flex items-center font-medium space-x-4">
                    <Link size={25} strokeWidth={1} />
                    <p className="text-sm">{msg.fileName}</p>
                  </div>
                </div>
              </div>
            );
        })}
      </ScrollArea>
    </>
  );
};
