import { Link as MuiLink } from "@mui/material";

interface LinkProps {
  label: string;
  target: string;
  className?: string;
  openInNewTab?: boolean;
}

function Link({ label, target, className, openInNewTab = false }: LinkProps) {
  return (
    <MuiLink
      href={target}
      className={className}
      target={openInNewTab ? "_blank" : undefined}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
    >
      {label}
    </MuiLink>
  );
}

export default Link;
