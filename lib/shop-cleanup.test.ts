import { afterEach, describe, expect, mock, test } from "bun:test";

const deleteSessions = mock(() => Promise.resolve(true));
const findSessionsByShop = mock(() =>
  Promise.resolve([{ id: "offline_test.myshopify.com" }])
);

const deleteWhere = mock(() => Promise.resolve());
const transaction = mock(
  async (
    callback: (tx: { delete: () => { where: typeof deleteWhere } }) => unknown
  ) => {
    const tx = {
      delete: () => ({
        where: deleteWhere,
      }),
    };
    return callback(tx);
  }
);

mock.module("@/lib/session-storage", () => ({
  sessionStorage: {
    findSessionsByShop,
    deleteSessions,
  },
}));

mock.module("@/src/db", () => ({
  db: {
    transaction,
  },
}));

const { purgeShopData } = await import("@/lib/shop-cleanup");

describe("purgeShopData", () => {
  afterEach(() => {
    deleteSessions.mockClear();
    findSessionsByShop.mockClear();
    deleteWhere.mockClear();
    transaction.mockClear();
  });

  test("removes sessions and all shop-scoped records", async () => {
    await purgeShopData("test.myshopify.com");

    expect(findSessionsByShop).toHaveBeenCalledWith("test.myshopify.com");
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(deleteWhere).toHaveBeenCalledTimes(5);
    expect(deleteSessions).toHaveBeenCalledWith(["offline_test.myshopify.com"]);
  });
});
