interface authUser{
    id: number;
    name: string;
    email: string;
}

declare namespace Express{
  export interface Request {
    user?: authUser 
  }
}