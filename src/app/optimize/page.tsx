import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import OptimizeClient from "@/components/OptimizeClient";

export default async function OptimizePage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    return <OptimizeClient />;
}
