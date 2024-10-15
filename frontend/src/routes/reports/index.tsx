import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/reports/")({
  component: () => <div>Hello /reports/!</div>,
});
