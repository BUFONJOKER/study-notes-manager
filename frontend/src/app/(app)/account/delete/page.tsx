import type { Metadata } from "next";
import { DeleteAccountView } from "@/components/account/delete-account-view";

export const metadata: Metadata = { title: "Delete account" };

export default function DeleteAccountPage() {
  return <DeleteAccountView />;
}
