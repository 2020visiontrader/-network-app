import { render, screen, fireEvent } from '@testing-library/react';
import ContactsPage from '../page';
import { createBrowserClient } from '@supabase/ssr';

// Mock Supabase client
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(),
}));

// Mock withAuth HOC
jest.mock('@/components/withAuth', () => ({
  withAuth: (Component: React.ComponentType<any>) => Component,
}));

describe('ContactsPage', () => {
    const mockSupabase = {
    auth: {
      getSession: jest.fn(),
    },
    from: jest.fn(),
  };

  beforeEach(() => {
    (createBrowserClient as jest.Mock).mockReturnValue(mockSupabase);
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: '123' } } } });
  });

  it('renders the contacts page title', () => {
    render(<ContactsPage />);
    // expect(screen.getByText('My Contacts')).toBeInTheDocument();
    expect(screen.getByText('My Contacts')).toBeTruthy();
  });

  it('shows add contact form when button is clicked', () => {
    render(<ContactsPage />);
    const addButton = screen.getByText('Add Contact');
    fireEvent.click(addButton);
    // expect(screen.getByText('Add New Contact')).toBeInTheDocument();
    expect(screen.getByText('Add New Contact')).toBeTruthy();
  });

  // Add more tests for CRUD operations
});
