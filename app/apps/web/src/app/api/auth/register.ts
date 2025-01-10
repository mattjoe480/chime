import {NextApiRequest, NextApiResponse} from "next";
import {register} from "@/lib/grpc/auth";
import {auth} from "@/proto/auth";

const registerHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "POST") {
        const {name,email,password} = req.body;
        console.log(req.body);
        try {
            let user = new auth.User({name,email,password});
            await register(user);
            res.status(200).json({ message: "User created successfully" });
        }
        catch (e) {
            console.log(e);
            res.status(400).json({ error: "Error creating user" });
        }
    }
    else {
        res.status(405).json({ error: "Only POST Method is allowed" });
    }
}
export default registerHandler;