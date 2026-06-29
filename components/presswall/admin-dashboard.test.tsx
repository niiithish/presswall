import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { createPresswallEditorFixture } from "@/lib/test-fixtures/presswall-editor-fixture";

const { AdminDashboardView } = await import("./admin-dashboard");

describe("AdminDashboard render routing", () => {
  afterEach(() => {
    cleanup();
  });

  test("renders merchant overview after onboarding", () => {
    const view = render(
      <AdminDashboardView
        editor={createPresswallEditorFixture({ needsOnboarding: false })}
      />
    );

    expect(view.getByText("Quick actions")).toBeTruthy();
    expect(view.getByText("Storefront preview")).toBeTruthy();
    expect(view.queryByText("Discard")).toBeNull();
  });

  test("renders onboarding flow while needsOnboarding is true", () => {
    const view = render(
      <AdminDashboardView
        editor={createPresswallEditorFixture({ needsOnboarding: true })}
      />
    );

    expect(view.getByText("Step 1 of 3 — Add your press logos")).toBeTruthy();
    expect(view.queryByText("Quick actions")).toBeNull();
  });

  test("renders loading skeleton while editor is loading", () => {
    const view = render(
      <AdminDashboardView
        editor={createPresswallEditorFixture({
          isLoading: true,
          needsOnboarding: true,
        })}
      />
    );

    expect(view.container.querySelector(".animate-pulse")).toBeTruthy();
    expect(view.queryByText("Quick actions")).toBeNull();
  });
});
