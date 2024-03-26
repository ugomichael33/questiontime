import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Link from "next/link";

import useApi from "../../../hooks/useApi";

const EditQuestionPage = () => {
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", ""]);
  const { isLoading, error, request } = useApi<null>(null);
  const router = useRouter();
  const { questionId } = router.query;

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      const storedQuestion = localStorage.getItem("currentQuestion");
      if (storedQuestion) {
        const question = JSON.parse(storedQuestion);
        setQuestionText(question.question);
        setOptions(question.options);
      } else {
        toast.error("Question data not found.");
      }
    };

    fetchQuestionDetails();
  }, []);

  const handleOptionChange = (index: number, newValue: string) => {
    setOptions(
      options.map((option, idx) => (idx === index ? newValue : option))
    );
  };

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, ""]);
    } else {
      toast.error("Cannot add more than 5 options.");
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length >= 3) {
      setOptions(options.filter((_, idx) => idx !== index));
    } else {
      toast.error("A question must have at least 2 options.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (typeof questionId === "string") {
      try {
        await request(`/questions/${questionId}`, "PUT", {
          question: questionText,
          options,
        });
        toast.success("Question updated successfully.");

      } catch (err) {
        console.error("Failed to update the question:", err);
        toast.error("Failed to update the question.");
      }
    } else {
      toast.error("Invalid question ID.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Question</h1>
      {isLoading && <p className="text-center">Loading...</p>}
      {error && <p className="text-red-500 text-center">{error.message}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="question"
            className="block text-sm font-medium text-gray-700"
          >
            Question:
          </label>
          <input
            id="question"
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-3">
            <label
              htmlFor={`option-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              Option {index + 1}:
            </label>
            <input
              id={`option-${index}`}
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              className="mt-1 flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => handleRemoveOption(index)}
                className="inline-flex items-center justify-center p-2 h-8 w-8 bg-red-500 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                &times;
              </button>
            )}
          </div>
        ))}
        {options.length < 5 && (
          <button
            type="button"
            onClick={handleAddOption}
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Add Option
          </button>
        )}
        <button
          type="submit"
          className="inline-flex ml-5 justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading || options.some((option) => option.trim() === "")}
        >
          Update Question
        </button>
      </form>
      <Link
        href="/questions"
        className="mt-6 inline-block text-blue-600 hover:text-blue-800"
      >
        <span>Back to Questions</span>
      </Link>
    </div>
  );
};

export default EditQuestionPage;
