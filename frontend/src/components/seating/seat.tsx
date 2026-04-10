import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type SeatStatus = "available" | "booked" | "disabled";

export interface SeatData {
  id: string;
  row: string;
  number: number;
  price: number;
  status: SeatStatus;
}

interface SeatProps {
  seat: SeatData;
  selected: boolean;
  highlighted: boolean;
  onToggle: (seatId: string) => void;
  onHover: (seat: SeatData | null) => void;
}

export const Seat: React.FC<SeatProps> = ({
  seat,
  selected,
  highlighted,
  onToggle,
  onHover,
}) => {
  const isInteractive = seat.status === "available";

  return (
    <motion.button
      type="button"
      aria-label={`Seat ${seat.row}${seat.number} ${seat.status}`}
      disabled={!isInteractive}
      onClick={() => onToggle(seat.id)}
      onMouseEnter={() => onHover(seat)}
      onMouseLeave={() => onHover(null)}
      whileHover={isInteractive ? { scale: 1.06 } : undefined}
      whileTap={isInteractive ? { scale: 0.96 } : undefined}
      className={cn(
        "h-8 w-8 rounded-md border text-[10px] font-semibold transition-all duration-200",
        "md:h-9 md:w-9 md:text-xs",
        seat.status === "available" && "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        seat.status === "booked" && "border-rose-200 bg-rose-100 text-rose-500",
        seat.status === "disabled" && "border-slate-200 bg-slate-100 text-slate-400",
        selected && "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/30",
        highlighted && !selected && "ring-2 ring-amber-300 ring-offset-1",
      )}
    >
      {seat.row}
      {seat.number}
    </motion.button>
  );
};
