import ButtonWithTooltip from "@/components/ButtonWithTooltip";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { doctorsListQuery } from "@/hooks/doctors";
import { useQuery } from "@tanstack/react-query";
import { Link, Outlet } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { CirclePlus, SquarePen, Trash2 } from "lucide-react";

const DoctorsList = () => {
  const {data} = useQuery(doctorsListQuery);
  
  return (
    <div>
      <div className="flex justify-between pb-2 items-center">
        <h1 className="text-2xl">Doctors</h1>
        <Button asChild>
          <Link to="/doctors/new">
            <CirclePlus className="mr-2 h-5 w-5" />
            New Doctor
          </Link>
        </Button>
      </div>
      <div>
        {data?.data ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell className="px-4 py-2">{doctor.name}</TableCell>
                  <TableCell className="px-4 py-2">{doctor.phone}</TableCell>
                  <TableCell className="px-4 py-2">{doctor.email}</TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex gap-2">
                      <ButtonWithTooltip tooltipText="Edit" Icon={SquarePen} />
                      <ButtonWithTooltip tooltipText="Delete" Icon={Trash2} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          "No Doctors..."
        )}
      </div>
      <Outlet />
    </div>
  );
};

export const Route = createFileRoute("/doctors")({
  component: DoctorsList,
  loader: async ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(doctorsListQuery);
  },
  pendingComponent: () => <p>Loading...</p>,
});
