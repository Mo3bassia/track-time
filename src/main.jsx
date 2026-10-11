import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          dir="rtl"
          richColors
          closeButton
          theme="dark"
          toastOptions={{
            classNames: {
              toast: "font-arabic",
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
