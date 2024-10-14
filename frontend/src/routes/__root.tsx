import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import {
  ChartLine,
  ClipboardPlus,
  Home,
  LayoutTemplate,
  Stethoscope,
  Users,
} from "lucide-react";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="grid min-h-screen w-full bg-background md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <div className="flex items-center gap-2 font-semibold w-full">
                <span className="text-2xl w-full text-center">
                  Lab Reporter
                </span>
              </div>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                  <Home className="h-4 w-4" />
                  Home
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary">
                  <ClipboardPlus className="h-4 w-4" />
                  Reports
                </div>
                <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                  <Users className="h-4 w-4" />
                  Patients
                </div>
                <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                  <Stethoscope className="h-4 w-4" />
                  Doctors
                </div>
                <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                  <LayoutTemplate className="h-4 w-4" />
                  Templates
                </div>
                <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                  <ChartLine className="h-4 w-4" />
                  Analytics
                </div>
              </nav>
            </div>
            <div className="mt-auto p-4">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Architecto, expedita?
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            HEADER
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <TanStackRouterDevtools />
    </>
  ),
});
