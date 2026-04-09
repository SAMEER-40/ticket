import { useAuth } from "react-oidc-context";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Globe,
  Guitar,
  Headphones,
  HeartHandshake,
  Laptop,
  MapPin,
  Quote,
  Search,
  Shield,
  Sparkles,
  Ticket,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PublishedEventSummary, SpringBootPagination } from "@/domain/domain";
import { listPublishedEvents, searchPublishedEvents } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageTransition } from "@/components/layout/page-transition";
import PublishedEventCard from "@/components/published-event-card";
import { SimplePagination } from "@/components/simple-pagination";
import { motion } from "framer-motion";

const AttendeeLandingPage: React.FC = () => {
  const { isAuthenticated, isLoading, signinRedirect, signoutRedirect } =
    useAuth();

  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [publishedEvents, setPublishedEvents] = useState<
    SpringBootPagination<PublishedEventSummary> | undefined
  >();
  const [error, setError] = useState<string | undefined>();
  const [query, setQuery] = useState<string | undefined>();

  useEffect(() => {
    if (query && query.length > 0) {
      queryPublishedEvents();
    } else {
      refreshPublishedEvents();
    }
  }, [page]);

  const refreshPublishedEvents = async () => {
    try {
      setPublishedEvents(await listPublishedEvents(page));
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

  const queryPublishedEvents = async () => {
    if (!query) {
      await refreshPublishedEvents();
      return;
    }

    try {
      setPublishedEvents(await searchPublishedEvents(query, page));
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

  if (error) {
    return (
      <div className="app-shell px-4 py-10 text-slate-900">
        <Alert variant="destructive" className="mx-auto max-w-3xl border-red-200 bg-red-50 text-red-900">
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
    <div className="app-shell text-slate-900">
      {/* Nav */}
      <div className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-sm font-semibold text-slate-700 backdrop-blur">
            <Sparkles className="size-4 text-primary" />
            <span className="tracking-wide">Event Ticket Platform</span>
          </div>
          {isAuthenticated ? (
            <div className="flex gap-4">
              <Button
                onClick={() => navigate("/dashboard")}
                className="cursor-pointer"
              >
                Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate("/organizers")}>Organizer View</Button>
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
      </div>
      <PageTransition>
      {/* Hero */}
      <div className="container mx-auto mb-10 px-4">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[url(/event-image-1.webp)] bg-cover bg-center shadow-xl shadow-slate-900/10">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/65 to-slate-900/35" />
          <div className="absolute -right-10 top-6 h-32 w-32 rounded-full bg-amber-300/30 blur-2xl" />
          <div className="absolute left-8 top-28 h-20 w-20 rounded-full bg-cyan-300/30 blur-2xl" />

          <div className="relative grid min-h-[320px] gap-8 rounded-[2rem] p-8 md:grid-cols-[1.3fr_1fr] md:p-14">
            <div className="z-10">
              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mb-4 max-w-2xl text-3xl font-bold leading-tight text-white md:text-5xl"
              >
                The easiest way to discover and book unforgettable events
              </motion.h1>
              <p className="mb-6 max-w-xl text-sm text-slate-200 md:text-base">
                Explore concerts, meetups, workshops, and festivals. Search fast,
                book securely, and keep all your tickets in one place.
              </p>

              <div className="mb-6 flex max-w-xl gap-2">
              <Input
                className="h-11 border-white/50 bg-white/90 text-slate-900"
                placeholder="Search by event name"
                maxLength={100}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button className="h-11 px-5" onClick={queryPublishedEvents}>
                <Search />
              </Button>
              </div>

              <div className="flex flex-wrap gap-3 text-xs md:text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-slate-100">
                  <Calendar className="size-4" /> Live schedules
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-slate-100">
                  <Ticket className="size-4" /> Instant booking
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-slate-100">
                  <MapPin className="size-4" /> Venue details
                </span>
              </div>
            </div>

            <div className="relative flex items-end md:justify-end">
              <div className="absolute -top-3 left-0 h-24 w-24 overflow-hidden rounded-2xl border border-white/30 shadow-lg md:-left-6">
                <img src="/event-image-2.webp" alt="Live concert crowd" className="h-full w-full object-cover" />
              </div>
              <div className="absolute top-20 right-2 h-20 w-20 overflow-hidden rounded-2xl border border-white/30 shadow-lg md:right-0">
                <img src="/event-image-3.webp" alt="Festival stage lights" className="h-full w-full object-cover" />
              </div>
              <div className="w-full rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur md:max-w-xs">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-300">Trending now</p>
                <p className="mt-2 text-xl font-semibold text-white">City Music Nights</p>
                <p className="mt-1 text-sm text-slate-200">Fri, 8:00 PM - Downtown Arena</p>
                <Button
                  variant="secondary"
                  className="mt-4 w-full justify-between"
                  onClick={() => navigate("/organizers")}
                >
                  Explore as organizer <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto mb-8 px-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-[url(/event-image-4.webp)] bg-cover bg-center p-6 shadow-md">
          <div className="absolute inset-0 bg-slate-950/55" />
          <div className="relative flex flex-col items-start justify-between gap-3 text-white md:flex-row md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Spotlight</p>
              <h3 className="text-2xl font-bold">Summer Festival Week is live</h3>
            </div>
            <Button variant="secondary" onClick={() => setPage(0)}>
              Browse latest events
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto mb-6 grid grid-cols-1 gap-3 px-4 md:grid-cols-3">
        {[
          { title: "Fast Checkout", text: "Buy tickets in seconds with a clean flow." },
          { title: "Trusted Access", text: "Secure login and protected dashboards." },
          { title: "Mobile Ready", text: "Book and manage events on any screen." },
        ].map((item) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="surface-card border-slate-200 p-4"
          >
            <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{item.text}</p>
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto mb-6 px-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { name: "Music", icon: Guitar },
            { name: "Technology", icon: Laptop },
            { name: "Workshops", icon: Briefcase },
            { name: "Sports", icon: Trophy },
          ].map((category, index) => (
            <motion.button
              key={category.name}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04, ease: "easeOut" }}
              className="surface-card flex items-center gap-2 border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-100"
            >
              <category.icon className="size-4 text-primary" />
              <span className="text-sm font-semibold text-slate-800">{category.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="container mx-auto mb-6 px-4">
        <h2 className="text-2xl font-bold text-slate-900">Featured events</h2>
        <p className="text-sm text-slate-600">Updated list of upcoming and popular experiences.</p>
      </div>

      {/* Published Event Cards */}
      <div className="container mx-auto grid grid-cols-1 gap-5 px-4 pb-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {publishedEvents?.content?.map((publishedEvent, index) => (
          <motion.div
            key={publishedEvent.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.03, ease: "easeOut" }}
          >
            <PublishedEventCard publishedEvent={publishedEvent} />
          </motion.div>
        ))}
      </div>

      {publishedEvents && (
        <div className="w-full flex justify-center py-10">
          <SimplePagination
            pagination={publishedEvents}
            onPageChange={setPage}
          />
        </div>
      )}

      <section className="container mx-auto mb-12 px-4">
        <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">How It Works</p>
              <h3 className="text-2xl font-bold text-slate-900">Book tickets in 3 easy steps</h3>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Discover",
                text: "Search events by name and browse curated cards instantly.",
                icon: Globe,
              },
              {
                title: "Reserve",
                text: "Choose your ticket type and complete a secure mock checkout.",
                icon: Shield,
              },
              {
                title: "Enjoy",
                text: "Manage your tickets from dashboard and enter with confidence.",
                icon: CheckCircle2,
              },
            ].map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05, ease: "easeOut" }}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5"
              >
                <step.icon className="mb-3 size-5 text-primary" />
                <h4 className="text-base font-semibold text-slate-900">{step.title}</h4>
                <p className="mt-1 text-sm text-slate-600">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto mb-12 px-4">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-200/40 blur-2xl" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Community</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">Loved by attendees and organizers</h3>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { value: "10k+", label: "Monthly visitors", icon: Users },
                { value: "1.2k", label: "Events listed", icon: Ticket },
                { value: "98%", label: "Positive feedback", icon: HeartHandshake },
                { value: "24/7", label: "Platform uptime", icon: Headphones },
              ].map((metric) => (
                <div key={metric.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <metric.icon className="mb-2 size-4 text-primary" />
                  <p className="text-xl font-bold text-slate-900">{metric.value}</p>
                  <p className="text-xs text-slate-600">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Testimonials</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">What users say</h3>
            <div className="mt-5 space-y-4">
              {[
                {
                  quote:
                    "Clean interface, smooth booking flow, and tickets are always easy to find.",
                  author: "Aarav, attendee",
                },
                {
                  quote:
                    "Publishing events and managing ticket types takes minutes instead of hours.",
                  author: "Priya, organizer",
                },
              ].map((item) => (
                <div key={item.author} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <Quote className="mb-2 size-4 text-primary" />
                  <p className="text-sm text-slate-700">{item.quote}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">{item.author}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto mb-14 px-4">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[url(/event-image-2.webp)] bg-cover bg-center p-8 shadow-md">
          <div className="absolute inset-0 bg-slate-950/60" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Ready to host?</p>
              <h3 className="mt-2 text-3xl font-bold text-white md:text-4xl">Launch your next event with a premium ticketing flow</h3>
              <p className="mt-2 text-sm text-slate-200">Create events, publish ticket types, and manage everything from your dashboard.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate("/organizers")}>
                Start organizing <ArrowRight className="size-4" />
              </Button>
              <Button variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20" onClick={() => navigate("/dashboard")}>Open dashboard</Button>
            </div>
          </div>
        </div>
      </section>
      </PageTransition>
    </div>
  );
};

export default AttendeeLandingPage;
