import {auth} from "@/proto/auth";
import Credentials = auth.Credentials;
import Token = auth.Token;
import {getService} from "@/lib/grpc/client";
import authClient = auth.authClient;
import {ServiceError} from "@grpc/grpc-js";

export async function login(credentials: Credentials): Promise<Token>{
    let auth = await getService<authClient>("auth.auth");
    return new Promise((resolve, reject) => {
        let res : Token | Error;
        auth.auth(credentials, (err, auth) => {
            res = handleResponse(err, auth);
            if (res instanceof  Token){
                return resolve(res)
            }
            return reject(res);
        });
    });
}

function handleResponse(rejectToken: ServiceError | null, resolveToken: Token | undefined) {
    if (rejectToken !== null) {
        return Error("Internal server error: " + rejectToken.message);
    }
    if (resolveToken !== null && resolveToken !== undefined) {
        return Token.fromObject(resolveToken);
    }
    return Error("Internal server error");
}
