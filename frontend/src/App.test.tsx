import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {
  it("when rendered, then it shows the getting started heading", () => {
    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain("Get started");
  });
});
