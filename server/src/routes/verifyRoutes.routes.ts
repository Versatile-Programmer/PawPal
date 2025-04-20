import { Router, Request, Response } from "express";
import prisma from "../config/database.js";
const router = Router();

router.get(
  "/verify-email",
  async (req: Request, res: Response): Promise<any> => {
    // typescript function to acess query params
    const { email, token } = req.query;
    if (email && token) {
      const user = await prisma.user.findUnique({
        where: {
          email: email as string,
        },
      });
      if (user) {
        if(token === user.email_verify_token ){
            // Redirect to front page and nullify token
           await prisma.user.update({
            data:{
                email_verify_token: null,
                email_verified_at: new Date().toISOString(), 
            },
            where: {
                email: email as string,
            }
           })
        }
        return res.redirect(`${process.env.CLIENT_APP_URL}/login?verified=true`); 
      }
      return res.redirect(`${process.env.CLIENT_APP_URL}/verify-error`);
    }
    return res.redirect(`${process.env.CLIENT_APP_URL}/verify-error`);
  }
);
router.get(
  "/verify-error",
  async (req: Request, res: Response): Promise<any> => {
    return res.render("../views/auth/emailVerifyError.ejs");
  }
);
export default router;
