import { describe, it, expect, beforeEach, vi } from "vitest";
import { ErrorObject, isErrorObject, ResultObject } from "./index";

// Reset static config between tests
beforeEach(() => {
  ErrorObject.LOG_METHOD = console.log;
  ErrorObject.GENERIC_CODE = "generic";
  ErrorObject.GENERIC_MESSAGE = "Something went wrong";
  ErrorObject.GENERIC_TAG = "generic-error-object";
  ErrorObject.INCLUDE_DOMAIN_IN_STRING = false;
  ErrorObject.INCLUDE_CODE_IN_STRING = true;
});

// ─── Constructor ───

describe("constructor", () => {
  it("sets all properties from params", () => {
    const err = new ErrorObject({
      code: "not-found",
      message: "User not found",
      numberCode: 404,
      details: "No user with that ID exists",
      domain: "users",
      tag: "lookup",
      raw: { id: "abc" },
    });

    expect(err.code).toBe("not-found");
    expect(err.message).toBe("User not found");
    expect(err.numberCode).toBe(404);
    expect(err.details).toBe("No user with that ID exists");
    expect(err.domain).toBe("users");
    expect(err.tag).toBe("lookup");
    expect(err.raw).toEqual({ id: "abc" });
  });

  it("sets only required properties", () => {
    const err = new ErrorObject({ code: "fail", message: "Failed" });

    expect(err.code).toBe("fail");
    expect(err.message).toBe("Failed");
    expect(err.numberCode).toBeUndefined();
    expect(err.details).toBeUndefined();
    expect(err.domain).toBeUndefined();
    expect(err.tag).toBeUndefined();
    expect(err.raw).toBeUndefined();
  });

  it("sets name to code by default", () => {
    const err = new ErrorObject({ code: "my-code", message: "msg" });
    expect(err.name).toBe("my-code");
  });

  it("preserves name from raw object", () => {
    const raw = new Error("original");
    raw.name = "OriginalError";
    const err = new ErrorObject({ code: "wrapped", message: "msg", raw });
    expect(err.name).toBe("OriginalError");
  });

  it("preserves stack from raw object", () => {
    const raw = new Error("original");
    const err = new ErrorObject({ code: "wrapped", message: "msg", raw });
    expect(err.stack).toBe(raw.stack);
  });

  it("sets stack to undefined when raw has no stack", () => {
    const err = new ErrorObject({ code: "c", message: "m" });
    expect(err.stack).toBeUndefined();
  });
});

// ─── instanceof ───

describe("instanceof", () => {
  it("is instanceof ErrorObject", () => {
    const err = new ErrorObject({ code: "c", message: "m" });
    expect(err).toBeInstanceOf(ErrorObject);
  });

  it("is instanceof Error", () => {
    const err = new ErrorObject({ code: "c", message: "m" });
    expect(err).toBeInstanceOf(Error);
  });

  it("regular Error is not instanceof ErrorObject", () => {
    const err = new Error("regular");
    expect(err).not.toBeInstanceOf(ErrorObject);
  });
});

// ─── Subclassing ───

describe("subclassing", () => {
  class ApiError extends ErrorObject {}

  it("subclass is instanceof itself, ErrorObject, and Error", () => {
    const err = new ApiError({ code: "500", message: "Internal" });
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toBeInstanceOf(ErrorObject);
    expect(err).toBeInstanceOf(Error);
  });

  it("ErrorObject is not instanceof subclass", () => {
    const err = new ErrorObject({ code: "c", message: "m" });
    expect(err).not.toBeInstanceOf(ApiError);
  });
});

// ─── Type Guards ───

