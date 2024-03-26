import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("qt_token");
    setToken(tokenFromStorage);
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold">Welcome to QuestionTime</h1>
      <p className="mt-4 mb-8 text-xl">
        A platform for asking and managing questions.
      </p>
      {token ? (
        <Link href="/questions">
          <span className="rounded bg-blue-500 px-6 py-3 text-white text-lg font-medium hover:bg-blue-700 transition duration-150 ease-in-out">
            Go to Questions
          </span>
        </Link>
      ) : (
        <Link href="/token-request">
          <span className="rounded bg-blue-500 px-6 py-3 text-white text-lg font-medium hover:bg-blue-700 transition duration-150 ease-in-out">
            Request Token
          </span>
        </Link>
      )}
    </main>
  );
}
