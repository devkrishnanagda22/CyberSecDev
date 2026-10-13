import AuthCard from "@/components/auth/AuthCard";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 py-12 px-4 sm:px-6">
      <AuthCard
        title="Create Account"
        subtitle="Join CyberSecDev and start learning cybersecurity."
      >
        <RegisterForm />
      </AuthCard>
    </main>
  );
}