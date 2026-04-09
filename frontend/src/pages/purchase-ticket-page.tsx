import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/layout/page-transition";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { purchaseTicket } from "@/lib/api";
import { CheckCircle, ChevronLeft, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
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
  }>({});
  const [isPurchaseSuccess, setIsPurchaseASuccess] = useState(false);

  const validateFields = () => {
    const nextErrors: { cardNumber?: string; cardholderName?: string } = {};
    const digitsOnly = cardNumber.replace(/\s+/g, "");

    if (!/^\d{16}$/.test(digitsOnly)) {
      nextErrors.cardNumber = "Card number must be exactly 16 digits.";
    }

    if (!/^[A-Za-z ]{2,60}$/.test(cardholderName.trim())) {
      nextErrors.cardholderName = "Enter a valid cardholder name.";
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
      <PageTransition className="mx-auto max-w-md py-12">
        <div className="surface-card space-y-4 border-slate-200 p-6">
          {error && (
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="text-red-500 text-sm">
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

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
              className="cursor-pointer"
              onClick={handlePurchase}
            >
              Purchase Ticket
            </Button>
          </div>

          <div className="flex items-center justify-center text-xs text-slate-500">
            This is a mock page, no payment details should be entered.
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default PurchaseTicketPage;
