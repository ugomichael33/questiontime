import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

import useApi from "../hooks/useApi";

interface OptionInputProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}

const OptionInput: React.FC<OptionInputProps> = ({
  value,
  onChange,
  onRemove,
}) => (
  <div className="flex items-center space-x-2 mb-2">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Option input"
      className="input input-bordered flex-1 rounded-lg"
      placeholder="Option"
    />
    <button
      onClick={onRemove}
      type="button"
      aria-label="Remove option"
      className="inline-flex items-center justify-center p-2 h-8 w-8 bg-red-500 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
      &times;
    </button>
  </div>
);

const AddQuestion: React.FC = () => {
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", ""]);
  const { isLoading, error, request } = useApi<null>(null);

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, ""]);
    }
  };

  const handleOptionChange = (index: number, newValue: string) => {
    const newOptions = [...options];
    newOptions[index] = newValue;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter(
        (_, optionIndex) => optionIndex !== index
      );
      setOptions(newOptions);
    } else {
      toast.error("A question must have at least 2 options.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedOptions = options.filter((option) => option.trim() !== "");
    if (cleanedOptions.length < 2) {
      return;
    }

    const payload = { question: questionText, options: cleanedOptions };

    try {
      const response = await request("/questions", "POST", payload);
      toast.success("Question added successfully.");
      setQuestionText("");
      setOptions(["", "", ""]);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred while adding the question.");
    }
  };

  const filledOptionsCount = options.filter(
    (option) => option.trim() !== ""
  ).length;

  return (
    <div className="max-w-lg mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-gray-700">Question:</span>
        </label>
        <input
          type="text"
          placeholder="Enter your question here"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
        <div className="text-gray-700">Options:</div>
        {options.map((option, index) => (
          <OptionInput
            key={index}
            value={option}
            onChange={(newValue) => handleOptionChange(index, newValue)}
            onRemove={() => handleRemoveOption(index)}
          />
        ))}
        <div className="py-2">
          {options.length < 5 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Add Option
            </button>
          )}
        </div>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading || filledOptionsCount < 2}
        >
          Submit Question
        </button>
        {error && <div className="mt-4 text-red-500">{error.message}</div>}
      </form>
    </div>
  );
};

export default AddQuestion;
