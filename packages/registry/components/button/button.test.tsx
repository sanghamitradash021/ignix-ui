import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { Button, buttonVariants } from './index';

vi.mock('framer-motion', () => {
  const motion = new Proxy(
    {},
    {
      get: (_target, tag: string) =>
        React.forwardRef<HTMLElement, any>(
          (
            {
              children,
              initial: _i,
              animate: _a,
              exit: _e,
              variants: _v,
              transition: _t,
              whileHover: _wh,
              whileTap: _wt,
              custom: _c,
              ...rest
            },
            ref,
          ) => React.createElement(tag, { ...rest, ref }, children),
        ),
    },
  );

  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

vi.mock('@radix-ui/react-slot', () => ({
  Slot: React.forwardRef<HTMLElement, any>(({ children, ...props }, ref) => {
    if (React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, { ...props, ref });
    }
    return <span ref={ref as any} {...props}>{children}</span>;
  }),
}));

const renderButton = (props: Partial<React.ComponentProps<typeof Button>> = {}) =>
  render(<Button {...props}>{props.children ?? 'Click me'}</Button>);

describe('Button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      renderButton();
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('renders children text', () => {
      renderButton({ children: 'Submit' });
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('renders children with JSX', () => {
      render(
        <Button>
          <span data-testid="icon">★</span> Star
        </Button>,
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Star')).toBeInTheDocument();
    });

    it('renders as a <button> element by default', () => {
      renderButton();
      expect(screen.getByRole('button').tagName).toBe('BUTTON');
    });
  });

  describe('Variant Prop', () => {
    const variantCases: Array<
      [NonNullable<React.ComponentProps<typeof Button>['variant']>, string]
    > = [
        ['default', 'bg-primary'],
        ['primary', 'bg-secondary'],
        ['secondary', 'bg-muted'],
        ['success', 'bg-success'],
        ['warning', 'bg-warning'],
        ['danger', 'bg-destructive'],
        ['outline', 'border'],
        ['ghost', 'hover:bg-accent'],
        ['link', 'underline-offset-4'],
        ['subtle', 'bg-accent'],
        ['elevated', 'shadow-md'],
        ['glass', 'backdrop-blur-lg'],
        ['neon', 'bg-pink-500'],
      ];

    it.each(variantCases)(
      'variant="%s" applies class containing "%s"',
      (variant, expectedClass) => {
        renderButton({ variant });
        const button = screen.getByRole('button');
        expect(button.className).toContain(expectedClass);
      },
    );

    it('defaults to "default" variant when variant prop is omitted', () => {
      renderButton();
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-primary');
    });

    it('variant="none" applies no extra visual classes', () => {
      renderButton({ variant: 'none' });
      const button = screen.getByRole('button');
      expect(button.className).not.toContain('bg-primary');
      expect(button.className).not.toContain('bg-secondary');
    });
  });

  describe('Size Prop', () => {
    const sizeCases: Array<
      [NonNullable<React.ComponentProps<typeof Button>['size']>, string]
    > = [
        ['xs', 'h-8'],
        ['sm', 'h-9'],
        ['md', 'h-10'],
        ['lg', 'h-12'],
        ['xl', 'h-14'],
        ['icon', 'w-10'],
        ['pill', 'rounded-full'],
        ['block', 'w-full'],
        ['compact', 'text-xs'],
        ['wide', 'px-12'],
      ];

    it.each(sizeCases)(
      'size="%s" applies class containing "%s"',
      (size, expectedClass) => {
        renderButton({ size });
        const button = screen.getByRole('button');
        expect(button.className).toContain(expectedClass);
      },
    );

    it('defaults to "md" size when size prop is omitted', () => {
      renderButton();
      const button = screen.getByRole('button');
      expect(button.className).toContain('h-10');
    });
  });

  describe('className Passthrough', () => {
    it('applies custom className', () => {
      renderButton({ className: 'my-custom-class' });
      const button = screen.getByRole('button');
      expect(button).toHaveClass('my-custom-class');
    });

    it('merges custom className with variant classes', () => {
      renderButton({ className: 'extra', variant: 'success' });
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-success');
      expect(button.className).toContain('extra');
    });
  });

  describe('Animation Variants', () => {
    it('renders without error when animationVariant is provided', () => {
      renderButton({ animationVariant: 'bounce' });
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders without error when an unknown animationVariant is provided', () => {
      renderButton({ animationVariant: 'nonExistentAnimation' });
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders without error when no animationVariant is provided', () => {
      renderButton();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const knownAnimations = [
      'bounce', 'bounceSlow', 'bounceFast', 'bounceSmooth', 'bounceJelly',
      'scaleUp', 'scaleDown', 'scalePulse',
      'shake', 'wobble', 'pulse',
      'fadeBlink', 'fadeInOut',
      'swipeRight', 'swipeLeft',
      'press3D', 'press3DSoft', 'press3DHard',
      'spinSlow', 'spinFast',
      'shadowGlow', 'neonGlow',
      'reveal',
    ];

    it.each(knownAnimations)(
      'animationVariant="%s" renders without error',
      (variant) => {
        renderButton({ animationVariant: variant });
        expect(screen.getByRole('button')).toBeInTheDocument();
      },
    );
  });

  describe('Nina Animation Variant', () => {
    it('renders nina variant for string children', () => {
      renderButton({ animationVariant: 'nina', children: 'Hello' });
      const chars = screen.getAllByText(/^[A-Za-z]$/);
      expect(chars.length).toBe(5);
    });

    it('renders nina variant with non-string children gracefully', () => {
      render(
        <Button animationVariant="nina">
          <span>Icon</span>
        </Button>,
      );
      expect(screen.getByText('Icon')).toBeInTheDocument();
    });

    it('renders the full text in the overlay span for nina variant', () => {
      renderButton({ animationVariant: 'nina', children: 'Test' });
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('applies overflow-hidden class for nina variant', () => {
      const { container } = renderButton({ animationVariant: 'nina', children: 'Hi' });
      const button = container.querySelector('button');
      expect(button?.className).toContain('overflow-hidden');
    });

    it('applies relative class for nina variant', () => {
      const { container } = renderButton({ animationVariant: 'nina', children: 'Hi' });
      const button = container.querySelector('button');
      expect(button?.className).toContain('relative');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to the button element', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref Test</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toBe('Ref Test');
    });

    it('forwards ref when using nina variant', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref} animationVariant="nina">Nina Ref</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('Event Handling', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      renderButton({ onClick: handleClick });

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      renderButton({ onClick: handleClick, disabled: true });

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles multiple rapid clicks', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      renderButton({ onClick: handleClick });

      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button);
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Disabled State', () => {
    it('renders disabled button', () => {
      renderButton({ disabled: true });
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('applies disabled styling classes', () => {
      renderButton({ disabled: true });
      const button = screen.getByRole('button');
      expect(button.className).toContain('disabled:opacity-50');
    });
  });

  describe('HTML Attributes Passthrough', () => {
    it('passes through type attribute', () => {
      renderButton({ type: 'submit' });
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('passes through aria-label', () => {
      renderButton({ 'aria-label': 'Close dialog' });
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });

    it('passes through data attributes', () => {
      renderButton({ 'data-testid': 'my-button' } as any);
      expect(screen.getByTestId('my-button')).toBeInTheDocument();
    });

    it('passes through id attribute', () => {
      renderButton({ id: 'submit-btn' });
      expect(screen.getByRole('button')).toHaveAttribute('id', 'submit-btn');
    });
  });

  describe('buttonVariants Export', () => {
    it('is exported and callable', () => {
      expect(typeof buttonVariants).toBe('function');
    });

    it('returns a class string for default variant/size', () => {
      const classes = buttonVariants({ variant: 'default', size: 'md' });
      expect(typeof classes).toBe('string');
      expect(classes).toContain('bg-primary');
      expect(classes).toContain('h-10');
    });

    it('returns correct classes for different combinations', () => {
      const classes = buttonVariants({ variant: 'outline', size: 'lg' });
      expect(classes).toContain('border');
      expect(classes).toContain('h-12');
    });
  });
});
