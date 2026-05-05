import { RegisterForm } from "@/components/forms/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">
            Bergabung
          </h1>
          <p className="mt-2 text-muted-foreground">
            Daftar untuk mulai mengelola layanan IT Anda
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
