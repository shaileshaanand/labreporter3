import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/templates/")({
  component: () => <div>Hello /templates/!</div>,
});
