class Env {
    static BACKEND_APP_URL = process.env.NEXT_PUBLIC_BACKEND_APP_URL as string;
    static APP_URL = process.env.NEXT_PUBLIC_APP_URL as string;
}

export default Env;
