import { doctorsListQuery } from "@/hooks/doctors";
import { createFileRoute } from "@tanstack/react-router";

const DoctorsList = () => {
  const { data } = Route.useLoaderData();
  return (
    <div>
      <h1>Doctors List</h1>
      <div>
        {data ? (
          <div>
            {data.map((doctor) => {
              return (
                <div key={doctor.id}>
                  <p>{doctor.name}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No Doctors</p>
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute("/doctors/")({
  component: DoctorsList,
  loader: async ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(doctorsListQuery);
  },
  pendingComponent: () => <p>Loading...</p>,
});
