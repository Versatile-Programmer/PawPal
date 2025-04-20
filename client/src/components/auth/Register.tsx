"use client";
import React, { useEffect } from 'react'
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "@/actions/authAction";
import { SubmitButton } from "@/components/common/SubmitButton";
import { useActionState } from 'react';
import { toast } from "sonner";

export default function Register() {
    const initState = {
        status:0,
        message:"",
        errors:{}
    }
    // ReactDom.useFormState is renamed as React.useActionStae 
    const [state , formAction] = useActionState(registerAction,initState);
    useEffect(() => {
      if(state.status === 500){
        toast.error(state.message);
    }else if(state.status === 200) toast.success(state.message)
},[state])
  return (
    <form action={formAction}>
      <div className="mt-4">
        <Label htmlFor="name">name</Label>
        <Input
          type="text"
          placeholder="Enter your name..."
          id="name"
          name="name"
        />
        <span className="text-red-600">{state.errors?.name}</span>
      </div>
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
      <div className="mt-4">
        <Label htmlFor="cpassword">Confirm Password</Label>
        <Input
          type="password"
          placeholder="Confirm Your Password..."
          id="cpassword"
          name="cpassword"
        />
        <span className="text-red-600">{state.errors?.confirmPassword}</span>
      </div>
      <div className="mt-4 text-center">
        <SubmitButton />
      </div>
    </form>
  );
}
