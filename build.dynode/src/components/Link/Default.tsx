import { Typography } from "antd";

interface LinkProps {
  label: string;
  target: string;
  className?: string;
  openInNewTab?: boolean;
}

function Link({ label, target, className, openInNewTab = false }: LinkProps) {
  return (
    <Typography.Link
      href={target}
      className={className}
      target={openInNewTab ? "_blank" : undefined}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
    >
      {label}
    </Typography.Link>
  );
}

export default Link;
