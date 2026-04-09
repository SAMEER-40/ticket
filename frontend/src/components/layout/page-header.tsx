import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { ReactNode } from "react";
import { useNavigate } from "react-router";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  showBack?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  showBack = false,
}) => {
  const navigate = useNavigate();

  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        {showBack && (
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="size-4" /> Back
          </Button>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-600">{description}</p>}
      </div>
      {action}
    </header>
  );
};
