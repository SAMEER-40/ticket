import { PublishedEventSummary } from "@/domain/domain";
import { Card } from "./ui/card";
import { Calendar, Heart, MapPin, Share2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router";
import RandomEventImage from "./random-event-image";

interface PublishedEventCardProperties {
  publishedEvent: PublishedEventSummary;
}

const PublishedEventCard: React.FC<PublishedEventCardProperties> = ({
  publishedEvent,
}) => {
  return (
    <Link to={`/events/${publishedEvent.id}`}>
      <Card className="group h-full py-0 overflow-hidden gap-2 border-white/60 bg-white/85 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10">
        {/* Card Image */}
        <div className="h-[180px] overflow-hidden">
          <RandomEventImage />
        </div>
        <div className="px-3 pt-1">
          <h3 className="text-xl font-semibold text-slate-900">{publishedEvent.name}</h3>
        </div>
        <div className="px-3 pb-1">
          <div className="flex gap-2 text-sm mb-2 text-slate-600">
            <MapPin className="w-5" /> {publishedEvent.venue}
          </div>
          <div className="flex gap-2 text-sm mb-2 text-slate-600">
            {publishedEvent.start && publishedEvent.end ? (
              <div className="flex gap-2">
                <Calendar className="w-5" />{" "}
                {format(publishedEvent.start, "PP")} -{" "}
                {format(publishedEvent.end, "PP")}
              </div>
            ) : (
              <div className="flex gap-2">
                <Calendar />
                Dates TBD
              </div>
            )}
          </div>
          <div className="mt-3 flex justify-between p-2 border-t border-slate-200 text-slate-500">
            <button className="cursor-pointer">
              <Heart />
            </button>
            <button className="cursor-pointer">
              <Share2 />
            </button>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default PublishedEventCard;
