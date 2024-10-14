import { createFileRoute } from "@tanstack/react-router";

const HomePage = () => {
  return <div>Home Page</div>;
};

export const Route = createFileRoute("/")({
  component: HomePage,
});
