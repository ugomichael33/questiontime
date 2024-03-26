import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter } from "next/router";

import QuestionsPage from "../../src/pages/questions";
import FetchQuestions from "../../src/components/FetchQuestions";

jest.mock("../../src/components/FetchQuestions", () => {
  return jest.fn(() => <div>MockedFetchQuestions</div>);
});

jest.mock("next/router", () => ({
  useRouter: jest.fn().mockImplementation(() => ({
    push: jest.fn(),
  })),
}));

interface LocalStorageMock {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

const mockLocalStorage: LocalStorageMock = (function () {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
});

test("renders the QuestionsPage with FetchQuestions if token is present", async () => {
  window.localStorage.setItem("qt_token", "fake-token");
  render(<QuestionsPage />);

  await waitFor(() =>
    expect(screen.getByText("Question Management")).toBeInTheDocument()
  );
  expect(screen.getByText("MockedFetchQuestions")).toBeInTheDocument();
  expect(screen.getByText("Back to Home")).toBeInTheDocument();
  expect(screen.getByText("Add New Question")).toBeInTheDocument();
});
