import { describe, expect, test } from "bun:test";
import {
  assertPresswallAppNavContract,
  getPresswallAppNavLinks,
} from "@/lib/presswall-app-nav-contract";

describe("presswall app nav contract", () => {
  test("declares Home override plus Editor sub-page per Shopify app-nav docs", () => {
    const paths = {
      home: "/",
      editor: "/editor",
    };

    expect(getPresswallAppNavLinks(paths)).toEqual([
      { href: paths.home, label: "Home", rel: "home" },
      { href: paths.editor, label: "Editor" },
    ]);
  });

  test("assertPresswallAppNavContract validates bridge-discoverable nav DOM", () => {
    const previousHtml = document.body.innerHTML;
    document.body.innerHTML = `
      <div aria-hidden="true" class="presswall-app-nav-host">
        <s-app-nav>
          <a href="/" rel="home">Home</a>
          <a href="/editor">Editor</a>
        </s-app-nav>
      </div>
    `;

    try {
      expect(() =>
        assertPresswallAppNavContract(document.body, {
          home: "/",
          editor: "/editor",
        })
      ).not.toThrow();
    } finally {
      document.body.innerHTML = previousHtml;
    }
  });
});
