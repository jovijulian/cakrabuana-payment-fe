import SignInForm from "@/components/auth/SignInFormAdmin";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signin | Bintara - Cakra Buana",
};

export default function SignIn() {
  return <SignInForm />;
}
