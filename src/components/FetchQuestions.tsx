import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Link from "next/link";

import { ConfirmationModal } from "./ConfirmationModal";
import useApi from "../hooks/useApi";

interface Question {
  question: string;
  options: string[];
}

interface QuestionsResponse {
  [key: string]: Question;
}

const FetchQuestions: React.FC = () => {
  const {
    data: questions,
    error,
    isLoading,
    request,
  } = useApi<QuestionsResponse | null>(null);
  const [localQuestions, setLocalQuestions] =
    useState<QuestionsResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null
  );

  const router = useRouter();

  const fetchQuestions = useCallback(async () => {
    await request("/questions", "GET");
  }, [request]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    if (questions) {
      setLocalQuestions(questions);
    }
  }, [questions]);

  const handleOpenModal = (questionId: string) => {
    setCurrentQuestionId(questionId);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!currentQuestionId) return;
  
    try {
      await request(`/questions/${currentQuestionId}`, "DELETE");
      toast.success("Question deleted successfully.");
      setIsModalOpen(false);
      setCurrentQuestionId(null);
      fetchQuestions();
    } catch (error) {
      console.error("Deletion error:", error);
      toast.error("Failed to delete the question.");
      setIsModalOpen(false);
      setCurrentQuestionId(null);
    }
  };

  const handleEditNavigation = (questionId: string, questionObj: Question) => {
    localStorage.setItem("currentQuestion", JSON.stringify(questionObj)); 
    router.push(`/questions/edit/${questionId}`);
  };

  if (isLoading) return <p className="text-center">Loading questions...</p>;
  if (error) return <p className="text-red-500 text-center">{error.message}</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {localQuestions && Object.entries(localQuestions).length > 0 ? (
        Object.entries(localQuestions).map(([id, questionObj]) => (
          <div key={id} className="bg-white shadow-lg rounded-lg p-6 mb-4">
            <h3 className="text-xl font-semibold mb-2">{questionObj.question}</h3>
            <ul className="list-disc list-inside mb-4">
              {questionObj.options.map((option, index) => (
                <li key={index}>{option}</li>
              ))}
            </ul>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => handleEditNavigation(id, questionObj)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleOpenModal(id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center">No questions found.</p>
      )}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        question={
          currentQuestionId && questions
            ? questions[currentQuestionId].question
            : ""
        }
      />
    </div>
  );
};

export default FetchQuestions;
