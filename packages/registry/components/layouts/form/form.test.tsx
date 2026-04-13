import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Form, FormField, InputWrapper, type FormProps } from "./index";
import React from "react";

const renderForm = (props: Partial<FormProps> = {}, children: React.ReactNode = "content") =>
    render(<Form {...props}>{children}</Form>);

const getForm = () => screen.getByText(/content/i).closest("div") as HTMLElement;

describe("Form", () => {

    describe("rendering", () => {
        it("renders children", () => {
            renderForm({}, "Hello Form");
            expect(screen.getByText("Hello Form")).toBeInTheDocument();
        });

        it("renders as a div", () => {
            renderForm();
            expect(getForm().tagName).toBe("DIV");
        });

        it("exposes displayName", () => {
            expect(Form.displayName).toBe("Form");
        });

        it("always applies the base w-full class", () => {
            renderForm();
            expect(getForm().className).toContain("w-full");
        });

        it("forwards a ref to the underlying div", () => {
            const ref = React.createRef<HTMLDivElement>();
            render(<Form ref={ref}>content</Form>);
            expect(ref.current).not.toBeNull();
            expect(ref.current?.tagName).toBe("DIV");
        });
    });

    describe("spacing prop", () => {
        const cases: Array<[FormProps["spacing"], string]> = [
            ["tight", "space-y-2"],
            ["compact", "space-y-3"],
            ["comfortable", "space-y-4"],
            ["relaxed", "space-y-6"],
        ];

        it.each(cases)("spacing='%s' class '%s'", (spacing, expected) => {
            renderForm({ spacing });
            expect(getForm().className).toContain(expected);
        });

        it("defaults to 'comfortable' (space-y-4)", () => {
            renderForm();
            expect(getForm().className).toContain("space-y-4");
        });
    });

    describe("width prop", () => {
        it("width='narrow' w-80", () => {
            renderForm({ width: "narrow" });
            expect(getForm().className).toContain("w-80");
        });

        it.each(["normal", "wide", "full"] as FormProps["width"][])("width='%s' → w-full", (width) => {
            renderForm({ width });
            expect(getForm().className).toContain("w-full");
        });

        it("defaults to 'normal' (w-full)", () => {
            renderForm();
            expect(getForm().className).toContain("w-full");
        });
    });

    describe("maxWidth prop", () => {
        const cases: Array<[FormProps["maxWidth"], string]> = [
            ["readable", "max-w-2xl"],
            ["content", "max-w-3xl"],
            ["prose", "max-w-4xl"],
            ["container", "max-w-6xl"],
            ["none", "max-w-none"],
        ];

        it.each(cases)("maxWidth='%s' class '%s'", (maxWidth, expected) => {
            renderForm({ maxWidth });
            expect(getForm().className).toContain(expected);
        });

        it("defaults to 'readable' (max-w-2xl)", () => {
            renderForm();
            expect(getForm().className).toContain("max-w-2xl");
        });
    });

    describe("labels prop", () => {
        it("labels='top' includes label block/mb/text-sm selectors", () => {
            renderForm({ labels: "top" });
            const cls = getForm().className;
            expect(cls).toContain("[&_label]:block");
            expect(cls).toContain("[&_label]:mb-1");
            expect(cls).toContain("[&_label]:text-sm");
            expect(cls).toContain("[&_label]:font-medium");
        });

        it("labels='left' includes grid-cols-3 form-field selectors", () => {
            renderForm({ labels: "left" });
            const cls = getForm().className;
            expect(cls).toContain("[&_.form-field]:grid");
            expect(cls).toContain("[&_.form-field]:grid-cols-3");
            expect(cls).toContain("[&_.form-field_.input-wrapper]:col-span-2");
        });

        it("labels='floating' includes absolute/translate selectors", () => {
            renderForm({ labels: "floating" });
            const cls = getForm().className;
            expect(cls).toContain("[&_.form-field_label]:absolute");
            expect(cls).toContain("[&_.form-field_label]:-translate-y-1/2");
            expect(cls).toContain("[&_.form-field_label]:bg-background");
        });

        it("defaults to 'top' labels", () => {
            renderForm();
            expect(getForm().className).toContain("[&_label]:block");
        });
    });

    describe("columns prop", () => {
        describe("grid activation", () => {
            it("applies grid class when desktop > 1", () => {
                renderForm({ columns: { desktop: 2 } });
                expect(getForm().className).toContain("grid");
            });

            it("applies grid class when mobile > 1", () => {
                renderForm({ columns: { mobile: 2 } });
                expect(getForm().className).toContain("grid");
            });

            it("applies grid class when tablet > 1", () => {
                renderForm({ columns: { tablet: 2, desktop: 1 } });
                expect(getForm().className).toContain("grid");
            });

            it("does NOT apply grid when all columns are 1 (default)", () => {
                renderForm({ columns: { desktop: 1, mobile: 1 } });
                expect(getForm().className).not.toContain("grid");
            });

            it("does NOT apply grid when columns prop is absent", () => {
                renderForm();
                expect(getForm().className).not.toContain("grid");
            });

            it("applies gap-x-4 when grid is active", () => {
                renderForm({ columns: { desktop: 2 } });
                expect(getForm().className).toContain("gap-x-4");
            });
        });
    });

    describe("HTML attribute passthrough", () => {
        it("forwards id attribute", () => {
            renderForm({ id: "login-form" });
            expect(getForm()).toHaveAttribute("id", "login-form");
        });

        it("forwards aria-label attribute", () => {
            renderForm({ "aria-label": "sign up" });
            expect(getForm()).toHaveAttribute("aria-label", "sign up");
        });

        it("forwards role attribute", () => {
            renderForm({ role: "form" });
            expect(screen.getByRole("form")).toBeInTheDocument();
        });
    });

    describe("prop combinations", () => {
        it("applies all explicit props correctly together", () => {
            renderForm({
                spacing: "relaxed",
                width: "narrow",
                maxWidth: "container",
                labels: "left",
            });
            const cls = getForm().className;
            expect(cls).toContain("space-y-6");
            expect(cls).toContain("w-80");
            expect(cls).toContain("max-w-6xl");
            expect(cls).toContain("[&_.form-field]:grid");
        });

        it("grid and spacing coexist without conflict", () => {
            renderForm({
                spacing: "compact",
                columns: { desktop: 2, tablet: 2, mobile: 1 },
            });
            const cls = getForm().className;
            expect(cls).toContain("space-y-3");
            expect(cls).toContain("grid");
            expect(cls).toContain("md:grid-cols-2");
        });
    });
});

