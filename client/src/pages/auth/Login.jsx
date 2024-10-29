import { LoginUser } from "@/redux/slices/auth";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/utils/api";
import { toast } from "sonner";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "u1@g.com",
      password: "123",
    },
  });

  const submit = async (formData) => {
    const { status, message, data } = await login({
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

  const onErrors = (errors) => console.error(errors);

  return (
    <div className=" h-screen w-screen flex justify-center items-center">
      <form
        className="flex flex-col min-h-[22rem] w-80 p-4 rounded-lg space-y-4 border m-auto"
        onSubmit={handleSubmit(submit)}
      >
        <p className="text-center">Login</p>
        <div className="flex flex-col space-y-3">
          <label className="text-xs">Email</label>
          <Input
            type="text"
            placeholder="Email"
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
        <Button>Sign In</Button>
        <div className="flex justify-between text-xs">
          <span
            className=" cursor-pointer hover:text-primary"
            onClick={() => navigate("/auth/passwordreset/email")}
          >
            Forget Password?
          </span>
          <span
            className="cursor-pointer underline hover:text-primary"
            onClick={() => navigate("/auth/register")}
          >
            SignUp
          </span>
        </div>
      </form>
    </div>
  );
};

export default Login;
