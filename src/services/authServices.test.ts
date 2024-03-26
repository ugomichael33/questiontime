import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import { requestToken } from "./authService";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(axios);
});

afterEach(() => {
  mock.reset();
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

test("requests and returns a token on successful email submission", async () => {
  const fakeEmail = "test@example.com";
  const fakeToken = "token123";
  mockedAxios.post.mockResolvedValue({ data: { token: fakeToken } });

  const token = await requestToken(fakeEmail);

  expect(token).toBe(fakeToken);
  expect(mockedAxios.post).toHaveBeenCalledWith(
    `${API_BASE_URL}/token`,
    JSON.stringify({ email: fakeEmail }),
    { headers: { "Content-Type": "application/json" } }
  );
});

test("returns null on request failure", async () => {
  const fakeEmail = "test@example.com";
  mockedAxios.post.mockRejectedValue(new Error("Failed to request token"));

  const token = await requestToken(fakeEmail);

  expect(token).toBeNull();
  expect(mockedAxios.post).toHaveBeenCalledWith(
    `${API_BASE_URL}/token`,
    JSON.stringify({ email: fakeEmail }),
    { headers: { "Content-Type": "application/json" } }
  );
});

test("logs error details on request failure with response", async () => {
  const fakeEmail = "test@example.com";
  const errorResponse = {
    response: {
      data: { message: "Invalid request" },
      status: 400,
      headers: { "Content-Type": "application/json" },
    },
  };

  mockedAxios.post.mockRejectedValueOnce(errorResponse);

  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  const token = await requestToken(fakeEmail);

  expect(token).toBeNull();

  expect(consoleSpy).toHaveBeenCalledWith("Error data:", errorResponse.response.data);
  expect(consoleSpy).toHaveBeenCalledWith("Error status:", errorResponse.response.status);
  expect(consoleSpy).toHaveBeenCalledWith("Error headers:", errorResponse.response.headers);
  consoleSpy.mockRestore();
});

test("logs 'No response received' when a request is made but no response is received", async () => {
  const fakeEmail = "test@example.com";

  const errorRequest = {
    request: {
    }
  };

  mockedAxios.post.mockRejectedValueOnce(errorRequest);

  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  await requestToken(fakeEmail);

  expect(consoleSpy).toHaveBeenCalledWith("No response received:", errorRequest.request);
  consoleSpy.mockRestore();
});
