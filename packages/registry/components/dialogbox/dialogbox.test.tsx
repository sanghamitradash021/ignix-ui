import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import React, { useContext } from "react";
import { DialogProvider, DialogContext } from "./index";

vi.mock('framer-motion', () => {
  const motion = new Proxy(
    {},
    {
      get: (_target, tagName: string) => {
        if (typeof tagName !== 'string' || tagName === '__esModule' || tagName === 'default') {
          return undefined;
        }
        return React.forwardRef(({
          children, whileHover: _wh, whileTap: _wt, animate: _an, initial: _in, exit: _ex,
          transition: _tr, layout: _ly, onAnimationStart: _oas, onAnimationComplete: _oac,
          onUpdate: _ou, variants: _vr, ...props
        }: any, ref: any) => {
          return React.createElement(tagName, { ...props, ref }, children);
        });
      },
    }
  );

  return {
    motion,
    AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
  };
});

vi.mock('lucide-react', () => {
  const MockIcon = (props: any) => React.createElement('svg', props);
  return {
    X: MockIcon,
    Check: MockIcon,
    AlertTriangle: MockIcon,
    Info: MockIcon,
    XCircle: MockIcon,
  };
});

const TestConsumer = ({
  dialogOptions = { title: "Test Title", content: "Test Content" }
}: {
  dialogOptions?: any
}) => {
  const { openDialog, closeDialog } = useContext(DialogContext);
  return (
    <div data-testid="test-consumer">
      <button onClick={() => openDialog(dialogOptions)}>Open Dialog</button>
      <button onClick={() => closeDialog()}>Close Dialog</button>
    </div>
  );
};

describe("DialogBox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children and handles basic open/close flow", async () => {
    render(
      <DialogProvider>
        <TestConsumer dialogOptions={{ title: "Flow Test", content: "Flow Content" }} />
      </DialogProvider>
    );

    fireEvent.click(screen.getByText("Open Dialog"));
    expect(await screen.findByText("Flow Test")).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText("Flow Test")).not.toBeInTheDocument();
    });
  });

  it("calls confirmationCallBack when confirmed", async () => {
    const callback = vi.fn();
    render(
      <DialogProvider>
        <TestConsumer
          dialogOptions={{
            title: "Confirm Me",
            dialogType: "confirm",
            confirmationCallBack: callback
          }}
        />
      </DialogProvider>
    );

    fireEvent.click(screen.getByText("Open Dialog"));

    const confirmBtn = await screen.findByRole('button', { name: /Confirm/i });
    fireEvent.click(confirmBtn);

    expect(callback).toHaveBeenCalledWith(true);
  });

  it("renders custom children content", async () => {
    render(
      <DialogProvider>
        <TestConsumer
          dialogOptions={{
            title: "Custom Title",
            children: <div data-testid="custom-child">Custom Content</div>
          }}
        />
      </DialogProvider>
    );

    fireEvent.click(screen.getByText("Open Dialog"));
    expect(await screen.findByTestId("custom-child")).toBeInTheDocument();
  });

  it("respects showCloseButton prop", async () => {
    render(
      <DialogProvider>
        <TestConsumer dialogOptions={{ title: "No Close", showCloseButton: false }} />
      </DialogProvider>
    );

    fireEvent.click(screen.getByText("Open Dialog"));
    await screen.findByText("No Close");

    const allButtons = screen.getAllByRole('button');
    const headerCloseButton = allButtons.find(b =>
      b.classList.contains('w-10') &&
      b.classList.contains('h-10') &&
      (!b.textContent || b.textContent.trim() === "")
    );

    expect(headerCloseButton).toBeUndefined();
  });

  it("applies size classes to dialog", async () => {
    render(
      <DialogProvider>
        <TestConsumer dialogOptions={{ title: "Sized Dialog", size: "lg" }} />
      </DialogProvider>
    );

    fireEvent.click(screen.getByText("Open Dialog"));
    const dialog = await screen.findByText("Sized Dialog");

    const container = dialog.closest('.rounded-2xl.shadow-2xl');
    expect(container).toHaveClass("max-w-lg");
  });
});
