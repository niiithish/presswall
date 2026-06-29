import { describe, expect, test } from "bun:test";
import { getPresswallNavPaths } from "@/lib/presswall-nav-paths";

describe("getPresswallNavPaths", () => {
  test("returns stable app-relative paths for App Bridge sidebar links", () => {
    expect(getPresswallNavPaths()).toEqual({
      home: "/",
      editor: "/editor",
    });
  });
});
