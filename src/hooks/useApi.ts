import React, { useState, useCallback } from "react";
import axios, { AxiosRequestConfig, Method } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const useApi = <T>(initialData: T | null = null) => {
  const [data, setData] = useState<T | null>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const request = useCallback(
    async (
      endpoint: string,
      method: Method = "GET",
      body: any = null,
      extraHeaders: AxiosRequestConfig["headers"] = {}
    ): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("qt_token");
        const headers = {
          ...extraHeaders,
          ...(token ? { Token: token } : {}),
        };

        const response = await axios({
          url: `${API_BASE_URL}${endpoint}`,
          method,
          data: body,
          headers,
        });

        setData(response.data);
        setIsLoading(false);
        return response.data;
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  return { data, error, isLoading, request };
};

export default useApi;
