import { createFileRoute } from "@tanstack/react-router";

const HomePage = () => {
  return <div>Home Pagee</div>;
};

export const Route = createFileRoute("/")({
  component: HomePage,
});
