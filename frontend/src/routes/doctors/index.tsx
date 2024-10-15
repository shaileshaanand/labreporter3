import { createFileRoute } from "@tanstack/react-router";

const DoctorsList = () => {
  return <div>DoctorsList</div>;
};

export const Route = createFileRoute("/doctors/")({
  component: DoctorsList,
});
