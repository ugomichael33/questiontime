import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom"; 
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import useApi from "../../../src/hooks/useApi";
import EditQuestionPage from "../../../src/pages/questions/edit/[questionId]";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../../src/hooks/useApi", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockPush = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();

  (useRouter as jest.Mock).mockReturnValue({
    query: { questionId: "1" },
    push: mockPush,
  });

  (useApi as jest.Mock).mockReturnValue({
    isLoading: false,
    error: null,
    request: jest.fn(() => Promise.resolve()),
  });

  const questionData = JSON.stringify({
    question: "Sample Question",
    options: ["Option 1", "Option 2"],
  });
  Storage.prototype.getItem = jest.fn(() => questionData);
});

test("loads question details from localStorage", () => {
  render(<EditQuestionPage />);

  expect(screen.getByDisplayValue("Sample Question")).toBeInTheDocument();
  expect(screen.getAllByRole("textbox").length).toBeGreaterThanOrEqual(2);
});


test("allows adding and removing options", async () => {
  render(<EditQuestionPage />);

  const addButton = screen.getByText("Add Option");
  fireEvent.click(addButton); 

  await waitFor(() => {
    expect(screen.getAllByRole("textbox").length).toBe(4);
  });

  const removeButtons = screen.getAllByText("×");
  fireEvent.click(removeButtons[0]);

  await waitFor(() => {
    expect(screen.getAllByRole("textbox").length).toBe(3);
  });
});

test("submits updated question successfully", async () => {
  const requestMock = jest.fn(() => Promise.resolve());
  (useApi as jest.Mock).mockReturnValue({
    isLoading: false,
    error: null,
    request: requestMock,
  });

  render(<EditQuestionPage />);
  fireEvent.change(screen.getByDisplayValue("Sample Question"), {
    target: { value: "Updated Question" },
  });
  fireEvent.click(screen.getByText("Update Question"));

  await waitFor(() => {
    expect(requestMock).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith(
      "Question updated successfully."
    );
  });
});

test("handles submission error", async () => {
  const requestMock = jest.fn(() => Promise.reject());
  (useApi as jest.Mock).mockReturnValue({
    isLoading: false,
    error: null,
    request: requestMock,
  });

  render(<EditQuestionPage />);
  fireEvent.click(screen.getByText("Update Question"));

  await waitFor(() => {
    expect(requestMock).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Failed to update the question.");
  });
});

test("updates option value correctly", async () => {
  render(<EditQuestionPage />);

  const optionInputs = await screen.findAllByLabelText(/Option [0-9]+:/);

  expect(optionInputs[0]).toHaveValue("Option 1");

  fireEvent.change(optionInputs[0], { target: { value: "Updated Option 1" } });

  expect(optionInputs[0]).toHaveValue("Updated Option 1");
});

test('displays an error toast when question data is not found in localStorage', () => {
  Storage.prototype.getItem = jest.fn(() => null);

  render(<EditQuestionPage />);

  expect(toast.error).toHaveBeenCalledWith("Question data not found.");
});
