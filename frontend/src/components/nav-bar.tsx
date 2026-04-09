import { useAuth } from "react-oidc-context";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useRoles } from "@/hooks/use-roles";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";

const NavBar: React.FC = () => {
  const { user, signoutRedirect } = useAuth();
  const { isOrganizer } = useRoles();
  const navigate = useNavigate();

  return (
    <motion.div
      className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 text-slate-900 backdrop-blur"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Back
            </button>
            <h1 className="text-base font-bold md:text-lg">Event Ticket Platform</h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-600 md:gap-6">
            <Link className="transition-colors hover:text-slate-900" to="/">
              Home
            </Link>
            {isOrganizer && (
              <Link
                className="transition-colors hover:text-slate-900"
                to="/dashboard/events"
              >
                Events
              </Link>
            )}
            <Link
              className="transition-colors hover:text-slate-900"
              to="/dashboard/tickets"
            >
              Tickets
            </Link>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="h-8 w-8 border border-slate-300">
              <AvatarFallback className="bg-slate-200 text-slate-800">
                {user?.profile?.preferred_username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 border-slate-200 bg-white text-slate-900"
            align="end"
          >
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{user?.profile?.preferred_username}</p>
              <p className="text-sm text-slate-500">{user?.profile?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="hover:bg-slate-100"
              onClick={() => signoutRedirect()}
            >
              <LogOut />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};

export default NavBar;
