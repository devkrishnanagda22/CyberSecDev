import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 py-12 px-4 sm:px-6">
      <AuthCard
        title="Welcome Back"
        subtitle="Login to continue your cybersecurity journey."
      >
        <LoginForm />
      </AuthCard>
    </main>
  );
}