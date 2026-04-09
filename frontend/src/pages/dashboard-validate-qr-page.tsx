import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/layout/page-transition";
import { Input } from "@/components/ui/input";
import NavBar from "@/components/nav-bar";
import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  TicketValidationMethod,
  TicketValidationStatus,
} from "@/domain/domain";
import { AlertCircle, Check, ChevronLeft, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { validateTicket } from "@/lib/api";
import { useAuth } from "@/auth/auth-context";
import { useNavigate } from "react-router";

const DashboardValidateQrPage: React.FC = () => {
  const { isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [isManual, setIsManual] = useState(false);
  const [data, setData] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [validationStatus, setValidationStatus] = useState<
    TicketValidationStatus | undefined
  >();
  const [manualError, setManualError] = useState<string | undefined>();

  const handleReset = () => {
    setIsManual(false);
    setData(undefined);
    setError(undefined);
    setValidationStatus(undefined);
    setManualError(undefined);
  };

  const handleError = (err: unknown) => {
    if (err instanceof Error) {
      setError(err.message);
    } else if (typeof err === "string") {
      setError(err);
    } else {
      setError("An unknown error occurred");
    }
  };

  const handleValidate = async (id: string, method: TicketValidationMethod) => {
    if (!user?.access_token) {
      return;
    }
    try {
      const response = await validateTicket(user.access_token, {
        id,
        method,
      });
      setValidationStatus(response.status);
    } catch (err) {
      handleError(err);
    }
  };

  const handleManualSubmit = () => {
    const trimmedData = (data ?? "").trim();
    if (!trimmedData) {
      setManualError("Please enter a ticket ID.");
      return;
    }

    if (!/^[a-fA-F0-9-]{8,}$/.test(trimmedData)) {
      setManualError("Ticket ID format looks invalid.");
      return;
    }

    setManualError(undefined);
    handleValidate(trimmedData, TicketValidationMethod.MANUAL);
  };

  if (isLoading || !user?.access_token) {
    return <p>Loading...</p>;
  }

  return (
    <div className="app-shell min-h-screen text-slate-900">
      <NavBar />
      <div className="mx-auto flex w-full max-w-sm justify-start px-4 pt-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ChevronLeft className="size-4" /> Back
        </Button>
      </div>
      <PageTransition className="mx-auto mt-6 w-full max-w-sm border border-slate-300 bg-white/85 p-4 rounded-2xl shadow-sm">
        {error && (
          <div>
            <Alert variant="destructive" className="border-red-300 bg-red-50 text-red-900">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        {/* Scanner Viewport */}
        <div className="rounded-lg overflow-hidden mx-auto mb-8 relative">
          <Scanner
            key={`scanner-${data}-${validationStatus}`}
            onScan={(result) => {
              if (result) {
                const qrCodeId = result[0].rawValue;
                setData(qrCodeId);
                handleValidate(qrCodeId, TicketValidationMethod.QR_SCAN);
              }
            }}
            onError={handleError}
          />

          {validationStatus && (
            <div className="absolute inset-0 flex items-center justify-center">
              {validationStatus === TicketValidationStatus.VALID ? (
                <div className="bg-green-500 rounded-full p-4">
                  <Check className="w-20 h-20" />
                </div>
              ) : (
                <div className="bg-red-500 rounded-full p-4">
                  <X className="w-20 h-20" />
                </div>
              )}
            </div>
          )}
        </div>

        {isManual ? (
          <div className="pb-8">
            <Input
              className="mb-8 w-full bg-white text-lg"
              value={data ?? ""}
              onChange={(e) => {
                setData(e.target.value);
                if (manualError) {
                  setManualError(undefined);
                }
              }}
            />
            {manualError && <p className="mb-3 text-sm text-red-600">{manualError}</p>}
            <Button
              className="h-[80px] w-full"
              onClick={handleManualSubmit}
            >
              Submit
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex h-12 items-center justify-center rounded-md border-2 border-slate-300 bg-white font-mono">
              <span>{data || "Scan for Result"}</span>
            </div>
            <Button
              className="my-8 h-[80px] w-full border-2 border-slate-300 bg-white text-xl text-slate-800 hover:bg-slate-100"
              onClick={() => setIsManual(true)}
            >
              Manual
            </Button>
          </div>
        )}

        <Button
          variant="outline"
          className="my-8 h-[80px] w-full text-xl"
          onClick={handleReset}
        >
          Reset
        </Button>
      </PageTransition>
    </div>
  );
};

export default DashboardValidateQrPage;
