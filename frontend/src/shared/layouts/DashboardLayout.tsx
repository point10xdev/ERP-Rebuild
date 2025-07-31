import { useAuth } from "../../features/auth/store/customHooks";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DarkModeToggle } from "../DarkMode/DarkModeToggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user } = useAuth();

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="fixed bottom-4 right-4 z-50">
          <DarkModeToggle />
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
