"use client"; // Mark this as a Client Component

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase"; // Adjust the path if necessary

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const publicPaths = ["/signin"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && !publicPaths.includes(router.pathname)) {
        router.push("/signin");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return <>{children}</>;
}