describe("type guards", () => {
  it("ErrorObject.is() returns true for ErrorObject", () => {
    expect(ErrorObject.is(ErrorObject.generic())).toBe(true);
  });

  it("ErrorObject.is() returns false for regular Error", () => {
    expect(ErrorObject.is(new Error("x"))).toBe(false);
  });

  it("ErrorObject.is() returns false for null/undefined/primitives", () => {
    expect(ErrorObject.is(null)).toBeFalsy();
    expect(ErrorObject.is(undefined)).toBeFalsy();
    expect(ErrorObject.is("string")).toBeFalsy();
    expect(ErrorObject.is(42)).toBeFalsy();
  });

  it("ErrorObject.is() returns true for object with discriminator", () => {
    const fake = { __isErrorObjectTypeDiscriminator: true };
    expect(ErrorObject.is(fake)).toBe(true);
  });

  it("isErrorObject() delegates to ErrorObject.is()", () => {
    expect(isErrorObject(ErrorObject.generic())).toBe(true);
    expect(isErrorObject(new Error("x"))).toBe(false);
    expect(isErrorObject(null)).toBeFalsy();
  });
});

// ─── Factory Methods ───

describe("factory methods", () => {
  it("generic() uses default values", () => {
    const err = ErrorObject.generic();
    expect(err.code).toBe("generic");
    expect(err.message).toBe("Something went wrong");
    expect(err.tag).toBe("generic-error-object");
  });

  it("generic() respects overridden static defaults", () => {
    ErrorObject.GENERIC_CODE = "error";
    ErrorObject.GENERIC_MESSAGE = "Oops";
    ErrorObject.GENERIC_TAG = "custom-tag";

    const err = ErrorObject.generic();
    expect(err.code).toBe("error");
    expect(err.message).toBe("Oops");
    expect(err.tag).toBe("custom-tag");
  });

  it("withTag() creates generic error with specific tag", () => {
    const err = ErrorObject.withTag("network");
    expect(err.tag).toBe("network");
    expect(err.code).toBe("generic");
    expect(err.message).toBe("Something went wrong");
  });
});

// ─── isGeneric / hasTag ───

describe("isGeneric and hasTag", () => {
  it("isGeneric() returns true for generic error", () => {
    expect(ErrorObject.generic().isGeneric()).toBe(true);
  });

  it("isGeneric() returns false for non-generic error", () => {
    const err = new ErrorObject({ code: "c", message: "m", tag: "custom" });
    expect(err.isGeneric()).toBe(false);
  });

  it("hasTag() without argument returns true when tag is set", () => {
    const err = new ErrorObject({ code: "c", message: "m", tag: "x" });
    expect(err.hasTag()).toBe(true);
  });

  it("hasTag() without argument returns false when no tag", () => {
    const err = new ErrorObject({ code: "c", message: "m" });
    expect(err.hasTag()).toBe(false);
  });

  it("hasTag(tag) returns true for matching tag", () => {
    const err = new ErrorObject({ code: "c", message: "m", tag: "x" });
    expect(err.hasTag("x")).toBe(true);
  });

  it("hasTag(tag) returns false for non-matching tag", () => {
    const err = new ErrorObject({ code: "c", message: "m", tag: "x" });
    expect(err.hasTag("y")).toBe(false);
  });
});

// ─── Clone ───

describe("clone", () => {
  it("creates a copy with same properties", () => {
    const original = new ErrorObject({
      code: "c",
      message: "m",
      numberCode: 1,
      details: "d",
      domain: "dom",
      tag: "t",
      raw: { x: 1 },
    });
    const cloned = original.clone();

    expect(cloned.code).toBe(original.code);
    expect(cloned.message).toBe(original.message);
    expect(cloned.numberCode).toBe(original.numberCode);
    expect(cloned.details).toBe(original.details);
    expect(cloned.domain).toBe(original.domain);
    expect(cloned.tag).toBe(original.tag);
    expect(cloned.raw).toEqual(original.raw);
  });

  it("clone is independent from original", () => {
    const original = new ErrorObject({ code: "c", message: "m" });
    const cloned = original.clone();
    cloned.setCode("changed");
    expect(original.code).toBe("c");
  });

  it("new() is an alias for clone()", () => {
    const original = new ErrorObject({ code: "c", message: "m" });
    const cloned = original.new();
    expect(cloned.code).toBe("c");
    expect(cloned.message).toBe("m");
  });
});

