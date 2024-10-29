import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/components/ui/theme-provider";

const ThemePage = () => {
  const { setTheme, theme } = useTheme();

  return (
    <div className="flex-1 p-10">
      <h1 className="text-2xl">Themes</h1>
      <div className="py-10 flex justify-between">
        <div
          className={`border-2 rounded-lg bg-slate-200 p-5 flex gap-1 cursor-pointer ${
            theme === "dark" ? "border-primary" : "border-mute"
          }`}
          onClick={() => setTheme("dark")}
        >
          <Skeleton className="w-10 h-80 bg-black"></Skeleton>
          <Skeleton className="w-20 h-80 bg-black"></Skeleton>
          <Skeleton className="w-72 h-80 bg-black"></Skeleton>
        </div>
        <div
          className={`border-2 rounded-lg bg-slate-200 p-5 flex gap-1 cursor-pointer ${
            theme === "light" ? "border-primary" : "border-mute"
          }`}
          onClick={() => setTheme("light")}
        >
          <Skeleton className="w-10 h-80 bg-white"></Skeleton>
          <Skeleton className="w-20 h-80 bg-white"></Skeleton>
          <Skeleton className="w-72 h-80 bg-white"></Skeleton>
        </div>
      </div>
    </div>
  );
};

export default ThemePage;
