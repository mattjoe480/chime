import {auth} from "@/proto/auth";
import Credentials = auth.Credentials;
import Token = auth.Token;
import RegisterStatus = auth.RegisterStatus
import {getService} from "@/lib/grpc/client";
import authClient = auth.authClient;
import {ServiceError} from "@grpc/grpc-js";

export async function login(credentials: Credentials): Promise<Token>{
    let auth = await getService<authClient>("auth.auth");
    return new Promise((resolve, reject) => {
        let res : Token | Error;
        auth.auth(credentials, (err, auth) => {
            res = loginResponse(err, auth);
            if (res instanceof  Token){
                return resolve(res)
            }
            return reject(res);
        });
    });
}

function loginResponse(rejectToken: ServiceError | null, resolveToken: Token | undefined) {
    if (rejectToken !== null) {
        return Error("Internal server error: " + rejectToken.message);
    }
    if (resolveToken !== null && resolveToken !== undefined) {
        return Token.fromObject(resolveToken);
    }
    return Error("Internal server error");
}


export async function register(user: auth.User): Promise<RegisterStatus>{
    let auth = await getService<authClient>("auth.auth");
    return new Promise((resolve, reject) => {
        auth.register(user, (err, registerStatus) => {
            const res = registerResponse(err, registerStatus);
            if (res instanceof  RegisterStatus){
                return resolve(res)
            }
            return reject(res);
        })
    });
}

function registerResponse(rejectToken: ServiceError | null, registerStatus: RegisterStatus | undefined): RegisterStatus | Error {
    if (rejectToken !== null) {
        return Error("Internal server error: " + rejectToken.message);
    }
    if (registerStatus !== null && registerStatus !== undefined) {
        return RegisterStatus.fromObject(registerStatus);
    }
    return Error("Internal server error");
}