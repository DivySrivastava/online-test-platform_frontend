import axios from "axios";
import { useContext, useEffect } from "react";
import { LoaderContext } from "../contexts/LoaderContext";

// Guard so interceptors are attached only ONCE for the whole app,
// no matter how many times/components call useAxios().
let interceptorsAttached = false;
let pendingRequests = 0;

export const useAxios = () => {
  const { setLoading } = useContext(LoaderContext);

  useEffect(() => {
    if (interceptorsAttached) return; // already set up, don't duplicate
    interceptorsAttached = true;

    axios.interceptors.request.use((config) => {
      pendingRequests += 1;
      setLoading(true);
      return config;
    });

    axios.interceptors.response.use(
      (res) => {
        pendingRequests = Math.max(0, pendingRequests - 1);
        if (pendingRequests === 0) setLoading(false);
        return res;
      },
      (error) => {
        pendingRequests = Math.max(0, pendingRequests - 1);
        if (pendingRequests === 0) setLoading(false);
        return Promise.reject(error);
      }
    );
  }, [setLoading]);

  return axios;
};