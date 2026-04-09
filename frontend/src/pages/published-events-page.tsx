import RandomEventImage from "@/components/random-event-image";
import { PageTransition } from "@/components/layout/page-transition";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  PublishedEventDetails,
  PublishedEventTicketTypeDetails,
} from "@/domain/domain";
import { getPublishedEvent } from "@/lib/api";
import { AlertCircle, ChevronLeft, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link, useNavigate, useParams } from "react-router";

const PublishedEventsPage: React.FC = () => {
  const { isAuthenticated, isLoading, signinRedirect, signoutRedirect } =
    useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [error, setError] = useState<string | undefined>();
  const [publishedEvent, setPublishedEvent] = useState<
    PublishedEventDetails | undefined
  >();
  const [selectedTicketType, setSelectedTicketType] = useState<
    PublishedEventTicketTypeDetails | undefined
  >();

  useEffect(() => {
    if (!id) {
      setError("ID must be provided!");
      return;
    }

    const doUseEffect = async () => {
      try {
        const eventData = await getPublishedEvent(id);
        setPublishedEvent(eventData);
        if (eventData.ticketTypes.length > 0) {
          setSelectedTicketType(eventData.ticketTypes[0]);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else if (typeof err === "string") {
          setError(err);
        } else {
          setError("An unknown error has occurred");
        }
      }
    };
    doUseEffect();
  }, [id]);

  if (error) {
    return (
      <div className="app-shell min-h-screen text-slate-900">
        <Alert variant="destructive" className="mx-auto mt-8 max-w-3xl border-red-300 bg-red-50 text-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="app-shell min-h-screen text-slate-900">
      {/* Nav */}
      <div className="flex justify-between p-4 container mx-auto">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ChevronLeft className="size-4" /> Back
        </Button>
        {isAuthenticated ? (
          <div className="flex gap-4">
            <Button
              onClick={() => navigate("/dashboard/events")}
              className="cursor-pointer"
            >
              Dashboard
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => signoutRedirect()}
            >
              Log out
            </Button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Button className="cursor-pointer" onClick={() => signinRedirect()}>
              Log in
            </Button>
          </div>
        )}
      </div>

      <PageTransition className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="grid grid-cols-2 gap-8 max-w-5xl mx-auto mb-8">
          {/* Left Column */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{publishedEvent?.name}</h1>
            <p className="text-lg flex gap-2 text-slate-600">
              <MapPin />
              {publishedEvent?.venue}
            </p>
          </div>
          {/* Right Column */}
          <div className="surface-card w-full max-w-sm overflow-hidden">
            <RandomEventImage />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Available Tickets</h2>
        <div className="flex gap-2">
          {/* Left */}
          <div className="w-1/2">
            {publishedEvent?.ticketTypes?.map((ticketType) => (
              <Card
                className="surface-card cursor-pointer gap-0 mb-2 border-slate-200 text-slate-900 transition-all hover:-translate-y-0.5"
                key={ticketType.id}
                onClick={() => setSelectedTicketType(ticketType)}
              >
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{ticketType.name}</h3>
                    <span className="text-xl font-bold ">
                      ${ticketType.price}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm">
                    {ticketType.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right */}
          <div className="w-1/2 text-slate-900">
            <div className="surface-card rounded-lg border-slate-200 p-6">
              <h2 className="text-2xl font-bold">{selectedTicketType?.name}</h2>
              <div className="mb-6">
                <span className="text-3xl font-bold">
                  ${selectedTicketType?.price}
                </span>
              </div>
              <div className="mb-6">
                  <p className="text-slate-600">
                    {selectedTicketType?.description}
                  </p>
                </div>
                <Link
                  to={`/events/${publishedEvent?.id}/purchase/${selectedTicketType?.id}`}
                >
                  <Button className="w-full cursor-pointer">
                    Purchase Ticket
                  </Button>
                </Link>
              </div>
            </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default PublishedEventsPage;
