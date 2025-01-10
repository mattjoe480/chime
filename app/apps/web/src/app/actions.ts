"use server"
import {display} from "@/lib/grpc/client";
import {login, register} from "@/lib/grpc/auth";
import {auth} from "@/proto/auth";
import Credentials = auth.Credentials;
import User = auth.User;
import {signIn as SignInHandler} from "@/auth";


export async function loginGrpc(formData: FormData)
{
    await SignInHandler("credentials", formData);
}

export async function registerGrpc(formData: FormData) {
    let user = new User();
    user.name = formData.get('email')?.toString()!;
    user.email = formData.get('email')?.toString()!;
    user.password =formData.get('password')?.toString()!;
    user.provider = "Local";
    user.provider_uid = ""
    let data = await register(user)
    console.log("Form submitted " + data);
}
