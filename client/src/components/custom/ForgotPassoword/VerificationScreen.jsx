import React, { useEffect, useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { sendEmail, sendOtp } from "@/utils/api";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import LoaderIndicator from "../LoaderIndicator";

const VerificationScreen = () => {
  const [code, setCode] = useState("");
  const [resendingMail, setResendingMail] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state === null) navigate("/auth/login");
  }, []);

  const handleSubmit = async () => {
    const { status, message } = await sendOtp(location.state?.email, code);
    if (status === "success") {
      navigate("/auth/passwordreset/setpassword", { state: location.state });
    } else {
      toast.error(message);
    }
  };

  const handleSendMail = async () => {
    setResendingMail(true);
    const { status, message } = await sendEmail(location.state?.email);
    if (status === "success") {
      toast.success("Verification email sent successfully!");
      setResendingMail(false);
    } else toast.error(message);
  };

  return (
    <div>
      <p className="text-sm opacity-90 leading-4 pb-2">
        Please enter the verification code below that was sent to{" "}
        <span className="font-bold opacity-100">{location.state?.email}</span>
      </p>
      <p className="text-sm leading-4 pb-7">
        Didn't recieve email?
        <Button
          variant="link"
          className="underline"
          disabled={resendingMail}
          onClick={handleSendMail}
        >
          Click to resend
          {resendingMail && <LoaderIndicator />}
        </Button>
      </p>
      <div className="w-[55%]">
        <OTPBox {...{ code, setCode }} />
        <div className="flex flex-col justify-center items-center w-full mt-8">
          <Button
            className="bg-primary text-white rounded-md px-4 my-2 w-full"
            disabled={resendingMail}
            onClick={handleSubmit}
          >
            Submit
          </Button>
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
    </div>
  );
};

export default VerificationScreen;

const OTPBox = ({ code, setCode }) => {
  return (
    <div>
      <InputOTP maxLength={4} value={code} onChange={(value) => setCode(value)}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
};
