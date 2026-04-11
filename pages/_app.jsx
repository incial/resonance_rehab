import "@/styles/globals.css";
import { createElement } from "react";

export default function App({ Component, pageProps }) {
  return createElement(Component, pageProps);
}
