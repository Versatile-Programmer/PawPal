import NextAuth from "next-auth";
import { authOptions } from "./option";

const handler = NextAuth(authOptions);

export {handler as POST, handler as GET};

