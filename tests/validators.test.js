/**
 * Tests for the form validation.
 *
 * The requirement is that no form can be submitted before it is valid, so these
 * check the rules that decide that: which fields report a problem, and when.
 *
 * Run with: npm test
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { MAX_NOTE_LENGTH, validateCredentials, validateNote } from "../src/js/utils/validators.js";

describe("validateCredentials", () => {
  it("accepts a valid email and password", () => {
    const errors = validateCredentials(
      { email: "name@example.com", password: "secret123" },
      "sign-in",
    );

    assert.deepEqual(errors, {});
  });

  it("reports an empty email", () => {
    const errors = validateCredentials({ email: "", password: "secret123" }, "sign-in");

    assert.ok(errors.email);
  });

  it("reports an email that is only whitespace", () => {
    const errors = validateCredentials({ email: "   ", password: "secret123" }, "sign-in");

    assert.ok(errors.email);
  });

  it("reports an address with no @", () => {
    const errors = validateCredentials({ email: "nameexample.com", password: "secret123" }, "sign-in");

    assert.ok(errors.email);
  });

  it("reports an address with no dot in the domain", () => {
    const errors = validateCredentials({ email: "name@example", password: "secret123" }, "sign-in");

    assert.ok(errors.email);
  });

  it("accepts an address with a plus tag and a subdomain", () => {
    const errors = validateCredentials(
      { email: "name+recipes@mail.example.co.uk", password: "secret123" },
      "sign-in",
    );

    assert.equal(errors.email, undefined);
  });

  it("ignores whitespace around the address", () => {
    const errors = validateCredentials(
      { email: "  name@example.com  ", password: "secret123" },
      "sign-in",
    );

    assert.equal(errors.email, undefined);
  });

  it("reports an empty password", () => {
    const errors = validateCredentials({ email: "name@example.com", password: "" }, "sign-in");

    assert.ok(errors.password);
  });

  it("allows a short password when signing in", () => {
    // An existing account may predate any length rule, so signing in must not
    // second-guess the password that was chosen.
    const errors = validateCredentials({ email: "name@example.com", password: "abc" }, "sign-in");

    assert.equal(errors.password, undefined);
  });

  it("rejects a short password when creating an account", () => {
    const errors = validateCredentials({ email: "name@example.com", password: "abc" }, "register");

    assert.ok(errors.password);
  });

  it("accepts a six character password when creating an account", () => {
    const errors = validateCredentials({ email: "name@example.com", password: "abcdef" }, "register");

    assert.equal(errors.password, undefined);
  });

  it("reports both fields at once", () => {
    const errors = validateCredentials({ email: "", password: "" }, "sign-in");

    assert.ok(errors.email);
    assert.ok(errors.password);
  });
});

describe("validateNote", () => {
  it("accepts an empty note, because a note is optional", () => {
    assert.equal(validateNote(""), "");
  });

  it("accepts a short note", () => {
    assert.equal(validateNote("Halve the chilli"), "");
  });

  it("accepts a note of exactly the maximum length", () => {
    assert.equal(validateNote("a".repeat(MAX_NOTE_LENGTH)), "");
  });

  it("rejects a note one character too long", () => {
    assert.notEqual(validateNote("a".repeat(MAX_NOTE_LENGTH + 1)), "");
  });
});
