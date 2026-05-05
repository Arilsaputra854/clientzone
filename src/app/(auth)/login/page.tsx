import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">
            Client Zone
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sistem Billing & Management Layanan IT
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
