import { Toaster } from "@/components/ui/sonner";
import { Outlet, RouterProvider, createRouter } from "@tanstack/react-router";
import { createRootRoute, createRoute } from "@tanstack/react-router";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import GuidancePage from "./pages/GuidancePage";
import LandingPage from "./pages/LandingPage";
import NotesPage from "./pages/NotesPage";
import ProfilePage from "./pages/ProfilePage";
import TutorsPage from "./pages/TutorsPage";

// Root layout — uses Outlet for child routes
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-right" theme="dark" />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const notesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notes",
  component: NotesPage,
});

const tutorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tutors",
  component: TutorsPage,
});

const guidanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/guidance",
  component: GuidancePage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  notesRoute,
  tutorsRoute,
  guidanceRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