// ─── Chainable Setters ───

describe("chainable setters", () => {
  it("all setters return this", () => {
    const err = ErrorObject.generic();
    expect(err.setCode("x")).toBe(err);
    expect(err.setMessage("x")).toBe(err);
    expect(err.setNumberCode(1)).toBe(err);
    expect(err.setDetails("x")).toBe(err);
    expect(err.setDomain("x")).toBe(err);
    expect(err.setTag("x")).toBe(err);
    expect(err.setRaw("x")).toBe(err);
  });

  it("setters accept direct values", () => {
    const err = ErrorObject.generic()
      .setCode("new-code")
      .setMessage("new msg")
      .setNumberCode(500)
      .setDetails("detail")
      .setDomain("dom")
      .setTag("tag")
      .setRaw({ key: "val" });

    expect(err.code).toBe("new-code");
    expect(err.message).toBe("new msg");
    expect(err.numberCode).toBe(500);
    expect(err.details).toBe("detail");
    expect(err.domain).toBe("dom");
    expect(err.tag).toBe("tag");
    expect(err.raw).toEqual({ key: "val" });
  });

  it("setters accept transform functions", () => {
    const err = new ErrorObject({ code: "old", message: "hello" });
    err.setCode((old) => old + "-new");
    err.setMessage((old) => old + " world");
    expect(err.code).toBe("old-new");
    expect(err.message).toBe("hello world");
  });

  it("setNumberCode transform receives undefined when unset", () => {
    const err = new ErrorObject({ code: "c", message: "m" });
    err.setNumberCode((old) => (old ?? 0) + 1);
    expect(err.numberCode).toBe(1);
  });

  it("setDetails accepts transform function", () => {
    const err = new ErrorObject({ code: "c", message: "m", details: "old" });
    err.setDetails((old) => old + "-new");
    expect(err.details).toBe("old-new");
  });

  it("setDomain accepts transform function", () => {
    const err = new ErrorObject({ code: "c", message: "m", domain: "old" });
    err.setDomain((old) => old + "-new");
    expect(err.domain).toBe("old-new");
  });

  it("setTag accepts transform function", () => {
    const err = new ErrorObject({ code: "c", message: "m", tag: "old" });
    err.setTag((old) => old + "-new");
    expect(err.tag).toBe("old-new");
  });

  it("setRaw accepts transform function", () => {
    const err = new ErrorObject({ code: "c", message: "m", raw: { a: 1 } });
    err.setRaw((old: any) => ({ ...old, b: 2 }));
    expect(err.raw).toEqual({ a: 1, b: 2 });
  });

  it("setters can clear optional properties with undefined", () => {
    const err = new ErrorObject({
      code: "c",
      message: "m",
      details: "d",
      domain: "dom",
      tag: "t",
      numberCode: 1,
    });
    err.setDetails(undefined).setDomain(undefined).setTag(undefined).setNumberCode(undefined);
    expect(err.details).toBeUndefined();
    expect(err.domain).toBeUndefined();
    expect(err.tag).toBeUndefined();
    expect(err.numberCode).toBeUndefined();
  });
});

// ─── toString ───

