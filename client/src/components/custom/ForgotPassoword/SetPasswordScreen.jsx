import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendNewPassword } from "@/utils/api";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SetPasswordScreen = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state === null) navigate("/auth/login");
  }, []);

  const submit = async (formData) => {
    const { status, message } = await sendNewPassword(
      location.state?.email,
      formData.password
    );
    if (status === "success") {
      toast.success(message);
      navigate("/auth/login");
    } else {
      toast.error(message);
    }
  };

  return (
    <div>
      <p>
        Your new password must be different from your previously used password
      </p>
      <form className="my-6" onSubmit={handleSubmit(submit)}>
        <div className="flex flex-col space-y-2 my-2">
          <label className="text-xs font-bold">Password</label>
          <Input
            type="password"
            placeholder=""
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 3,
                message: "Password must be at least 3 characters long",
              },
            })}
          />
          {errors.password && (
            <p className=" text-xs text-primary">{errors.password.message}</p>
          )}
        </div>

        <div className="flex flex-col space-y-2 my-2">
          <label className="text-xs font-bold">Confirm Password</label>
          <Input
            type="password"
            placeholder=""
            {...register("confirmPassword", {
              required: "Password is required",
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <p className=" text-xs text-primary">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex flex-col justify-center items-center w-full mt-4">
          <Button className="w-full my-2">Reset Password</Button>
          <NavLink
            to="/auth/login"
            className="text-xs text-gray-300 hover:text-primary"
          >
            Back to Login
          </NavLink>
        </div>
      </form>
    </div>
  );
};

export default SetPasswordScreen;
