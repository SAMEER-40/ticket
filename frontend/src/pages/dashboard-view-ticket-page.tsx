import { TicketDetails, TicketStatus } from "@/domain/domain";
import { PageTransition } from "@/components/layout/page-transition";
import NavBar from "@/components/nav-bar";
import { Button } from "@/components/ui/button";
import { getTicket, getTicketQr } from "@/lib/api";
import { format } from "date-fns";
import { Calendar, ChevronLeft, DollarSign, MapPin, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate, useParams } from "react-router";

const DashboardViewTicketPage: React.FC = () => {
  const [ticket, setTicket] = useState<TicketDetails | undefined>();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | undefined>();
  const [isQrLoading, setIsQrCodeLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const { id } = useParams();
  const { isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || !user?.access_token || !id) {
      return;
    }

    const doUseEffect = async (accessToken: string, id: string) => {
      try {
        setIsQrCodeLoading(true);
        setError(undefined);

        setTicket(await getTicket(accessToken, id));
        setQrCodeUrl(URL.createObjectURL(await getTicketQr(accessToken, id)));
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else if (typeof err === "string") {
          setError(err);
        } else {
          setError("An unknown error has occurred");
        }
      } finally {
        setIsQrCodeLoading(false);
      }
    };

    doUseEffect(user?.access_token, id);

    return () => {
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
  }, [user?.access_token, isLoading, id]);

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.PURCHASED:
        return "text-green-400";
      case TicketStatus.CANCELLED:
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  if (!ticket) {
    return <p>Loading..</p>;
  }

  return (
    <div className="app-shell min-h-screen text-slate-900">
      <NavBar />
      <div className="mx-auto w-full max-w-md px-4 pt-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ChevronLeft className="size-4" /> Back
        </Button>
      </div>
      <PageTransition className="mx-auto flex w-full max-w-lg items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full">
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-950 p-10 shadow-2xl">
          {/* Status */}
          <div className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full mb-8 text-center">
            <span
              className={`text-sm font-medium ${getStatusColor(ticket.status)}`}
            >
              {ticket?.status}
            </span>
          </div>

          <div className="mb-2">
            <h1 className="text-2xl font-bold mb-2">{ticket.eventName}</h1>
            <div className="flex items-center gap-2 text-purple-200">
              <MapPin className="w-4" />
              <span>{ticket.eventVenue}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-purple-300 mb-8">
            <Calendar className="w-4 text-purple-200" />
            <div>
              {format(ticket.eventStart, "Pp")} -{" "}
              {format(ticket.eventEnd, "Pp")}
            </div>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <div className="w-32 h-32 flex items-center justify-center">
                {/* Loading */}
                {isQrLoading && (
                  <div className="text-xs text-center p2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 mb-2 mx-auto"></div>
                    <div className="text-gray-800">Loading QR...</div>
                  </div>
                )}
                {/* error */}
                {error && (
                  <div className="text-red-400 text-sm text-center p-2">
                    <div className="mb-1">⚠️</div>
                    {error}
                  </div>
                )}
                {/* Display QR */}
                {qrCodeUrl && !isQrLoading && !error && (
                  <img
                    src={qrCodeUrl}
                    alt="QR Code for event"
                    className="w-full h-full object-contain rounded-large"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-purple-200 text-sm">
              Present this QR code at the venue for entry
            </p>
          </div>

          <div className="space-y-2 mb-8">
            <div className="flex items-center gap-2">
              <Tag className="w-5 text-purple-200" />
              <span className="font-semibold">{ticket.description}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 text-purple-200" />
              <span className="font-semibold">{ticket.price}</span>
            </div>
          </div>

          <div className="text-center mb-2">
            <h4 className="text-sm font-semibold font-mono">Ticket ID</h4>
            <p className="text-purple-200 text-sm font-mono">{ticket.id}</p>
          </div>
        </div>
      </div>
      </PageTransition>
    </div>
  );
};

export default DashboardViewTicketPage;