describe("toString", () => {
  it("includes code by default", () => {
    const err = new ErrorObject({ code: "not-found", message: "Not found" });
    expect(err.toString()).toBe("Not found [not-found]");
  });

  it("returns only message when INCLUDE_CODE_IN_STRING is false", () => {
    ErrorObject.INCLUDE_CODE_IN_STRING = false;
    const err = new ErrorObject({ code: "c", message: "msg" });
    expect(err.toString()).toBe("msg");
  });

  it("includes domain when INCLUDE_DOMAIN_IN_STRING is true", () => {
    ErrorObject.INCLUDE_DOMAIN_IN_STRING = true;
    const err = new ErrorObject({ code: "c", message: "msg", domain: "auth" });
    expect(err.toString()).toBe("msg [auth/c]");
  });

  it("deduplicates when domain equals code", () => {
    ErrorObject.INCLUDE_DOMAIN_IN_STRING = true;
    const err = new ErrorObject({ code: "auth", message: "msg", domain: "auth" });
    expect(err.toString()).toBe("msg [auth]");
  });

  it("shows only domain when code is disabled", () => {
    ErrorObject.INCLUDE_CODE_IN_STRING = false;
    ErrorObject.INCLUDE_DOMAIN_IN_STRING = true;
    const err = new ErrorObject({ code: "c", message: "msg", domain: "auth" });
    expect(err.toString()).toBe("msg [auth]");
  });

  it("returns only message when both are disabled", () => {
    ErrorObject.INCLUDE_CODE_IN_STRING = false;
    ErrorObject.INCLUDE_DOMAIN_IN_STRING = false;
    const err = new ErrorObject({ code: "c", message: "msg", domain: "auth" });
    expect(err.toString()).toBe("msg");
  });

  it("returns only message when code is empty string", () => {
    const err = new ErrorObject({ code: "", message: "msg" });
    expect(err.toString()).toBe("msg");
  });
});

// ─── toJSON ───

describe("toJSON", () => {
  it("includes only set properties", () => {
    const err = new ErrorObject({ code: "c", message: "m" });
    expect(err.toJSON()).toEqual({ code: "c", message: "m" });
  });

  it("includes all properties when set", () => {
    const err = new ErrorObject({
      code: "c",
      message: "m",
      numberCode: 1,
      details: "d",
      domain: "dom",
      tag: "t",
      raw: "r",
    });
    expect(err.toJSON()).toEqual({
      code: "c",
      message: "m",
      numberCode: 1,
      details: "d",
      domain: "dom",
      tag: "t",
      raw: "r",
    });
  });

  it("does not include __isErrorObjectTypeDiscriminator", () => {
    const json = ErrorObject.generic().toJSON();
    expect(json).not.toHaveProperty("__isErrorObjectTypeDiscriminator");
  });
});

// ─── toDebugString ───

describe("toDebugString", () => {
  it("starts with toString() and includes [DEBUG] JSON", () => {
    const err = new ErrorObject({ code: "c", message: "m" });
    const debug = err.toDebugString();
    expect(debug).toContain("m [c]");
    expect(debug).toContain("[DEBUG]");
    expect(debug).toContain('"code": "c"');
    expect(debug).toContain('"message": "m"');
  });

  it("excludes __isErrorObjectTypeDiscriminator from JSON", () => {
    const debug = ErrorObject.generic().toDebugString();
    expect(debug).not.toContain("__isErrorObjectTypeDiscriminator");
  });

  it("excludes __isErrorObjectTypeDiscriminator even when it is the only extra property", () => {
    const err = new ErrorObject({ code: "c", message: "m" });
    // Verify the discriminator exists on the instance
    expect((err as any).__isErrorObjectTypeDiscriminator).toBe(true);
    const debug = err.toDebugString();
    // The replacer on line 178 should filter it out
    expect(debug).not.toContain("__isErrorObjectTypeDiscriminator");
    // But other keys should remain
    expect(debug).toContain('"code"');
    expect(debug).toContain('"message"');
  });

  it("excludes function properties from JSON", () => {
    const err = new ErrorObject({ code: "c", message: "m", raw: { fn: () => {} } });
    const debug = err.toDebugString();
    expect(debug).not.toContain('"fn"');
  });
});

// ─── Logging ───

