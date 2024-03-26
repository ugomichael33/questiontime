import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { mocked } from "jest-mock";
import { toast } from "react-toastify";

import AddQuestion from "./AddQuestion";
import useApi from "../hooks/useApi";

const mockSubmit = jest.fn();

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

beforeEach(() => {
  jest.resetAllMocks();
  (useApi as jest.MockedFunction<typeof useApi>).mockImplementation(() => ({
    isLoading: false,
    error: null,
    data: null,
    request: mockSubmit,
  }));
});

afterEach(() => {
  jest.clearAllMocks();
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
  expect(screen.getAllByLabelText("Remove option").length).toBe(3);
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
    expect(useApi().request).not.toHaveBeenCalled();
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

test("prevents option removal and shows toast error when only two options exist", () => {
  render(<AddQuestion />);
  const removeButtons = screen.getAllByLabelText("Remove option");
  fireEvent.click(removeButtons[0]);

  fireEvent.click(removeButtons[1]);

  expect(toast.error).toHaveBeenCalledWith(
    "A question must have at least 2 options."
  );
  expect(screen.getAllByLabelText("Option input").length).toBe(2);
});

test("allows option removal when more than two options exist", () => {
  render(<AddQuestion />);

  const initialOptionsCount = screen.getAllByLabelText("Option input").length;
  expect(initialOptionsCount).toBe(3);

  const removeButtons = screen.getAllByLabelText("Remove option");
  fireEvent.click(removeButtons[0]);
  expect(screen.getAllByLabelText("Option input").length).toBe(2);
  expect(toast.error).not.toHaveBeenCalled();
});

test("does not show 'Add Option' button when there are 5 options", () => {
  render(<AddQuestion />);

  const addOptionButton = screen.getByText("Add Option");
  fireEvent.click(addOptionButton);
  fireEvent.click(addOptionButton);

  expect(screen.getAllByLabelText("Option input").length).toBe(5);
  expect(screen.queryByText("Add Option")).not.toBeInTheDocument();
});

test("button is disabled when fewer than two options are filled out", () => {
  render(<AddQuestion />);

  let submitButton = screen.getByText("Submit Question");
  expect(submitButton).toBeDisabled();
  fireEvent.change(screen.getAllByLabelText("Option input")[0], {
    target: { value: "Option 1" },
  });
  expect(submitButton).toBeDisabled(); 
  fireEvent.change(screen.getAllByLabelText("Option input")[1], {
    target: { value: "Option 2" },
  });
  expect(submitButton).not.toBeDisabled();

  fireEvent.change(screen.getAllByLabelText("Option input")[1], {
    target: { value: "" },
  });
  expect(submitButton).toBeDisabled();
});

test("successful submission", async () => {
  mockSubmit.mockResolvedValueOnce(true);
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
