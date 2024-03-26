import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { toast } from "react-toastify";
import "@testing-library/jest-dom";

import AddQuestion from "./AddQuestion";
import useApi from "../hooks/useApi";

jest.mock("../hooks/useApi", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockSubmit = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();
  (useApi as jest.MockedFunction<typeof useApi>).mockImplementation(() => ({
    isLoading: false,
    error: null,
    data: null,
    request: mockSubmit,
  }));
});

test("renders correctly", () => {
  render(<AddQuestion />);
  expect(
    screen.getByPlaceholderText("Enter your question here")
  ).toBeInTheDocument();
});

test("allows adding and removing options", () => {
  render(<AddQuestion />);
  const addOptionButton = screen.getByText("Add Option");
  fireEvent.click(addOptionButton);
  expect(screen.getAllByLabelText("Option input").length).toBe(4);

  const removeButtons = screen.getAllByText("×");
  fireEvent.click(removeButtons[0]);
  expect(screen.getAllByLabelText("Option input").length).toBe(3);
});

test("shows error toast when submitting with less than two options filled", async () => {
  render(<AddQuestion />);
  fireEvent.change(screen.getByPlaceholderText("Enter your question here"), {
    target: { value: "New Question?" },
  });
  fireEvent.change(screen.getAllByLabelText("Option input")[0], {
    target: { value: "Option 1" },
  });
  fireEvent.click(screen.getByText("Submit Question"));

  await waitFor(() => {
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});

test("form with less than two options disables button", async () => {
  render(<AddQuestion />);
  fireEvent.change(screen.getByPlaceholderText("Enter your question here"), {
    target: { value: "Test Question" },
  });
  fireEvent.change(screen.getAllByLabelText("Option input")[0], {
    target: { value: "Option 1" },
  });

  fireEvent.click(screen.getByText("Submit Question"));
  expect(screen.getByText("Submit Question")).toBeDisabled();

  await waitFor(() => {
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});

test("successful submission", async () => {
  mockSubmit.mockResolvedValueOnce({ status: "success" });
  render(<AddQuestion />);

  fireEvent.change(screen.getByPlaceholderText("Enter your question here"), {
    target: { value: "Test Question?" },
  });
  fireEvent.change(screen.getAllByLabelText("Option input")[0], {
    target: { value: "Option 1" },
  });
  fireEvent.change(screen.getAllByLabelText("Option input")[1], {
    target: { value: "Option 2" },
  });

  fireEvent.click(screen.getByText("Submit Question"));

  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith("/questions", "POST", {
      question: "Test Question?",
      options: ["Option 1", "Option 2"],
    });
  });
  expect(toast.success).toHaveBeenCalledWith("Question added successfully.");

  expect(
    (
      screen.getByPlaceholderText(
        "Enter your question here"
      ) as HTMLInputElement
    ).value
  ).toBe("");
  screen.getAllByLabelText("Option input").forEach((input) => {
    expect((input as HTMLInputElement).value).toBe("");
  });
});

test("API error during submission", async () => {
  mockSubmit.mockRejectedValueOnce(new Error("API Error"));
  render(<AddQuestion />);

  fireEvent.change(screen.getByPlaceholderText("Enter your question here"), {
    target: { value: "Test Question?" },
  });
  fireEvent.change(screen.getAllByLabelText("Option input")[0], {
    target: { value: "Option 1" },
  });
  fireEvent.change(screen.getAllByLabelText("Option input")[1], {
    target: { value: "Option 2" },
  });
  fireEvent.click(screen.getByText("Submit Question"));

  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith(
      "An error occurred while adding the question."
    );
  });
});
