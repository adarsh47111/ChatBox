import { LoginUser } from "@/redux/slices/auth";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { register as signup } from "../../utils/api";

const Register = () => {
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    watch,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submit = async (formData) => {
    const { status, message, data } = await signup({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });

    if (status === "success") {
      dispatch(LoginUser(data));
      navigate("/");
    } else {
      reset();
      toast(message);
    }
  };

  return (
    <div className=" h-screen w-screen flex justify-center items-center">
      <form
        className="flex flex-col min-h-[22rem] w-80 p-4 rounded-lg space-y-4 border m-auto"
        onSubmit={handleSubmit(submit)}
      >
        <p className="text-center">Register</p>
        <div className="flex flex-col space-y-3">
          <label className="text-xs">Username</label>
          <Input
            type="text"
            placeholder="username"
            {...register("username", {
              required: "Username is required",
              minLength: {
                value: 3,
                message: "Username must be at least 3 characters long",
              },
            })}
          />
          {errors.username && (
            <p className=" text-xs text-primary">{errors.username.message}</p>
          )}
        </div>
        <div className="flex flex-col space-y-3">
          <label className="text-xs">Email</label>
          <Input
            type="text"
            placeholder="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/,
                message: "Invalid email",
              },
            })}
          />
          {errors.email && (
            <p className=" text-xs text-primary">{errors.email.message}</p>
          )}
        </div>
        <div className="flex flex-col space-y-3">
          <label className="text-xs">Password</label>
          <Input
            type="password"
            placeholder="password"
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
        <div className="flex flex-col space-y-3">
          <label className="text-xs">Confirm Password</label>
          <Input
            type="password"
            placeholder="password"
            {...register("confirm_password", {
              required: "Password is required",
              // validate: (value) => {
              //   if (value !== getValues().password) {
              //     return "Passwords do not match";
              //   }
              // },
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            })}
          />
          {errors.confirm_password && (
            <p className=" text-xs text-primary">
              {errors.confirm_password.message}
            </p>
          )}
        </div>
        <Button>Sign Up</Button>
        <div className="flex justify-center text-xs">
          <span onClick={() => navigate("/auth/login")}>
            Already have account?
            <span className="mx-2 underline cursor-pointer hover:text-primary">
              Sign In
            </span>
          </span>
        </div>
      </form>
    </div>
  );
};

export default Register;
