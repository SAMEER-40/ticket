import { Github, Instagram, Linkedin, Twitter } from "lucide-react";

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: Linkedin },
  { label: "GitHub", href: "https://github.com", icon: Github },
  { label: "Twitter", href: "https://x.com", icon: Twitter },
  { label: "Instagram", href: "https://www.instagram.com", icon: Instagram },
];

export const AppFooter: React.FC = () => {
  return (
    <footer className="mt-14 border-t border-slate-200/80 bg-white/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="font-semibold text-slate-800">Event Ticket Platform</p>
          <p className="text-xs text-slate-500">Copyright {new Date().getFullYear()} - All rights reserved.</p>
        </div>

        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-slate-900">About</a>
          <a href="#" className="hover:text-slate-900">Contact</a>
        </div>

        <div className="flex items-center gap-2">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              aria-label={social.label}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
            >
              <social.icon className="size-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};
