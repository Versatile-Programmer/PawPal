"use client"
import React, { useActionState, useEffect } from 'react'
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SubmitButton } from '../common/SubmitButton';
import { loginAction } from '@/actions/authAction';
import { toast } from 'sonner';
export default function Login() {
        const initState = {
            status:0,
            message:"",
            errors:{}
        }
        
        // ReactDom.useFormState is renamed as React.useActionStaete
        const [state , formAction] = useActionState(loginAction,initState);
        useEffect(() => {
          if (state.status === 500) {
            toast.error(state.message);
          } else if (state.status === 200) toast.success(state.message);
        }, [state]);
  return (
    <form action={formAction}>
      <h1 className="text-4xl text-center font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
        PawPal
      </h1>
      <h1 className="text-3xl font-bold">Login</h1>
      <p>Welcome Back</p>
      <div className="mt-4">
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          placeholder="Enter your email..."
          id="email"
          name="email"
        />
        <span className="text-red-600">{state.errors?.email}</span>
      </div>
      <div className="mt-4">
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          placeholder="Enter Your Password..."
          id="password"
          name="password"
        />
        <span className="text-red-600">{state.errors?.password}</span>
      </div>
      <div className="font-bold text-right mt-1">
        <Link href="forget-password">Forget Password ?</Link>
      </div>
      <div className="mt-4 text-center">
        <SubmitButton />
      </div>
    </form>
  );
}
