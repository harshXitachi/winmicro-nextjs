import Link from 'next/link';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'light' | 'dark';
  size?: 'small' | 'medium' | 'large';
  href?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  variant = 'primary',
  size = 'medium',
  href,
  onClick,
  className = '',
  disabled = false,
  children,
  type = 'button',
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    light: 'bg-white text-gray-900 hover:bg-gray-50 focus:ring-white',
    dark: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900',
  };

  const sizes = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  const buttonClass = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  }`;

  if (href) {
    return (
      <Link href={href} className={buttonClass}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClass}
    >
      {children}
    </button>
  );
}
