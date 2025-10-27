import { useLocation } from "react-router-dom";

export type BreadcrumbItem = {
  label: string;
  path: string;
};

export function useBreadcrumbs(routeMap?: Record<string, string>): BreadcrumbItem[] {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => ({
    label:
      routeMap?.[segment] ||
      segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    path: "/" + segments.slice(0, index + 1).join("/"),
  }));
}
