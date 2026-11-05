import assert from "node:assert/strict";
import { test } from "node:test";
import { decideAccess } from "../src/lib/access-decision.ts";

test("approval emails only after successful update, to the database recipient", async () => {
  const calls = [];
  const result = await decideAccess({ status: "pending", email: "visitor@example.test" }, "approved", false, {
    update: async (old, next) => { calls.push([old, next]); return true; },
    notify: async email => { calls.push(email); },
  });
  assert.equal(result, "email_sent");
  assert.deepEqual(calls, [["pending", "approved"], "visitor@example.test"]);
});

test("rejection and duplicate approval never email", async () => {
  for (const [old, next] of [["pending", "rejected"], ["approved", "rejected"], ["approved", "approved"]]) {
    let sent = false;
    await decideAccess({ status: old, email: "visitor@example.test" }, next, false, {
      update: async () => true, notify: async () => { sent = true; },
    });
    assert.equal(sent, false);
  }
});

test("concurrent decision or failed database update never sends", async () => {
  const notify = async () => { assert.fail("must not send"); };
  assert.equal(await decideAccess({ status: "pending", email: "visitor@example.test" }, "approved", false,
    { update: async () => false, notify }), "stale");
  await assert.rejects(decideAccess({ status: "pending", email: "visitor@example.test" }, "approved", false,
    { update: async () => { throw Error("database"); }, notify }));
});

test("SMTP failure preserves approval and returns an explicit warning", async () => {
  let approved = false;
  const result = await decideAccess({ status: "pending", email: "visitor@example.test" }, "approved", false, {
    update: async () => { approved = true; return true; },
    notify: async () => { throw Error("SMTP unavailable"); },
  });
  assert.equal(approved, true);
  assert.equal(result, "email_failed");
});

test("explicit retry emails an approved user without changing access", async () => {
  let sent = 0;
  const deps = { update: async () => { assert.fail("retry must not change access"); }, notify: async () => { sent++; } };
  assert.equal(await decideAccess({ status: "approved", email: "visitor@example.test" }, "approved", true, deps), "email_sent");
  assert.equal(await decideAccess({ status: "rejected", email: "visitor@example.test" }, "approved", true, deps), "unchanged");
  assert.equal(sent, 1);
});
