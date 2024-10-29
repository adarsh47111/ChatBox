import { useTheme } from "../ui/theme-provider";
import { Loading, LoadingWhite } from "../../assets/index.js";
import { cn } from "@/lib/utils";

const LoaderIndicator = ({ className }) => {
  const { theme } = useTheme();

  const loader = theme === "light" ? Loading : LoadingWhite;

  return (
    <img src={loader} alt="loading..." className={cn(" mx-3 h-5", className)} />
  );
};

export default LoaderIndicator;
