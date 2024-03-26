import React from "react";
import "@testing-library/jest-dom";
import { render, fireEvent, screen } from "@testing-library/react";

import { ConfirmationModal } from "./ConfirmationModal";

const mockOnClose = jest.fn();
const mockOnConfirm = jest.fn();
const question = "Do you really want to proceed?";

test("does not render when isOpen is false", () => {
  render(
    <ConfirmationModal
      isOpen={false}
      onClose={mockOnClose}
      onConfirm={mockOnConfirm}
      question={question}
    />
  );
  expect(
    screen.queryByText(
      `Are you sure you want to delete this question: "${question}"`
    )
  ).not.toBeInTheDocument();
});

test("renders correctly when isOpen is true", () => {
  render(
    <ConfirmationModal
      isOpen={true}
      onClose={mockOnClose}
      onConfirm={mockOnConfirm}
      question={question}
    />
  );
  expect(
    screen.getByText(
      `Are you sure you want to delete this question: "${question}"`
    )
  ).toBeInTheDocument();
});

test("calls onClose when the Cancel button is clicked", () => {
  render(
    <ConfirmationModal
      isOpen={true}
      onClose={mockOnClose}
      onConfirm={mockOnConfirm}
      question={question}
    />
  );
  fireEvent.click(screen.getByText("Cancel"));
  expect(mockOnClose).toHaveBeenCalledTimes(1);
});

test("calls onConfirm when the Delete button is clicked", () => {
  render(
    <ConfirmationModal
      isOpen={true}
      onClose={mockOnClose}
      onConfirm={mockOnConfirm}
      question={question}
    />
  );
  fireEvent.click(screen.getByText("Delete"));
  expect(mockOnConfirm).toHaveBeenCalledTimes(1);
});
