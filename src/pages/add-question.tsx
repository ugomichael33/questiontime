import React from "react";
import Link from "next/link";
import AddQuestion from "../components/AddQuestion";


const AddQuestionPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl mb-4">
        Add a New Question
      </h1>
      <AddQuestion />
      <div className="mt-6">
        <Link href="/questions">
          <span className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Back to Questions
          </span>
        </Link>
      </div>
    </div>
  );
};

export default AddQuestionPage;
