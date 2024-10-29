import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendEmail } from "@/utils/api";
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import LoaderIndicator from "../LoaderIndicator.jsx";

const EmailScreen = () => {
  const [email, setEmail] = useState("");
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const navigate = useNavigate();

  const handleSendMail = async () => {
    setAwaitingResponse(true);
    const { status, message } = await sendEmail(email);
    if (status === "success")
      navigate("/auth/passwordreset/verification", { state: { email } });
    else toast.error(message);
  };

  return (
    <div>
      <p className="text-sm opacity-90 leading-4 pb-7">
        Enter your email and we'll send you a verification code to reset your
        password.
      </p>
      <div className="flex justify-center items-center w-full">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-2 rounded-md px-4 py-2 w-full focus:outline-none"
        />
      </div>
      <div className="flex justify-center items-center w-full mt-4">
        <Button
          className="bg-primary text-white rounded-md px-4 py-2 w-full"
          disabled={awaitingResponse}
          onClick={handleSendMail}
        >
          {awaitingResponse ? "Sending..." : "Submit"}
          {awaitingResponse && <LoaderIndicator />}
        </Button>
      </div>
      <div className="flex justify-center items-center w-full mt-4">
        <NavLink
          to="/auth/login"
          className="text-xs text-gray-300 hover:text-primary"
        >
          <div className="flex items-center space-x-1">
            <ChevronLeft strokeWidth={1.5} size={18} />
            <span>Back to Login</span>
          </div>
        </NavLink>
      </div>
    </div>
  );
};

export default EmailScreen;
