import NavBar from "@/components/nav-bar";
import { PageHeader } from "@/components/layout/page-header";
import { PageTransition } from "@/components/layout/page-transition";
import { SimplePagination } from "@/components/simple-pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  EventSummary,
  EventStatusEnum,
  SpringBootPagination,
} from "@/domain/domain";
import { deleteEvent, listEvents } from "@/lib/api";
import {
  AlertCircle,
  Calendar,
  Clock,
  Edit,
  MapPin,
  Tag,
  Trash,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link } from "react-router";

const DashboardListEventsPage: React.FC = () => {
  const { isLoading, user } = useAuth();
  const [events, setEvents] = useState<
    SpringBootPagination<EventSummary> | undefined
  >();
  const [error, setError] = useState<string | undefined>();
  const [deleteEventError, setDeleteEventError] = useState<
    string | undefined
  >();

  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<
    EventSummary | undefined
  >();

  useEffect(() => {
    if (isLoading || !user?.access_token) {
      return;
    }
    refreshEvents(user.access_token);
  }, [isLoading, user, page]);

  const refreshEvents = async (accessToken: string) => {
    try {
      setEvents(await listEvents(accessToken, page));
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

  const formatDate = (date?: Date) => {
    if (!date) {
      return "TBD";
    }
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date?: Date) => {
    if (!date) {
      return "";
    }
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatusBadge = (status: EventStatusEnum) => {
    switch (status) {
      case EventStatusEnum.DRAFT:
        return "bg-gray-700 text-gray-200";
      case EventStatusEnum.PUBLISHED:
        return "bg-green-700 text-green-100";
      case EventStatusEnum.CANCELLED:
        return "bg-red-700 text-red-100";
      case EventStatusEnum.COMPLETED:
        return "bg-blue-700 text-blue-100";
      default:
        return "bg-gray-700 text-gray-200";
    }
  };

  const handleOpenDeleteEventDialog = (eventToDelete: EventSummary) => {
    setEventToDelete(undefined);
    setEventToDelete(eventToDelete);
    setDialogOpen(true);
  };

  const handleCancelDeleteEventDialog = () => {
    setEventToDelete(undefined);
    setEventToDelete(undefined);
    setDialogOpen(false);
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete || isLoading || !user?.access_token) {
      return;
    }

    try {
      setDeleteEventError(undefined);
      await deleteEvent(user.access_token, eventToDelete.id);
      setEventToDelete(undefined);
      setDialogOpen(false);
      refreshEvents(user.access_token);
    } catch (err) {
      if (err instanceof Error) {
        setDeleteEventError(err.message);
      } else if (typeof err === "string") {
        setDeleteEventError(err);
      } else {
        setDeleteEventError("An unknown error has occurred");
      }
    }
  };

  if (error) {
    return (
      <div className="app-shell">
        <NavBar />
        <div className="page-wrap">
          <Alert variant="destructive" className="surface-card border-red-300 bg-red-50 text-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <NavBar />

      <PageTransition className="page-wrap">
        <PageHeader
          title="Your Events"
          description="Create, manage, and publish your event portfolio."
          action={
            <Link to="/dashboard/events/create">
              <Button className="cursor-pointer">Create Event</Button>
            </Link>
          }
        />

        {/* Event Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {events?.content.map((eventItem) => (
            <Card className="surface-card h-full border-slate-200 text-slate-900">
              <CardHeader>
                <div className="flex justify-between">
                  <h3 className="font-bold text-xl">{eventItem.name}</h3>
                  <span
                    className={`flex items-center px-2 py-1 rounded-lg text-xs ${formatStatusBadge(eventItem.status)}`}
                  >
                    {eventItem.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Event Start & End */}
                <div className="flex space-x-2">
                  <Calendar className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-medium">
                      {formatDate(eventItem.start)} to{" "}
                      {formatDate(eventItem.end)}
                    </p>
                    <p className="text-slate-600">
                      {formatTime(eventItem.start)} -{" "}
                      {formatTime(eventItem.end)}
                    </p>
                  </div>
                </div>
                {/* Sales start and end */}
                <div className="flex space-x-2">
                  <Clock className="h-5 w-5 text-slate-500" />
                  <div>
                    <h4 className="font-medium">Sales Period</h4>
                    <p className="text-slate-600">
                      {formatDate(eventItem.salesStart)} to{" "}
                      {formatDate(eventItem.salesEnd)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <MapPin className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-medium">{eventItem.venue}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-slate-500" />
                  <div>
                    <h4 className="font-medium">Ticket Types</h4>
                    <ul>
                      {eventItem.ticketTypes.map((ticketType) => (
                        <li
                          key={ticketType.id}
                          className="flex gap-2 text-slate-600"
                        >
                          <span>{ticketType.name}</span>
                          <span>${ticketType.price}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Link to={`/dashboard/events/update/${eventItem.id}`}>
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                  >
                    <Edit />
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => handleOpenDeleteEventDialog(eventItem)}
                >
                  <Trash />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </PageTransition>
      <div className="flex justify-center py-8">
        {events && (
          <SimplePagination pagination={events} onPageChange={setPage} />
        )}
      </div>
      <AlertDialog open={dialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete your event '{eventToDelete?.name}' and cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteEventError && (
            <Alert variant="destructive" className="border-red-700">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{deleteEventError}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDeleteEventDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteEvent()}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardListEventsPage;
