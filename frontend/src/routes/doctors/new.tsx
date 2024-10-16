import api from "@/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { doctorValidator } from "../../../../api/validators";

const NewDoctor = () => {
  const [open] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const newDoctorMutation = useMutation({
    mutationFn: (data: z.infer<typeof doctorValidator>) => {
      return api.doctors.index.post(data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["doctors"] });
      navigate({ to: ".." });
    },
  });

  const form = useForm<z.infer<typeof doctorValidator>>({
    resolver: zodResolver(doctorValidator),
    defaultValues: {
      name: "",
      email: undefined,
      phone: undefined,
    },
  });

  const onSubmit = () => {
    newDoctorMutation.mutate(form.getValues());
  };

  return (
    <Dialog open={open}>
      <DialogContent close={false}>
        <DialogHeader>
          <DialogTitle>New Doctor</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email"
                      {...field}
                      disabled={newDoctorMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Phone"
                      {...field}
                      disabled={newDoctorMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              <Button type="button" variant={"destructive"} asChild>
                <Link to="..">Cancel</Link>
              </Button>
              <Button type="submit" disabled={newDoctorMutation.isPending}>
                Create
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const Route = createFileRoute("/doctors/new")({
  component: NewDoctor,
});
