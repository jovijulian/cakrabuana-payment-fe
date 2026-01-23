import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signin | Cakra Buana",
};

export default function SignIn() {
  return <SignInForm />;
}
