"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function OrderRedirectPage() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/services/${id}`);
    }
  }, [id, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
