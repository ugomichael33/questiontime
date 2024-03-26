import { act, renderHook } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

import useApi from "./useApi";

const axiosMock = new MockAdapter(axios);

let mock: MockAdapter;

const localStorageMock = (function () {
  let store: Record<string, string> = {};
  return {
    getItem(key: string): string | null {
      return store[key] || null;
    },
    setItem(key: string, value: string): void {
      store[key] = value.toString();
    },
    clear(): void {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

beforeEach(() => {
  mock = new MockAdapter(axios);
});

afterEach(() => {
  mock.reset();
});

test("handles errors correctly", async () => {
  axiosMock.onGet("/test").networkError();

  const { result } = renderHook(() => useApi(null));

  await act(async () => {
    result.current.request("/test").catch(() => {});
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  await waitFor(() => expect(result.current.error).not.toBeNull());
});

test("should handle initial state correctly", () => {
  const { result } = renderHook(() => useApi(null));
  expect(result.current.data).toBeNull();
  expect(result.current.isLoading).toBeFalsy();
  expect(result.current.error).toBeNull();
});

test("should update state correctly on failed request", async () => {
  mock.onGet("/test").networkError();

  const { result } = renderHook(() => useApi(null));

  await act(async () => {
    try {
      await result.current.request("/test");
    } catch (error) {
    }
  });

  expect(result.current.error).toBeDefined();
  expect(result.current.isLoading).toBeFalsy();
});

test("should update state correctly on successful request", async () => {
  const mockData = { id: 1, name: "Test" };
  const endpoint = "/test";

  mock
    .onGet(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`)
    .reply(200, mockData);

  const { result } = renderHook(() => useApi(null));
  await act(async () => {
    await result.current.request(endpoint);
  });

  expect(result.current.data).toEqual(mockData);
  expect(result.current.isLoading).toBe(false);
  expect(result.current.error).toBeNull();
});

test("should include Token header when token is present", async () => {
  const mockData = { id: 1, name: "Test" };
  const endpoint = "/test";
  const token = "fake-token";

  localStorageMock.setItem("qt_token", token);

  mock.onGet(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
    headers: { Token: token },
  }).reply(200, mockData);

  const { result } = renderHook(() => useApi(null));
  await act(async () => {
    await result.current.request(endpoint);
  });

  expect(result.current.data).toEqual(mockData);
  expect(result.current.isLoading).toBe(false);
  expect(result.current.error).toBeNull();
});