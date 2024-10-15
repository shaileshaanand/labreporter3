import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/patients/")({
  component: () => <div>Hello /patients/! <Outlet/></div>,
});
