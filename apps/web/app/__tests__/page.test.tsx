import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import Home from '../page';

// Mock the styles import
jest.mock('../page.module.css', () => ({
  page: 'page',
  main: 'main',
  logo: 'logo',
  ctas: 'ctas',
  primary: 'primary',
  secondary: 'secondary',
  footer: 'footer',
}));

// Mock the Button component
// Mock the Button component
jest.mock('@repo/ui/button', () => ({
  Button: ({
    children,
    className,
    appName,
    onClick,
    type = 'button',
    ...props
  }: {
    children: ReactNode;
    className?: string;
    appName: string;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    [key: string]: string | ReactNode | undefined | (() => void);
  }) => (
    <button
      className={className}
      type={type}
      onClick={onClick || (() => alert(`Hello from your ${appName} app!`))}
      {...props}
    >
      {children}
    </button>
  ),
}));
describe('Home', () => {
  it('renders the Turborepo logos for both themes', () => {
    render(<Home />);
    const logos = screen.getAllByAltText('Turborepo logo');
    expect(logos).toHaveLength(2);
    expect(logos[0]).toHaveAttribute('src', 'turborepo-dark.svg');
    expect(logos[1]).toHaveAttribute('src', 'turborepo-light.svg');
  });

  it('renders the call-to-action buttons', () => {
    render(<Home />);
    expect(screen.getByText(/Deploy now/i)).toBeInTheDocument();
    expect(screen.getByText(/Read our docs/i)).toBeInTheDocument();
    expect(screen.getByText(/Open alert/i)).toBeInTheDocument();
  });

  it('renders the deploy and docs links', () => {
    render(<Home />);
    const deployLink = screen.getByRole('link', { name: /deploy now/i });
    const docsLink = screen.getByRole('link', { name: /read our docs/i });

    expect(deployLink).toBeInTheDocument();
    expect(deployLink).toHaveAttribute(
      'href',
      expect.stringContaining('vercel.com'),
    );
    expect(docsLink).toBeInTheDocument();
    expect(docsLink).toHaveAttribute(
      'href',
      expect.stringContaining('turbo.build'),
    );
  });

  it('renders the footer links', () => {
    render(<Home />);
    const examplesLink = screen.getByRole('link', { name: /examples/i });
    const turboLink = screen.getByRole('link', { name: /go to turbo\.build/i });

    expect(examplesLink).toBeInTheDocument();
    expect(turboLink).toBeInTheDocument();
  });

  it('renders the Button component', () => {
    render(<Home />);
    const button = screen.getByRole('button', { name: /open alert/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('secondary');
  });
});
