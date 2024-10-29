import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Provider } from "react-redux";
import store, { persistor } from "./redux/store.js";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import App from "./App.jsx";
import DashboardLayout from "./layouts";
import { Toaster } from "@/components/ui/sonner";
import { PersistGate } from "redux-persist/integration/react";
import PasswordReset from "./pages/auth/PasswordReset";
import EmailScreen from "./components/custom/ForgotPassoword/EmailScreen";
import VerificationScreen from "./components/custom/ForgotPassoword/VerificationScreen";
import SetPasswordScreen from "./components/custom/ForgotPassoword/SetPasswordScreen";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<DashboardLayout />}>
      <Route path="auth/login" element={<Login />} />
      <Route path="auth/register" element={<Register />} />
      <Route path="auth/passwordreset" element={<PasswordReset />}>
        <Route path="email" element={<EmailScreen />} />
        <Route path="verification" element={<VerificationScreen />} />
        <Route path="setpassword" element={<SetPasswordScreen />} />
      </Route>
      <Route path="" element={<App />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <RouterProvider router={router} />
          <Toaster />
        </PersistGate>
      </Provider>
    </ThemeProvider>
  </React.StrictMode>
);
