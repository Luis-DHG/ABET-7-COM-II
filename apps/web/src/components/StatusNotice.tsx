import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type Tone = "info" | "destructive" | "success" | "warning";

const ICONS = {
  info: Info,
  destructive: AlertCircle,
  success: CheckCircle2,
  warning: AlertCircle,
} as const;

const TONE_CLASS: Record<Tone, string> = {
  info: "border-primary/40 bg-secondary/50",
  destructive: "border-destructive/50 text-destructive [&_svg]:text-destructive",
  success: "border-success/50 text-success [&_svg]:text-success",
  warning: "border-primary/50 bg-accent/50",
};

export function StatusNotice({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const Icon = ICONS[tone];
  return (
    <Alert className={cn(TONE_CLASS[tone], className)}>
      <Icon aria-hidden />
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <AlertDescription className="text-inherit">{children}</AlertDescription>
    </Alert>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}
