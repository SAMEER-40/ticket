export const SeatLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-slate-600">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm border border-emerald-200 bg-emerald-50" />
        Available
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm border border-primary bg-primary" />
        Selected
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm border border-rose-200 bg-rose-100" />
        Booked
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm border border-slate-200 bg-slate-100" />
        Disabled
      </div>
    </div>
  );
};
