import Link from 'next/link';
import React, { memo } from 'react';
import { Streamdown, type StreamdownProps } from 'streamdown';

type Components = StreamdownProps['components'];

const components: Partial<Components> = {
  a: ({ children, ...props }) => {
    return (
      // @ts-expect-error - Next.js Link component props don't match anchor props exactly
      <Link
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    );
  },
};

const NonMemoizedMarkdown = ({ children }: { children: string }) => (
  <Streamdown components={components}>{children}</Streamdown>
);

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
