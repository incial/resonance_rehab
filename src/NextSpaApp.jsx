import React from "react";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";

const NextSpaApp = () => {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

export default NextSpaApp;
