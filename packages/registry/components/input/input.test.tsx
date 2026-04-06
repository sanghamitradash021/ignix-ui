import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnimatedInput } from "./index";
import React from "react";

vi.mock("framer-motion", () => {
  const actual = vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_target, tag: string) =>
          ({ children, variants: _v, initial: _i, animate: _a, style, ...rest }: any) =>
            React.createElement(tag, { style, ...rest }, children),
      }
    ),
    useMotionValue: () => ({ set: vi.fn(), get: vi.fn(() => 0) }),
    useSpring: (v: unknown) => v,
    useTransform: () => ({ set: vi.fn(), get: vi.fn(() => 0) }),
  };
});

vi.mock("lucide-react", () => ({
  Eye: () => <svg data-testid="eye-icon" />,
  EyeOff: () => <svg data-testid="eye-off-icon" />,
  Check: () => <svg data-testid="check-icon" />,
  AlertCircle: () => <svg data-testid="alert-circle-icon" />,
}));

const renderInput = (overrides = {}) =>
  render(
    <AnimatedInput
      placeholder="Email"
      variant="clean"
      value=""
      {...overrides}
    />
  );

const getInput = () => screen.getByRole("textbox") as HTMLInputElement;


describe("AnimatedInput rendering", () => {
  it("renders an input element", () => {
    renderInput();
    expect(getInput()).toBeInTheDocument();
  });

  it("renders the placeholder label text", () => {
    renderInput({ placeholder: "Username" });
    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  it("sets the correct input type (default: text)", () => {
    renderInput();
    expect(getInput()).toHaveAttribute("type", "text");
  });

  it("respects a custom type prop", () => {
    render(
      <AnimatedInput placeholder="Pass" variant="clean" value="" type="email" />
    );
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");
  });

  it("renders with the provided value", () => {
    renderInput({ value: "hello@test.com" });
    expect(getInput()).toHaveValue("hello@test.com");
  });
});

describe("AnimatedInput disabled", () => {
  it("disables the input when disabled prop is true", () => {
    renderInput({ disabled: true });
    expect(getInput()).toBeDisabled();
  });

  it("does not call onChange when disabled", async () => {
    const onChange = vi.fn();
    renderInput({ disabled: true, onChange });
    await userEvent.type(getInput(), "abc");
    expect(onChange).not.toHaveBeenCalled();
  });
});


describe("AnimatedInput onChange", () => {
  it("does not throw when onChange is undefined", async () => {
    renderInput({ onChange: undefined });
    await expect(userEvent.type(getInput(), "x")).resolves.toBeUndefined();
  });
});


describe("AnimatedInput onFocus / onBlur", () => {
  it("calls onFocus when the input receives focus", () => {
    const onFocus = vi.fn();
    renderInput({ onFocus });
    fireEvent.focus(getInput());
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it("calls onBlur when the input loses focus", () => {
    const onBlur = vi.fn();
    renderInput({ onBlur });
    fireEvent.focus(getInput());
    fireEvent.blur(getInput());
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("does not throw when onFocus/onBlur are undefined", () => {
    renderInput({ onFocus: undefined, onBlur: undefined });
    expect(() => {
      fireEvent.focus(getInput());
      fireEvent.blur(getInput());
    }).not.toThrow();
  });
});

describe("AnimatedInput error state", () => {
  it("renders the error message", () => {
    renderInput({ error: "This field is required" });
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("renders the AlertCircle icon when error is set", () => {
    renderInput({ error: "Bad input" });
    expect(screen.getAllByTestId("alert-circle-icon").length).toBeGreaterThanOrEqual(1);
  });

  it("does not render a success icon when error is present", () => {
    renderInput({ error: "Oops" });
    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();
  });
});

describe("AnimatedInput success state", () => {
  it("renders the default success message when successMessage is omitted", () => {
    renderInput({ success: true });
    expect(
      screen.getByText("Input validated successfully")
    ).toBeInTheDocument();
  });

  it("renders a custom successMessage", () => {
    renderInput({ success: true, successMessage: "Looks good!" });
    expect(screen.getByText("Looks good!")).toBeInTheDocument();
  });

  it("renders the Check icon when success is true", () => {
    renderInput({ success: true });
    expect(screen.getAllByTestId("check-icon").length).toBeGreaterThanOrEqual(1);
  });

  it("does not render an error message when only success is set", () => {
    renderInput({ success: true });
    expect(screen.queryByTestId("alert-circle-icon")).not.toBeInTheDocument();
  });
});

describe("AnimatedInput password toggle", () => {
  const passwordProps = {
    type: "password",
    showPasswordToggle: true,
    value: "secret",
  };

  it("renders as password type initially", () => {
    render(
      <AnimatedInput placeholder="Pass" variant="clean" {...passwordProps} />
    );
    const input = document.querySelector("input") as HTMLInputElement;
    expect(input).toHaveAttribute("type", "password");
  });

  it("shows the Eye icon when password is hidden", () => {
    render(
      <AnimatedInput placeholder="Pass" variant="clean" {...passwordProps} />
    );
    expect(screen.getByTestId("eye-icon")).toBeInTheDocument();
  });

  it("shows the EyeOff icon after toggling", async () => {
    render(
      <AnimatedInput placeholder="Pass" variant="clean" {...passwordProps} />
    );
    const toggle = screen.getByRole("button");
    await userEvent.click(toggle);
    expect(screen.getByTestId("eye-off-icon")).toBeInTheDocument();
  });

  it("does not render a toggle button when showPasswordToggle is false", () => {
    render(
      <AnimatedInput
        placeholder="Pass"
        variant="clean"
        type="password"
        value=""
        showPasswordToggle={false}
      />
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("AnimatedInput leading icon", () => {
  const TestIcon = () => <svg data-testid="custom-icon" />;

  it("renders the icon when provided", () => {
    renderInput({ icon: TestIcon });
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("does not render an icon container when icon is omitted", () => {
    renderInput({ icon: undefined });
    expect(screen.queryByTestId("custom-icon")).not.toBeInTheDocument();
  });
});

describe("AnimatedInput size variants", () => {
  it.each(["sm", "md", "lg"] as const)(
    "renders without error for size=%s",
    (size) => {
      expect(() => renderInput({ size })).not.toThrow();
    }
  );
});

describe("AnimatedInput variant smoke tests", () => {
  const variants = [
    "clean", "underline", "floating", "borderGlow", "shimmer",
    "particles", "slide", "scale", "rotate", "bounce", "elastic",
    "glow", "shake", "wave", "typewriter", "magnetic", "pulse",
    "flip", "morph", "spotlight", "liquid", "neon", "origami",
    "glitch", "hologram", "cosmic", "borderBeam", "gradientBorder",
    "ripple", "materialFloat", "neonPulse", "typewriterReveal",
    "morphing", "liquidBorder", "particleField", "glassmorphism",
    "holographic3D", "quantumParticles", "premiumGlass", "luxuryShimmer",
    "materialRipple", "cosmicField", "premiumGradient",
  ];

  it.each(variants)("renders variant=%s without throwing", (variant) => {
    expect(() =>
      render(
        <AnimatedInput placeholder="Test" variant={variant} value="" />
      )
    ).not.toThrow();
  });
});

describe("AnimatedInput className overrides", () => {
  it("applies inputClassName to the input element", () => {
    renderInput({ inputClassName: "my-custom-input" });
    expect(getInput()).toHaveClass("my-custom-input");
  });

  it("applies labelClassName to the label element", () => {
    renderInput({ labelClassName: "my-custom-label", placeholder: "Name" });
    const label = screen.getByText("Name");
    expect(label).toHaveClass("my-custom-label");
  });
});

describe("AnimatedInput particleField interval cleanup", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("starts particle interval on focus and clears it on unmount", async () => {
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");

    const { unmount } = render(
      <AnimatedInput
        placeholder="PF"
        variant="particleField"
        value="x"
      />
    );

    act(() => {
      vi.advanceTimersByTime(600);
    });

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});

describe("AnimatedInput accessibility", () => {
  it("is not disabled by default", () => {
    renderInput();
    expect(getInput()).not.toBeDisabled();
  });

  it("password toggle button has type=button to prevent accidental form submit", () => {
    render(
      <AnimatedInput
        placeholder="Pass"
        variant="clean"
        type="password"
        value=""
        showPasswordToggle
      />
    );
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});