import {NextApiRequest, NextApiResponse} from "next";
import {auth as authGrpc} from "@/proto/auth";
import {login} from "@/lib/grpc/auth";
import { NextRequest } from "next/server";
import {json} from "next/dist/client/components/react-dev-overlay/server/shared";

export async function POST(req: NextRequest) {
    console.log("New login req")
    if (req.method === "POST") {
        const { email, password } = await req.json();
        try {
            let loginData = new authGrpc.Credentials();
            loginData.email = email as string;
            loginData.password = password as string;
            loginData.client_id = "1234";
            let data=  await login(loginData);
            return Response.json(data.toObject());
        }
        catch (e){
            console.log(e);
            return Response.json({ error: "Error logging in" });
        }
    }
}