describe("FormField", () => {
    it("renders children", () => {
        render(<FormField>Field content</FormField>);
        expect(screen.getByText("Field content")).toBeInTheDocument();
    });

    it("renders as a div", () => {
        render(<FormField data-testid="ff">child</FormField>);
        expect(screen.getByTestId("ff").tagName).toBe("DIV");
    });

    it("always has the 'form-field' class", () => {
        render(<FormField data-testid="ff">child</FormField>);
        expect(screen.getByTestId("ff").className).toContain("form-field");
    });

    it("merges custom className with form-field", () => {
        render(<FormField className="extra-class" data-testid="ff">child</FormField>);
        const el = screen.getByTestId("ff");
        expect(el.className).toContain("form-field");
        expect(el.className).toContain("extra-class");
    });

    it("forwards a ref to the div", () => {
        const ref = React.createRef<HTMLDivElement>();
        render(<FormField ref={ref}>child</FormField>);
        expect(ref.current?.tagName).toBe("DIV");
    });

    it("exposes displayName", () => {
        expect(FormField.displayName).toBe("FormField");
    });

    it("forwards arbitrary HTML attributes", () => {
        render(<FormField id="field-1" aria-label="email field" data-testid="ff">child</FormField>);
        const el = screen.getByTestId("ff");
        expect(el).toHaveAttribute("id", "field-1");
        expect(el).toHaveAttribute("aria-label", "email field");
    });

    it("renders without children without crashing", () => {
        expect(() => render(<FormField />)).not.toThrow();
    });
});

describe("InputWrapper", () => {
    it("renders children", () => {
        render(<InputWrapper>input goes here</InputWrapper>);
        expect(screen.getByText("input goes here")).toBeInTheDocument();
    });

    it("renders as a div", () => {
        render(<InputWrapper data-testid="iw">child</InputWrapper>);
        expect(screen.getByTestId("iw").tagName).toBe("DIV");
    });

    it("always has the 'input-wrapper' class", () => {
        render(<InputWrapper data-testid="iw">child</InputWrapper>);
        expect(screen.getByTestId("iw").className).toContain("input-wrapper");
    });

    it("merges custom className with input-wrapper", () => {
        render(<InputWrapper className="custom-wrap" data-testid="iw">child</InputWrapper>);
        const el = screen.getByTestId("iw");
        expect(el.className).toContain("input-wrapper");
        expect(el.className).toContain("custom-wrap");
    });

    it("forwards a ref to the div", () => {
        const ref = React.createRef<HTMLDivElement>();
        render(<InputWrapper ref={ref}>child</InputWrapper>);
        expect(ref.current?.tagName).toBe("DIV");
    });

    it("exposes displayName", () => {
        expect(InputWrapper.displayName).toBe("InputWrapper");
    });

    it("forwards arbitrary HTML attributes", () => {
        render(<InputWrapper id="wrap-1" role="group" data-testid="iw">child</InputWrapper>);
        const el = screen.getByTestId("iw");
        expect(el).toHaveAttribute("id", "wrap-1");
        expect(screen.getByRole("group")).toBeInTheDocument();
    });

    it("renders without children without crashing", () => {
        expect(() => render(<InputWrapper />)).not.toThrow();
    });
});

describe("Form + FormField + InputWrapper composition", () => {
    it("renders a complete form structure without errors", () => {
        render(
            <Form data-testid="form" labels="left">
                <FormField data-testid="field">
                    <label htmlFor="email">Email</label>
                    <InputWrapper data-testid="wrapper">
                        <input id="email" placeholder="you@example.com" />
                    </InputWrapper>
                </FormField>
            </Form>
        );
        expect(screen.getByTestId("form")).toBeInTheDocument();
        expect(screen.getByTestId("field").className).toContain("form-field");
        expect(screen.getByTestId("wrapper").className).toContain("input-wrapper");
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    it("FormField sits inside Form and inherits label variant styles via CSS selectors", () => {
        render(
            <Form labels="top" data-testid="form">
                <FormField data-testid="field">
                    <label>Name</label>
                    <input placeholder="name" />
                </FormField>
            </Form>
        );
        expect(screen.getByTestId("form").className).toContain("[&_label]:block");
    });

    it("renders multiple FormFields inside a grid Form", () => {
        render(
            <Form columns={{ desktop: 2, mobile: 1 }} data-testid="form">
                <FormField data-testid="f1"><input placeholder="first" /></FormField>
                <FormField data-testid="f2"><input placeholder="last" /></FormField>
            </Form>
        );
        expect(screen.getByTestId("form").className).toContain("grid");
        expect(screen.getByTestId("f1")).toBeInTheDocument();
        expect(screen.getByTestId("f2")).toBeInTheDocument();
    });
});