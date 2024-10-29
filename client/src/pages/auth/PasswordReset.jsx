import React from "react";
// import { pass_illus } from "../../assets/index.js";
import { ForgotIllustraion } from "../../assets/index.js";
import { Outlet } from "react-router-dom";

const PasswordReset = () => {
  return (
    <div className="h-screen flex justify-center items-center space-x-10">
      <div className="h-[80%] w-[50%] overflow-hidden borderl border-red-300 rounded-md">
        {/* <img src={pass_illus} alt="" className=" border-2 h-fit w-fit" /> */}
        <img src={ForgotIllustraion} alt="" className=" border-2l h-fit w-fit" />
      </div>
      <div className="w-[25%] space-y-2">
        <h1 className="text-3xl text-left">Forgot Passowrd</h1>
        <Outlet />
      </div>
    </div>
  );
};

export default PasswordReset;
