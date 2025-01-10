"use client"
import Signup from "@/components/signup";
import SignIn from "@/components/signin";

import {AuroraBackground} from "@/components/ui/aurora-background";
import { useState } from "react";

function Page() {
    const [isUser, setIsUser] = useState(true);
    return (
        <AuroraBackground>
            {isUser ? <SignIn setIsUser={setIsUser}/> : <Signup setIsUser={setIsUser}/>}
        </AuroraBackground>
    );
}

export default Page;