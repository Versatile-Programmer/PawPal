import React from "react";
import Link from "next/link";
import Register from "@/components/auth/Register";
import { toast } from "sonner";
function page() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-[550px] bg-white rounded-xl px-10 py-5 shadow-md">
          <h1 className="text-4xl text-center font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
            PawPal
          </h1>
          <h1 className="text-3xl font-bold">Register</h1>
          <p>Welcome to PawPal</p>
          <Register/>
        <p className="text-center mt-2">
          Already have an account ?{" "}
          <strong>
            <Link href="/login">Login</Link>
          </strong>
        </p>
      </div>
    </div>
  );
}

export default page;
