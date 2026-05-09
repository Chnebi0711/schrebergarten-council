import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("sc_session");
  const correct = process.env.ACCESS_PASSWORD;

  if (!correct || session?.value !== correct) {
    redirect("/login");
  }

  return <>{children}</>;
}
