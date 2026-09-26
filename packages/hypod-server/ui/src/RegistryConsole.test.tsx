// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { RegistryConsoleView } from './RegistryConsole';

vi.mock('./SpatialLink', () => ({
  default: ({ children }: PropsWithChildren) => <>{children}</>,
}));

describe('RegistryConsoleView', () => {
  it('explains the anonymous empty state without exposing destructive controls', () => {
    render(
      <RegistryConsoleView
        usage="public"
        authenticated={false}
        loading={false}
        busy={false}
        error={null}
        imagenes={[]}
        namespaces={[]}
        projects={[]}
        onRetry={vi.fn()}
        onLogin={vi.fn()}
        onLogout={vi.fn()}
        onToggleVisibility={vi.fn()}
        onDeleteImagene={vi.fn()}
        onCreateNamespace={vi.fn()}
        onDeleteNamespace={vi.fn()}
        onCreateProject={vi.fn()}
        onDeleteProject={vi.fn()}
        onSetProjectNamespace={vi.fn()}
        onSetImageneProject={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Registry operations' })).toBeInTheDocument();
    expect(screen.getByText('No public imagenes are available yet.')).toBeInTheDocument();
    expect(screen.getByText('Read-only public access')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Delete/ })).not.toBeInTheDocument();
  });
});
