
import {auth as authGrpc} from "@/proto/auth";
import {login} from "@/lib/grpc/auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    console.log("New login req")
    if (req.method === "POST") {
        const {oauth_token, expires_in, expires_at, providerAccountId, provider} = await req.json().catch(
            (e) => {
                console.log(e);
                return Response.json({ error: "Error logging in" });
            }
        )
        try {
            let loginData = new authGrpc.OAuth();
            loginData.oauth_token = oauth_token as string;
            loginData.expires_in = expires_in as string;
            loginData.expires_at = expires_at as string;
            loginData.providerAccountID = providerAccountId as string;
            loginData.provider = provider as string;
            let req = new authGrpc.AuthRequest({oauth: loginData});
            let data=  await login(req);
            return Response.json(data.toObject());
        }
        catch (e){
            console.log(e);
            return Response.json({ error: "Error logging in" });
        }
    }
}