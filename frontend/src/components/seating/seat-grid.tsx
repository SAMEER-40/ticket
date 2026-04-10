import { Seat, SeatData } from "@/components/seating/seat";
import { SeatFilter } from "@/components/seating/seat-filters";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

interface SeatGridProps {
  seats: SeatData[];
  selectedSeatIds: string[];
  onToggleSeat: (seatId: string) => void;
  activeFilter: SeatFilter;
}

const getRowWeight = (row: string) => {
  const code = row.charCodeAt(0) - 64;
  return Math.abs(code - 4);
};

export const SeatGrid: React.FC<SeatGridProps> = ({
  seats,
  selectedSeatIds,
  onToggleSeat,
  activeFilter,
}) => {
  const [hoveredSeat, setHoveredSeat] = useState<SeatData | null>(null);

  const highlightedSeats = useMemo(() => {
    const available = seats.filter((seat) => seat.status === "available");
    if (!available.length) {
      return new Set<string>();
    }

    let ranked = [...available];
    if (activeFilter === "best") {
      ranked.sort((a, b) => {
        const aCenter = Math.abs(a.number - 5.5) + getRowWeight(a.row);
        const bCenter = Math.abs(b.number - 5.5) + getRowWeight(b.row);
        return aCenter - bCenter;
      });
    } else if (activeFilter === "cheapest") {
      ranked.sort((a, b) => a.price - b.price);
    } else {
      ranked.sort((a, b) => getRowWeight(a.row) - getRowWeight(b.row));
    }

    return new Set(ranked.slice(0, 12).map((seat) => seat.id));
  }, [activeFilter, seats]);

  const rows = useMemo(() => {
    const grouped = new Map<string, SeatData[]>();
    for (const seat of seats) {
      if (!grouped.has(seat.row)) {
        grouped.set(seat.row, []);
      }
      grouped.get(seat.row)?.push(seat);
    }
    return [...grouped.entries()].map(([row, values]) => ({
      row,
      seats: values.sort((a, b) => a.number - b.number),
    }));
  }, [seats]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-100/70 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Stage
      </div>

      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white/70 p-4">
        {rows.map((row) => (
          <motion.div
            key={row.row}
            layout
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <span className="w-5 text-xs font-semibold text-slate-500">{row.row}</span>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {row.seats.map((seat) => (
                <Seat
                  key={seat.id}
                  seat={seat}
                  selected={selectedSeatIds.includes(seat.id)}
                  highlighted={highlightedSeats.has(seat.id)}
                  onToggle={onToggleSeat}
                  onHover={setHoveredSeat}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="min-h-10 text-sm text-slate-600">
        {hoveredSeat ? (
          <p>
            Hovering {hoveredSeat.row}
            {hoveredSeat.number} - ${hoveredSeat.price.toFixed(2)}
          </p>
        ) : (
          <p>Hover over a seat to preview details.</p>
        )}
      </div>
    </div>
  );
};
