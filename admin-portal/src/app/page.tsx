import { redirect } from "next/navigation";

/**
 * Root page that redirects to login page
 *
 * @author: TikTok Clone Admin Team
 * @date: 10/25/2025
 */
export default function RootPage() {
  redirect("/login");
}
