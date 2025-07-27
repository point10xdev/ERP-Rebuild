import { useEffect } from "react";
import { useInitAuth } from "./customHooks"; // Importing the custom hook that initializes auth state

// This component is used to initialize the authentication state when the app loads
export const AuthInitializer: React.FC = () => {
  // Extracting the `initializeAuth` function from the custom `useInitAuth` hook
  const { initializeAuth } = useInitAuth();

  // useEffect is used to run the initialization logic once when the component mounts (on app load)
  useEffect(() => {
    initializeAuth()
      .then(() => {
      })
      .catch((error) => {
        console.error("AuthInitializer: Auth initialization failed", error);
      });
  }, []); // Empty dependency array means this effect runs only once, when the component is first mounted

  return null; // Returning null means this component doesn't produce any visible UI
};
