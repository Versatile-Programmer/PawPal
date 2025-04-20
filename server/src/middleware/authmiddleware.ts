import jwt from "jsonwebtoken";
import { Request,Response,NextFunction } from "express";


export const authMiddleware = (req:Request,res:Response,next:NextFunction):void=>{
    const authHeader = req.headers.authorization;
    if(!authHeader){
        res.status(401).json({message:"Unauthorized User"});
         return;
    }
        const token = authHeader.split(' ')[1];
        jwt.verify(token,process.env.SECRET_KEY as string,(err,user)=>{
            if(err){
                 res.status(401).json({message:"Unauthorized"});
                 return;
            }
            req.user = user as authUser
            next();
        });
       

}

