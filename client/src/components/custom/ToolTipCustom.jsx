import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ToolTipCustom = ({
  children,
  HoverName,
  side,
  sideOffset,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span>{children}</span>
        </TooltipTrigger>
        <TooltipContent sideOffset={sideOffset} side={side}>
          {HoverName}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ToolTipCustom;
