import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export type SeatFilter = "best" | "cheapest" | "closest";

interface SeatFiltersProps {
  active: SeatFilter;
  onChange: (filter: SeatFilter) => void;
}

const FILTERS: Array<{ id: SeatFilter; label: string }> = [
  { id: "best", label: "Best" },
  { id: "cheapest", label: "Cheapest" },
  { id: "closest", label: "Closest" },
];

export const SeatFilters: React.FC<SeatFiltersProps> = ({ active, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => (
        <motion.div key={filter.id} layout>
          <Button
            type="button"
            size="sm"
            variant={active === filter.id ? "default" : "outline"}
            onClick={() => onChange(filter.id)}
          >
            {filter.label}
          </Button>
        </motion.div>
      ))}
    </div>
  );
};
