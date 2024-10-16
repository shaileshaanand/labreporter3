import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/doctors/new")({
  component: () => <div>Hello /doctors/new!</div>,
});
