import { render, screen, fireEvent } from '@testing-library/react';
import ContactsPage from '../page';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(),
}));

// Mock withAuth HOC
jest.mock('@/components/withAuth', () => ({
  withAuth: (Component) => Component,
}));

describe('ContactsPage', () => {
  const mockSupabase = {
    auth: {
      getSession: jest.fn(),
    },
    from: jest.fn(),
  };

  beforeEach(() => {
    (createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase);
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: '123' } } } });
  });

  it('renders the contacts page title', () => {
    render(<ContactsPage />);
    expect(screen.getByText('My Contacts')).toBeInTheDocument();
  });

  it('shows add contact form when button is clicked', () => {
    render(<ContactsPage />);
    const addButton = screen.getByText('Add Contact');
    fireEvent.click(addButton);
    expect(screen.getByText('Add New Contact')).toBeInTheDocument();
  });

  // Add more tests for CRUD operations
});
