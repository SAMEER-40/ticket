import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/layout/page-transition";
import { ArrowRight, BarChart3, CalendarCheck2, ShieldCheck, Ticket } from "lucide-react";
import { useAuth } from "@/auth/auth-context";
import { useNavigate } from "react-router";

const OrganizersLandingPage: React.FC = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();

  const navigate = useNavigate();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="app-shell text-slate-900">
      {/* Nav */}
      <div className="container mx-auto flex items-center justify-between px-4 py-6">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">
          Organizer Suite
        </div>
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
                onClick={() => logout()}
              >
                Log out
              </Button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Button className="cursor-pointer" onClick={() => navigate("/login")}>
                Log in
              </Button>
            </div>
        )}
      </div>

      <PageTransition className="container mx-auto px-4 py-8 md:py-14">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Create, Manage, and Sell Events Tickets with Ease
            </h1>
            <p className="text-lg text-slate-600">
              A complete platform for event organizers to create events, sell
              tickets, and validate attendees with QR Codes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                className="cursor-pointer"
                onClick={() => navigate("/dashboard/events")}
              >
                Create an Event <ArrowRight className="size-4" />
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>Browse Events</Button>
            </div>
          </div>
          {/* Right Column */}
          <div className="aspect-square w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-slate-300 shadow-xl shadow-slate-900/10">
            <img
              src="organizers-landing-hero.png"
              alt="A busy concert"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              title: "Create in Minutes",
              text: "Spin up event pages, schedule sales windows, and publish instantly.",
              icon: CalendarCheck2,
            },
            {
              title: "Track Performance",
              text: "Monitor ticket demand and improve your conversions with clean dashboards.",
              icon: BarChart3,
            },
            {
              title: "Secure Validation",
              text: "Use QR-based entry and staff validation tools for smooth check-ins.",
              icon: ShieldCheck,
            },
          ].map((item) => (
            <div key={item.title} className="surface-card border-slate-200 p-5">
              <item.icon className="mb-3 size-5 text-primary" />
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-[url(/event-image-2.webp)] bg-cover bg-center shadow-md">
          <div className="bg-slate-950/60 p-8 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Organizer Growth</p>
                <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">
                  Run premium events with a modern ticketing workflow
                </h2>
                <p className="mt-2 text-sm text-slate-200 md:text-base">
                  Create events, configure ticket types, and manage attendees without switching tools.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => navigate("/dashboard/events")}>Start Now <ArrowRight className="size-4" /></Button>
                <Button variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20" onClick={() => navigate("/")}>Browse Public Events</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Events Published", value: "1,200+" },
            { label: "Tickets Processed", value: "85k+" },
            { label: "Avg. Setup Time", value: "< 10 min" },
            { label: "Organizer Rating", value: "4.9/5" },
          ].map((metric) => (
            <div key={metric.label} className="surface-card border-slate-200 p-4 text-center">
              <Ticket className="mx-auto mb-2 size-4 text-primary" />
              <p className="text-xl font-bold text-slate-900">{metric.value}</p>
              <p className="text-xs text-slate-600">{metric.label}</p>
            </div>
          ))}
        </div>
      </PageTransition>
    </div>
  );
};

export default OrganizersLandingPage;
