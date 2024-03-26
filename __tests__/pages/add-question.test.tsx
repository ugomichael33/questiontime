import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Link from "next/link";

import AddQuestionPage from "../../src/pages/add-question";
import AddQuestion from "../../src/components/AddQuestion";

jest.mock("../../src/components/AddQuestion", () => {
  return jest.fn(() => <div>AddQuestionComponentMock</div>);
});

jest.mock("next/link", () => {
  return jest.fn(({ children }) => {
    return children;
  });
});

test("renders the page with a title, the AddQuestion component, and a back link", () => {
  render(<AddQuestionPage />);

  expect(screen.getByText("Add a New Question")).toBeInTheDocument();

  expect(screen.getByText("AddQuestionComponentMock")).toBeInTheDocument();

  expect(screen.getByText("Back to Questions")).toBeInTheDocument();
});
