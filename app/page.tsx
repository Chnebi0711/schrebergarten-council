import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CouncilPage from "@/components/CouncilPage";

export default async function Page() {
  const cookieStore = await cookies();
  const session = cookieStore.get("sc_session");
  const correct = process.env.ACCESS_PASSWORD;

  if (!correct || session?.value !== correct) {
    redirect("/login");
  }

  return <CouncilPage />;
}
