import NavBar from "@/components/nav-bar";
import { PageHeader } from "@/components/layout/page-header";
import { PageTransition } from "@/components/layout/page-transition";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  CreateEventRequest,
  CreateTicketTypeRequest,
  EventDetails,
  EventStatusEnum,
  UpdateEventRequest,
  UpdateTicketTypeRequest,
} from "@/domain/domain";
import { createEvent, getEvent, updateEvent } from "@/lib/api";
import { format } from "date-fns";
import {
  AlertCircle,
  CalendarIcon,
  Edit,
  Plus,
  Ticket,
  Trash,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/auth/auth-context";
import { useNavigate, useParams } from "react-router";

interface DateTimeSelectProperties {
  date: Date | undefined;
  setDate: (date: Date) => void;
  time: string | undefined;
  setTime: (time: string) => void;
  enabled: boolean;
  setEnabled: (isEnabled: boolean) => void;
  timeError?: string;
}

const DateTimeSelect: React.FC<DateTimeSelectProperties> = ({
  date,
  setDate,
  time,
  setTime,
  enabled,
  setEnabled,
  timeError,
}) => {
  return (
    <div className="flex gap-2 items-center">
      <Switch checked={enabled} onCheckedChange={setEnabled} />

      {enabled && (
        <div className="w-full flex gap-2">
          {/* Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button className="bg-gray-900 border-gray-700 border">
                <CalendarIcon />
                {date ? format(date, "PPP") : <span>Pick a Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  if (!selectedDate) {
                    return;
                  }
                  const displayedYear = selectedDate.getFullYear();
                  const displayedMonth = selectedDate.getMonth();
                  const displayedDay = selectedDate.getDate();

                  const correctedDate = new Date(
                    Date.UTC(displayedYear, displayedMonth, displayedDay),
                  );

                  setDate(correctedDate);
                }}
                className="rounded-md border shadow"
              />
            </PopoverContent>
          </Popover>
          {/* Time */}
          <div className="flex gap-2 items-center">
            <Input
              type="time"
              className="w-[90px] bg-gray-900 text-white border-gray-700 border [&::-webkit-calendar-picker-indicator]:invert"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>
      )}
      {timeError && <p className="text-xs text-red-600">{timeError}</p>}
    </div>
  );
};

const generateTempId = () => `temp_${crypto.randomUUID()}`;
const isTempId = (id: string | undefined) => id && id.startsWith("temp_");

interface TicketTypeData {
  id: string | undefined;
  name: string;
  price: number;
  totalAvailable?: number;
  description: string;
}

interface EventData {
  id: string | undefined;
  name: string;
  startDate: Date | undefined;
  startTime: string | undefined;
  endDate: Date | undefined;
  endTime: string | undefined;
  venueDetails: string;
  salesStartDate: Date | undefined;
  salesStartTime: string | undefined;
  salesEndDate: Date | undefined;
  salesEndTime: string | undefined;
  ticketTypes: TicketTypeData[];
  status: EventStatusEnum;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
}

const DashboardManageEventPage: React.FC = () => {
  const { isLoading, user } = useAuth();
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [eventData, setEventData] = useState<EventData>({
    id: undefined,
    name: "",
    startDate: undefined,
    startTime: undefined,
    endDate: undefined,
    endTime: undefined,
    venueDetails: "",
    salesStartDate: undefined,
    salesStartTime: undefined,
    salesEndDate: undefined,
    salesEndTime: undefined,
    ticketTypes: [],
    status: EventStatusEnum.DRAFT,
    createdAt: undefined,
    updatedAt: undefined,
  });

  const [currentTicketType, setCurrentTicketType] = useState<
    TicketTypeData | undefined
  >();

  const [dialogOpen, setDialogOpen] = useState(false);

  const [eventDateEnabled, setEventDateEnabled] = useState(false);
  const [eventSalesDateEnabled, setEventSalesDateEnabled] = useState(false);

  const [error, setError] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [ticketTypeErrors, setTicketTypeErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (field: keyof EventData, value: any) => {
    setEventData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (isEditMode && !isLoading && user?.access_token) {
      const fetchEvent = async () => {
        const event: EventDetails = await getEvent(user.access_token, id);
        setEventData({
          id: event.id,
          name: event.name,
          startDate: event.start,
          startTime: event.start
            ? formatTimeFromDate(new Date(event.start))
            : undefined,
          endDate: event.end,
          endTime: event.end
            ? formatTimeFromDate(new Date(event.end))
            : undefined,
          venueDetails: event.venue,
          salesStartDate: event.salesStart,
          salesStartTime: event.salesStart
            ? formatTimeFromDate(new Date(event.salesStart))
            : undefined,
          salesEndDate: event.salesEnd,
          salesEndTime: event.salesEnd
            ? formatTimeFromDate(new Date(event.salesEnd))
            : undefined,
          status: event.status,
          ticketTypes: event.ticketTypes.map((ticket) => ({
            id: ticket.id,
            name: ticket.name,
            description: ticket.description,
            price: ticket.price,
            totalAvailable: ticket.totalAvailable,
          })),
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        });
        setEventDateEnabled(!!(event.start || event.end));
        setEventSalesDateEnabled(!!(event.salesStart || event.salesEnd));
      };
      fetchEvent();
    }
  }, [id, user]);

  const formatTimeFromDate = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const combineDateTime = (date: Date, time: string): Date => {
    const [hours, minutes] = time
      .split(":")
      .map((num) => Number.parseInt(num, 10));

    const combinedDateTime = new Date(date);
    combinedDateTime.setHours(hours);
    combinedDateTime.setMinutes(minutes);
    combinedDateTime.setSeconds(0);

    const utcResult = new Date(
      Date.UTC(
        combinedDateTime.getFullYear(),
        combinedDateTime.getMonth(),
        combinedDateTime.getDate(),
        hours,
        minutes,
        0,
        0,
      ),
    );

    return utcResult;
  };

  const handleEventUpdateSubmit = async (accessToken: string, id: string) => {
    const ticketTypes: UpdateTicketTypeRequest[] = eventData.ticketTypes.map(
      (ticketType) => {
        return {
          id: isTempId(ticketType.id) ? undefined : ticketType.id,
          name: ticketType.name,
          price: ticketType.price,
          description: ticketType.description,
          totalAvailable: ticketType.totalAvailable,
        };
      },
    );

    const request: UpdateEventRequest = {
      id: id,
      name: eventData.name,
      start:
        eventData.startDate && eventData.startTime
          ? combineDateTime(eventData.startDate, eventData.startTime)
          : undefined,
      end:
        eventData.endDate && eventData.endTime
          ? combineDateTime(eventData.endDate, eventData.endTime)
          : undefined,
      venue: eventData.venueDetails,
      salesStart:
        eventData.salesStartDate && eventData.salesStartTime
          ? combineDateTime(eventData.salesStartDate, eventData.salesStartTime)
          : undefined,
      salesEnd:
        eventData.salesEndDate && eventData.salesEndTime
          ? combineDateTime(eventData.salesEndDate, eventData.salesEndTime)
          : undefined,
      status: eventData.status,
      ticketTypes: ticketTypes,
    };

    try {
      await updateEvent(accessToken, id, request);
      navigate("/dashboard/events");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "string") {
        setError(err);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const handleEventCreateSubmit = async (accessToken: string) => {
    const ticketTypes: CreateTicketTypeRequest[] = eventData.ticketTypes.map(
      (ticketType) => {
        return {
          name: ticketType.name,
          price: ticketType.price,
          description: ticketType.description,
          totalAvailable: ticketType.totalAvailable,
        };
      },
    );

    const request: CreateEventRequest = {
      name: eventData.name,
      start:
        eventData.startDate && eventData.startTime
          ? combineDateTime(eventData.startDate, eventData.startTime)
          : undefined,
      end:
        eventData.endDate && eventData.endTime
          ? combineDateTime(eventData.endDate, eventData.endTime)
          : undefined,
      venue: eventData.venueDetails,
      salesStart:
        eventData.salesStartDate && eventData.salesStartTime
          ? combineDateTime(eventData.salesStartDate, eventData.salesStartTime)
          : undefined,
      salesEnd:
        eventData.salesEndDate && eventData.salesEndTime
          ? combineDateTime(eventData.salesEndDate, eventData.salesEndTime)
          : undefined,
      status: eventData.status,
      ticketTypes: ticketTypes,
    };

    try {
      await createEvent(accessToken, request);
      navigate("/dashboard/events");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "string") {
        setError(err);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setFieldErrors({});

    if (isSubmitting) {
      return;
    }

    if (isLoading || !user || !user.access_token) {
      console.error("User not found!");
      return;
    }

    const nextFieldErrors: Record<string, string> = {};
    if (!eventData.name.trim() || eventData.name.trim().length < 3) {
      nextFieldErrors.name = "Event name must be at least 3 characters.";
    }

    if (!eventData.venueDetails.trim() || eventData.venueDetails.trim().length < 10) {
      nextFieldErrors.venue = "Venue details should be at least 10 characters.";
    }

    if (eventDateEnabled) {
      if (!eventData.startDate || !eventData.startTime) {
        nextFieldErrors.start = "Event start date and time are required.";
      }
      if (!eventData.endDate || !eventData.endTime) {
        nextFieldErrors.end = "Event end date and time are required.";
      }
      if (
        eventData.startDate &&
        eventData.startTime &&
        eventData.endDate &&
        eventData.endTime
      ) {
        const start = combineDateTime(eventData.startDate, eventData.startTime);
        const end = combineDateTime(eventData.endDate, eventData.endTime);
        if (start >= end) {
          nextFieldErrors.end = "Event end must be after event start.";
        }
      }
    }

    if (eventSalesDateEnabled) {
      if (!eventData.salesStartDate || !eventData.salesStartTime) {
        nextFieldErrors.salesStart = "Sales start date and time are required.";
      }
      if (!eventData.salesEndDate || !eventData.salesEndTime) {
        nextFieldErrors.salesEnd = "Sales end date and time are required.";
      }
      if (
        eventData.salesStartDate &&
        eventData.salesStartTime &&
        eventData.salesEndDate &&
        eventData.salesEndTime
      ) {
        const salesStart = combineDateTime(
          eventData.salesStartDate,
          eventData.salesStartTime,
        );
        const salesEnd = combineDateTime(eventData.salesEndDate, eventData.salesEndTime);
        if (salesStart >= salesEnd) {
          nextFieldErrors.salesEnd = "Sales end must be after sales start.";
        }
      }
    }

    if (!eventData.ticketTypes.length) {
      nextFieldErrors.ticketTypes = "Add at least one ticket type.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        if (!eventData.id) {
          setError("Event does not have an ID");
          return;
        }
        await handleEventUpdateSubmit(user.access_token, eventData.id);
      } else {
        await handleEventCreateSubmit(user.access_token);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTicketType = () => {
    setTicketTypeErrors({});
    setCurrentTicketType({
      id: undefined,
      name: "",
      price: 0,
      totalAvailable: 0,
      description: "",
    });
    setDialogOpen(true);
  };

  const handleSaveTicketType = () => {
    if (!currentTicketType) {
      return;
    }

    const nextTicketTypeErrors: Record<string, string> = {};
    if (!currentTicketType.name.trim() || currentTicketType.name.trim().length < 2) {
      nextTicketTypeErrors.name = "Ticket type name must be at least 2 characters.";
    }
    if (!Number.isFinite(currentTicketType.price) || currentTicketType.price < 0) {
      nextTicketTypeErrors.price = "Price must be 0 or greater.";
    }
    if (
      currentTicketType.totalAvailable !== undefined &&
      (!Number.isFinite(currentTicketType.totalAvailable) || currentTicketType.totalAvailable < 1)
    ) {
      nextTicketTypeErrors.totalAvailable = "Total available must be at least 1.";
    }
    if (!currentTicketType.description.trim() || currentTicketType.description.trim().length < 5) {
      nextTicketTypeErrors.description = "Description must be at least 5 characters.";
    }

    if (Object.keys(nextTicketTypeErrors).length > 0) {
      setTicketTypeErrors(nextTicketTypeErrors);
      return;
    }

    setTicketTypeErrors({});

    const newTicketTypes = [...eventData.ticketTypes];

    if (currentTicketType.id) {
      const index = newTicketTypes.findIndex(
        (t) => t.id === currentTicketType.id,
      );
      if (index !== -1) {
        newTicketTypes[index] = currentTicketType;
      }
    } else {
      newTicketTypes.push({
        ...currentTicketType,
        id: generateTempId(),
      });
    }

    updateField("ticketTypes", newTicketTypes);
    setDialogOpen(false);
  };

  const handleEditTicketType = (ticketType: TicketTypeData) => {
    setTicketTypeErrors({});
    setCurrentTicketType(ticketType);
    setDialogOpen(true);
  };

  const handleDeleteTicketType = (id: string | undefined) => {
    if (!id) {
      return;
    }
    updateField(
      "ticketTypes",
      eventData.ticketTypes.filter((t) => t.id !== id),
    );
  };

  return (
    <div className="app-shell">
      <NavBar />
      <PageTransition className="page-wrap max-w-3xl">
        <PageHeader
          title={isEditMode ? "Edit Event" : "Create a New Event"}
          description={
            isEditMode
              ? "Update details and ticket setup for this event."
              : "Fill in details to launch your event page and ticket sales."
          }
          showBack
        />
        <div className="mb-6">
          {isEditMode ? (
            <>
              {eventData.id && (
                <p className="text-sm text-slate-500">ID: {eventData.id}</p>
              )}
              {eventData.createdAt && (
                <p className="text-sm text-slate-500">
                  Created At: {format(eventData.createdAt, "PPP")}
                </p>
              )}
              {eventData.updatedAt && (
                <p className="text-sm text-slate-500">
                  Updated At: {format(eventData.updatedAt, "PPP")}
                </p>
              )}
            </>
          ) : (
            <p className="text-slate-600">Fill out the form below to create your event.</p>
          )}
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Event Name */}
          <div>
            <div>
              <label htmlFor="event-name" className="text-sm font-medium">
                Event Name
              </label>
              <Input
                id="event-name"
                className="bg-white"
                placeholder="Event Name"
                value={eventData.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
              )}
            </div>
            <p className="text-slate-500 text-xs">
              This is the public name of your event.
            </p>
          </div>

          {/* Event Start Date Time */}
          <div>
            <label className="text-sm font-medium">Event Start</label>
            <DateTimeSelect
              date={eventData.startDate}
              setDate={(date) => updateField("startDate", date)}
              time={eventData.startTime}
              setTime={(time) => updateField("startTime", time)}
              enabled={eventDateEnabled}
              setEnabled={setEventDateEnabled}
              timeError={fieldErrors.start}
            />
            <p className="text-slate-500 text-xs">
              The date and time that the event starts.
            </p>
          </div>

          {/* Event End Date Time */}
          <div>
            <label className="text-sm font-medium">Event End</label>
            <DateTimeSelect
              date={eventData.endDate}
              setDate={(date) => updateField("endDate", date)}
              time={eventData.endTime}
              setTime={(time) => updateField("endTime", time)}
              enabled={eventDateEnabled}
              setEnabled={setEventDateEnabled}
              timeError={fieldErrors.end}
            />
            <p className="text-slate-500 text-xs">
              The date and time that the event ends.
            </p>
          </div>

          <div>
            <label htmlFor="venue-details" className="text-sm font-medium">
              Venue Details
            </label>
            <Textarea
              id="venue-details"
              className="bg-white min-h-[100px]"
              value={eventData.venueDetails}
              onChange={(e) => updateField("venueDetails", e.target.value)}
              required
            />
            {fieldErrors.venue && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.venue}</p>
            )}
            <p className="text-slate-500 text-xs">
              Details about the venue, please include as much detail as
              possible.
            </p>
          </div>

          {/* Event Sales Start Date Time */}
          <div>
            <label className="text-sm font-medium">Event Sales Start</label>
            <DateTimeSelect
              date={eventData.salesStartDate}
              setDate={(date) => updateField("salesStartDate", date)}
              time={eventData.salesStartTime}
              setTime={(time) => updateField("salesStartTime", time)}
              enabled={eventSalesDateEnabled}
              setEnabled={setEventSalesDateEnabled}
              timeError={fieldErrors.salesStart}
            />
            <p className="text-slate-500 text-xs">
              The date and time that ticket are available to purchase for the
              event.
            </p>
          </div>

          {/* Event Sales End Date Time */}
          <div>
            <label className="text-sm font-medium">Event Sales End</label>
            <DateTimeSelect
              date={eventData.salesEndDate}
              setDate={(date) => updateField("salesEndDate", date)}
              time={eventData.salesEndTime}
              setTime={(time) => updateField("salesEndTime", time)}
              enabled={eventSalesDateEnabled}
              setEnabled={setEventSalesDateEnabled}
              timeError={fieldErrors.salesEnd}
            />
            <p className="text-slate-500 text-xs">
              The date and time that ticket are available to purchase for the
              event.
            </p>
          </div>

          {/* Ticket Types */}
          <div>
            <Card className="surface-card border-slate-200 text-slate-900">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle className="flex gap-2 items-center text-sm">
                      <Ticket />
                      Ticket Types
                    </CardTitle>
                    <Button
                      type="button"
                      onClick={() => handleAddTicketType()}
                        className="bg-white"
                    >
                      <Plus /> Add Ticket Type
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  {eventData.ticketTypes.map((ticketType) => {
                    return (
                       <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="flex justify-between items-center">
                          {/* Left */}
                          <div>
                            <div className="flex gap-4">
                              <p className="text-small font-medium">
                                {ticketType.name}
                              </p>
                               <Badge variant="outline" className="font-normal text-xs">
                                 ${ticketType.price}
                               </Badge>
                            </div>
                            {ticketType.totalAvailable && (
                               <p className="text-slate-500">
                                 {ticketType.totalAvailable} tickets available
                               </p>
                            )}
                          </div>
                          {/* Right */}
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => handleEditTicketType(ticketType)}
                            >
                              <Edit />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              className="text-red-400"
                              onClick={() =>
                                handleDeleteTicketType(ticketType.id)
                              }
                            >
                              <Trash />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
                {fieldErrors.ticketTypes && (
                  <p className="px-6 pb-2 text-xs text-red-600">{fieldErrors.ticketTypes}</p>
                )}
                 <DialogContent className="border-slate-200 bg-white text-slate-900">
                  <DialogHeader>
                    <DialogTitle>Add Ticket Type</DialogTitle>
                     <DialogDescription className="text-slate-500">
                      Please enter details of the ticket type
                    </DialogDescription>
                  </DialogHeader>

                  {/* Ticket Type Name */}
                  <div className="space-y-1">
                    <Label htmlFor="ticket-type-name">Name</Label>
                    <Input
                      id="ticket-type-name"
                        className="bg-white"
                      value={currentTicketType?.name}
                      onChange={(e) =>
                        setCurrentTicketType(
                          currentTicketType
                            ? { ...currentTicketType, name: e.target.value }
                            : undefined,
                        )
                      }
                      placeholder="e.g General Admission, VIP, etc."
                    />
                    {ticketTypeErrors.name && (
                      <p className="text-xs text-red-600">{ticketTypeErrors.name}</p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    {/* Price */}
                    <div className="space-y-1 w-full">
                      <Label htmlFor="ticket-type-price">Price</Label>
                      <Input
                        id="ticket-type-price"
                        type="number"
                        min={0}
                        value={currentTicketType?.price}
                        onChange={(e) =>
                          setCurrentTicketType(
                            currentTicketType
                              ? {
                                  ...currentTicketType,
                                  price: Number.parseFloat(e.target.value),
                                }
                              : undefined,
                          )
                        }
                         className="bg-white"
                      />
                      {ticketTypeErrors.price && (
                        <p className="text-xs text-red-600">{ticketTypeErrors.price}</p>
                      )}
                    </div>

                    {/* Total Available */}
                    <div className="space-y-1 w-full">
                      <Label htmlFor="ticket-type-total-available">
                        Total Available
                      </Label>
                      <Input
                        id="ticket-type-total-available"
                        type="number"
                        min={1}
                        value={currentTicketType?.totalAvailable}
                        onChange={(e) =>
                          setCurrentTicketType(
                            currentTicketType
                              ? {
                                  ...currentTicketType,
                                  totalAvailable: Number.parseFloat(
                                    e.target.value,
                                  ),
                                }
                              : undefined,
                          )
                        }
                         className="bg-white"
                      />
                      {ticketTypeErrors.totalAvailable && (
                        <p className="text-xs text-red-600">{ticketTypeErrors.totalAvailable}</p>
                      )}
                    </div>
                  </div>

                  {/* Ticket Type Description */}
                  <div className="space-y-1">
                    <Label htmlFor="ticket-type-description">Description</Label>
                    <Textarea
                      id="ticket-type-description"
                       className="bg-white"
                      value={currentTicketType?.description}
                      onChange={(e) =>
                        setCurrentTicketType(
                          currentTicketType
                            ? {
                                ...currentTicketType,
                                description: e.target.value,
                              }
                            : undefined,
                        )
                      }
                    />
                    {ticketTypeErrors.description && (
                      <p className="text-xs text-red-600">{ticketTypeErrors.description}</p>
                    )}
                  </div>
                  <DialogFooter>
                     <Button onClick={handleSaveTicketType}>
                       Save
                     </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Card>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <Label>Status</Label>
            <Select
              value={eventData.status}
              onValueChange={(value) => updateField("status", value)}
            >
               <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Select Event Status" />
              </SelectTrigger>
               <SelectContent className="bg-white text-slate-900">
                <SelectItem value={EventStatusEnum.DRAFT}>Draft</SelectItem>
                <SelectItem value={EventStatusEnum.PUBLISHED}>
                  Published
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-slate-500 text-xs">
              Please select the status of the new event.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="border-red-300 bg-red-50 text-red-900">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Submit"}
            </Button>
          </div>
        </form>
        {/* For Development Only */}
        {/* <p className="mt-8 font-mono text-white">{JSON.stringify(eventData)}</p> */}
      </PageTransition>
    </div>
  );
};

export default DashboardManageEventPage;
