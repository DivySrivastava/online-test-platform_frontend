import React, { useContext } from "react";
import { LoaderContext } from "../contexts/LoaderContext";
import "./GlobalLoader.css";

const GlobalLoader = () => {
  const { loading } = useContext(LoaderContext);

  if (!loading) return null;

  return (
    <div className="global-loader-overlay">
      <img src="/images/sahash_logo.png" className="loader-logo" alt="Loading..." />
    </div>
  );
};

export default GlobalLoader;
