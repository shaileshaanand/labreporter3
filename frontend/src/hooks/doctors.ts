import api from "@/api";
import { queryOptions } from "@tanstack/react-query";

export const doctorsListQuery = queryOptions({
  queryKey: ["doctors"],
  queryFn: () =>
    api.doctors.index.get({
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }),
});
