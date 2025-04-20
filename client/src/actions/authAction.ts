"use server";
import { LOGIN_URL, REGISTER_URL } from "@/lib/apiEndpoints";
import axios, { AxiosError } from "axios";
import { Stats } from "fs";

export async function registerAction(prevState: any, formdata: FormData) {
  try {
    const { data } = await axios.post(REGISTER_URL, {
      name:formdata.get("name"),
      email:formdata.get("email"),
      password:formdata.get("password"),
      confirmPassword:formdata.get("cpassword"),
    });
    console.log(formdata);
    return {
      status: 200,
      message: data?.message ?? "Account created Successfully! Please Check Your email and Verify Your email",
      errors: {}
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 422) {
        return {
          status: 422,
          message: error.response.data.message,
          errors: error.response.data.errors,
        };
      }
      
    }
    return {
      status: 500,
      message: "Something went wrong",
      errors: {}
    };
  }
}

export async function loginAction(prevState: any, formdata: FormData) {
  try {
    const { data } = await axios.post(LOGIN_URL, {
      email: formdata.get("email"),
      password: formdata.get("password"),
    });
    console.log(formdata);
    return {
      status: 200,
      message:
        data?.message ??
        "Logging you to pawpal",
      errors: {},
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 422) {
        return {
          status: 422,
          message: error.response.data.message,
          errors: error.response.data.errors,
        };
      }
    } 
    return {
      status: 500,
      message: "Something went wrong",
      errors: {},
    };
  }
}