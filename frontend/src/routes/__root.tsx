import { ModeToggle } from "@/components/mode-toggle";
import type { QueryClient } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  createRootRouteWithContext,
  linkOptions,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import {
  ChartLine,
  ClipboardPlus,
  Home,
  LayoutTemplate,
  Stethoscope,
  Users,
} from "lucide-react";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: () => {
      const navItems = [
        linkOptions({
          to: "/",
          label: "Home",
          activeOptions: { exact: true },
          icon: <Home className="h-4 w-4" />,
        }),
        linkOptions({
          to: "/reports",
          label: "Reports",
          icon: <ClipboardPlus className="h-4 w-4" />,
        }),
        linkOptions({
          to: "/patients",
          label: "Patients",
          icon: <Users className="h-4 w-4" />,
        }),
        linkOptions({
          to: "/doctors",
          label: "Doctors",
          icon: <Stethoscope className="h-4 w-4" />,
        }),
        linkOptions({
          to: "/templates",
          label: "Templates",
          icon: <LayoutTemplate className="h-4 w-4" />,
        }),
        linkOptions({
          to: "/analytics",
          label: "Analytics",
          icon: <ChartLine className="h-4 w-4" />,
        }),
      ];

      return (
        <>
          <div className="grid min-h-screen w-full bg-background md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="border-r bg-muted/40">
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
                    {navItems.map((item) => {
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          activeProps={{ className: "bg-muted text-primary" }}
                          inactiveProps={{
                            className: " text-muted-foreground",
                          }}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary"
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
                <div className="mt-auto p-4 ml-auto">
                  <ModeToggle />
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
      );
    },
  },
);
