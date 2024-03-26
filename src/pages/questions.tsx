import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import FetchQuestions from "../components/FetchQuestions";

const QuestionsPage: React.FC = () => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("qt_token");
    if (!tokenFromStorage) {
      router.push("/");
    } else {
      setToken(tokenFromStorage);
      setIsCheckingToken(false);
    }
  }, [router]);

  if (isCheckingToken) {
    return (
      <p className="flex justify-center items-center min-h-screen">
        Checking token...
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Question Management
      </h1>
      <Link href="/">
        <span className="text-md text-blue-600 hover:text-blue-800">
          Back to Home
        </span>
      </Link>
      <div className="mb-6">
        <Link href="/add-question">
          <span className="inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-150 ease-in-out">
            Add New Question
          </span>
        </Link>
      </div>
      {token && <FetchQuestions />}
    </div>
  );
};

export default QuestionsPage;
