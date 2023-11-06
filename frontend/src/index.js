import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Paths from "./Paths";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
	dsn: "https://f4a0daaa0b47406f9e612e3b609e8391@o877317.ingest.sentry.io/6744154",
	integrations: [new BrowserTracing()],

	// We recommend adjusting this value in production, or using tracesSampler
	// for finer control
	tracesSampleRate: 1.0,
});

ReactDOM.render(<Paths />, document.getElementById("root"));