describe("logging", () => {
  it("log() calls LOG_METHOD with tag and toString()", () => {
    const spy = vi.fn();
    ErrorObject.LOG_METHOD = spy;
    const err = new ErrorObject({ code: "c", message: "m" });
    err.log("TAG");
    expect(spy).toHaveBeenCalledWith("[TAG]", "m [c]");
  });

  it("debugLog() calls LOG_METHOD with tag and toDebugString()", () => {
    const spy = vi.fn();
    ErrorObject.LOG_METHOD = spy;
    const err = new ErrorObject({ code: "c", message: "m" });
    err.debugLog("TAG");
    expect(spy).toHaveBeenCalledWith("[TAG]", err.toDebugString());
  });

  it("log() returns this for chaining", () => {
    ErrorObject.LOG_METHOD = vi.fn();
    const err = ErrorObject.generic();
    expect(err.log("X")).toBe(err);
  });

  it("debugLog() returns this for chaining", () => {
    ErrorObject.LOG_METHOD = vi.fn();
    const err = ErrorObject.generic();
    expect(err.debugLog("X")).toBe(err);
  });

  it("does not call LOG_METHOD when it is null", () => {
    ErrorObject.LOG_METHOD = null;
    const err = ErrorObject.generic();
    expect(() => err.log("X")).not.toThrow();
    expect(() => err.debugLog("X")).not.toThrow();
  });
});

// ─── Throwing and Catching ───

describe("throw and catch", () => {
  it("can be thrown and caught", () => {
    const err = new ErrorObject({ code: "c", message: "m" });
    expect(() => {
      throw err;
    }).toThrow(err);
  });

  it("caught error is instanceof ErrorObject", () => {
    try {
      throw new ErrorObject({ code: "c", message: "m" });
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorObject);
      expect(e).toBeInstanceOf(Error);
    }
  });
});

// ─── ResultObject ───

describe("ResultObject", () => {
  describe("ok", () => {
    it("creates a success result with data", () => {
      const result = ResultObject.ok({ name: "Alice" });
      expect(result.data).toEqual({ name: "Alice" });
      expect(result.error).toBeUndefined();
    });

    it("works with primitive values", () => {
      expect(ResultObject.ok(42).data).toBe(42);
      expect(ResultObject.ok("hello").data).toBe("hello");
      expect(ResultObject.ok(true).data).toBe(true);
      expect(ResultObject.ok(null).data).toBe(null);
    });
  });

  describe("err", () => {
    it("creates an error result with ErrorObject", () => {
      const error = ErrorObject.generic();
      const result = ResultObject.err(error);
      expect(result.error).toBe(error);
      expect(result.data).toBeUndefined();
    });
  });

  describe("isOk / hasData / isData", () => {
    it("returns true for success result", () => {
      const result = ResultObject.ok("value");
      expect(result.isOk()).toBe(true);
      expect(result.hasData()).toBe(true);
      expect(result.isData()).toBe(true);
    });

    it("returns false for error result", () => {
      const result = ResultObject.err(ErrorObject.generic());
      expect(result.isOk()).toBe(false);
      expect(result.hasData()).toBe(false);
      expect(result.isData()).toBe(false);
    });
  });

  describe("isErr / isError", () => {
    it("returns true for error result", () => {
      const result = ResultObject.err(ErrorObject.generic());
      expect(result.isErr()).toBe(true);
      expect(result.isError()).toBe(true);
    });

    it("returns false for success result", () => {
      const result = ResultObject.ok("value");
      expect(result.isErr()).toBe(false);
      expect(result.isError()).toBe(false);
    });
  });

  describe("type narrowing", () => {
    it("narrows data after isOk()", () => {
      const result: ResultObject<{ name: string }> = ResultObject.ok({ name: "Alice" });
      if (result.isOk()) {
        // If this compiles, type narrowing works
        const name: string = result.data.name;
        expect(name).toBe("Alice");
      }
    });

    it("narrows error after isErr()", () => {
      const result: ResultObject<string> = ResultObject.err(
        new ErrorObject({ code: "fail", message: "Failed" }),
      );
      if (result.isErr()) {
        const code: string = result.error.code;
        expect(code).toBe("fail");
      }
    });
  });
});
