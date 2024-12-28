"use server"
import {display} from "@/lib/grpc/client";
import {login} from "@/lib/grpc/auth";
import {auth} from "@/proto/auth";
import Credentials = auth.Credentials;

export async function create() {
    'use server'
    await display();
}

export async function loginGrpc(formData: FormData) {
    let credentials = new Credentials();
    credentials.email = formData.get('email')?.toString()!;
    credentials.password =formData.get('password')?.toString()!;
    credentials.client_id = '1234';
    let data = await login(credentials)
    console.log("Form submitted " + data);
}