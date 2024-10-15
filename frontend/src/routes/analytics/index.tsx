import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/analytics/")({
  component: () => <div>Hello /analytics/!</div>,
});
