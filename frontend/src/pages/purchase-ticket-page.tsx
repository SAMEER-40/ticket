import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/layout/page-transition";
import { AppFooter } from "@/components/layout/app-footer";
import { SeatGrid } from "@/components/seating/seat-grid";
import { SeatFilters, SeatFilter } from "@/components/seating/seat-filters";
import { SeatLegend } from "@/components/seating/seat-legend";
import { SeatData } from "@/components/seating/seat";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { purchaseTicket } from "@/lib/api";
import { CheckCircle, ChevronLeft, CreditCard } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/auth/auth-context";
import { useNavigate, useParams } from "react-router";

const PurchaseTicketPage: React.FC = () => {
  const { eventId, ticketTypeId } = useParams();
  const { isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | undefined>();
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    cardNumber?: string;
    cardholderName?: string;
    seats?: string;
  }>({});
  const [isPurchaseSuccess, setIsPurchaseASuccess] = useState(false);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [activeSeatFilter, setActiveSeatFilter] = useState<SeatFilter>("best");

  const seats = useMemo<SeatData[]>(() => {
    const rows = ["A", "B", "C", "D", "E", "F", "G"];
    const generated: SeatData[] = [];

    for (const row of rows) {
      for (let number = 1; number <= 10; number += 1) {
        const rowDistance = Math.abs(row.charCodeAt(0) - "D".charCodeAt(0));
        const basePrice = 25 + rowDistance * 6 + Math.abs(number - 5.5) * 1.8;
        let status: SeatData["status"] = "available";

        if ((row === "A" && [1, 10].includes(number)) || (row === "G" && [1, 2, 9, 10].includes(number))) {
          status = "disabled";
        }
        if ((row === "C" && [4, 5].includes(number)) || (row === "E" && [7].includes(number))) {
          status = "booked";
        }

        generated.push({
          id: `${row}-${number}`,
          row,
          number,
          price: Number(basePrice.toFixed(2)),
          status,
        });
      }
    }

    return generated;
  }, []);

  const selectedSeats = useMemo(
    () => seats.filter((seat) => selectedSeatIds.includes(seat.id)),
    [seats, selectedSeatIds],
  );

  const seatsTotal = useMemo(
    () => selectedSeats.reduce((sum, seat) => sum + seat.price, 0),
    [selectedSeats],
  );

  const validateFields = () => {
    const nextErrors: { cardNumber?: string; cardholderName?: string; seats?: string } = {};
    const digitsOnly = cardNumber.replace(/\s+/g, "");

    if (!/^\d{16}$/.test(digitsOnly)) {
      nextErrors.cardNumber = "Card number must be exactly 16 digits.";
    }

    if (!/^[A-Za-z ]{2,60}$/.test(cardholderName.trim())) {
      nextErrors.cardholderName = "Enter a valid cardholder name.";
    }

    if (selectedSeatIds.length === 0) {
      nextErrors.seats = "Please select at least one seat.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  useEffect(() => {
    if (!isPurchaseSuccess) {
      return;
    }
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPurchaseSuccess]);

  const handlePurchase = async () => {
    setError(undefined);

    if (!validateFields()) {
      return;
    }

    if (isLoading || !user?.access_token || !eventId || !ticketTypeId) {
      return;
    }
    try {
      await purchaseTicket(user.access_token, eventId, ticketTypeId);
      setIsPurchaseASuccess(true);
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

  const toggleSeatSelection = (seatId: string) => {
    const seat = seats.find((item) => item.id === seatId);
    if (!seat || seat.status !== "available") {
      return;
    }

    setSelectedSeatIds((current) =>
      current.includes(seatId)
        ? current.filter((id) => id !== seatId)
        : [...current, seatId],
    );

    if (fieldErrors.seats) {
      setFieldErrors((prev) => ({ ...prev, seats: undefined }));
    }
  };

  if (isPurchaseSuccess) {
    return (
      <div className="app-shell flex min-h-screen items-center">
        <div className="mx-auto max-w-md p-8 text-center">
          <div className="surface-card border-slate-200 p-8 text-slate-900">
            <div className="space-y-2">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-green-600">Thank you!</h2>
              <p className="text-gray-600">
                Your ticket purchase was successful.
              </p>
              <p className="text-gray-600 text-sm">
                Redirecting to home page in a few seconds...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen text-slate-900">
      <div className="mx-auto max-w-md px-2 pt-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ChevronLeft className="size-4" /> Back
        </Button>
      </div>
      <PageTransition className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="surface-card border-slate-200 p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Select Seats</h2>
              <p className="text-sm text-slate-600">Frontend-only smart seat map using mock availability and pricing.</p>
            </div>

            <div className="mb-4">
              <SeatFilters active={activeSeatFilter} onChange={setActiveSeatFilter} />
            </div>
            <SeatLegend />

            <div className="mt-4">
              <SeatGrid
                seats={seats}
                selectedSeatIds={selectedSeatIds}
                onToggleSeat={toggleSeatSelection}
                activeFilter={activeSeatFilter}
              />
            </div>

            {fieldErrors.seats && (
              <p className="mt-3 text-xs text-red-600">{fieldErrors.seats}</p>
            )}
          </div>

          <div className="surface-card space-y-4 border-slate-200 p-6">
          {error && (
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="text-red-500 text-sm">
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p className="font-semibold">Selected Seats: {selectedSeatIds.length || 0}</p>
            <p className="text-xs text-slate-600">
              {selectedSeats.length > 0
                ? selectedSeats.map((seat) => `${seat.row}${seat.number}`).join(", ")
                : "No seats selected"}
            </p>
            <p className="mt-2 font-semibold">Seat Total: ${seatsTotal.toFixed(2)}</p>
          </div>

          {/* Credit Card Number */}
          <div className="space-y-2">
            <Label className="text-slate-600">Credit Card Number</Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="bg-white pl-10"
                value={cardNumber}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/\D/g, "").slice(0, 16);
                  const grouped = sanitized.replace(/(.{4})/g, "$1 ").trim();
                  setCardNumber(grouped);
                  if (fieldErrors.cardNumber) {
                    setFieldErrors((prev) => ({ ...prev, cardNumber: undefined }));
                  }
                }}
              />
              <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
            {fieldErrors.cardNumber && (
              <p className="text-xs text-red-600">{fieldErrors.cardNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-600">Cardholder Name </Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="John Smith"
                className="bg-white pl-10"
                value={cardholderName}
                onChange={(e) => {
                  setCardholderName(e.target.value);
                  if (fieldErrors.cardholderName) {
                    setFieldErrors((prev) => ({ ...prev, cardholderName: undefined }));
                  }
                }}
              />
              <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
            {fieldErrors.cardholderName && (
              <p className="text-xs text-red-600">{fieldErrors.cardholderName}</p>
            )}
          </div>

          <div className="flex justify-center">
            <Button
              className="cursor-pointer w-full"
              onClick={handlePurchase}
            >
              Purchase Ticket ({selectedSeatIds.length || 0})
            </Button>
          </div>

          <div className="flex items-center justify-center text-xs text-slate-500">
            This is a mock page, no payment details should be entered.
          </div>
          </div>
        </div>
      </PageTransition>
      <AppFooter />
    </div>
  );
};

export default PurchaseTicketPage;
