import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const NavBar = () => {
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  const navItems = [
    { href: '/dashboard', label: 'Hub', icon: '⬢' },
    { href: '/contacts', label: 'Nodes', icon: '◉' },
    { href: '/introductions', label: 'Connect', icon: '🤖' },
    { href: '/hive', label: 'Hive', icon: '🔮' },
    { href: '/masterminds', label: 'Collective', icon: '🧠' },
    { href: '/calendar', label: 'Temporal', icon: '📅' },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Hivemind Top Header */}
      <div className="nav-hive safe-area-top">
        <div className="container-mobile">
          <div className="flex justify-between items-center h-14">
            {/* Hivemind Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 gradient-hive rounded-hive flex items-center justify-center shadow-glow group-hover:shadow-glow-strong transition-all duration-300">
                <svg width="16" height="16" viewBox="0 0 32 32" fill="none" className="text-white">
                  <circle cx="10" cy="10" r="3" fill="currentColor"/>
                  <circle cx="22" cy="10" r="3" fill="currentColor"/>
                  <circle cx="16" cy="22" r="3" fill="currentColor"/>
                  <line x1="10" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="10" y1="10" x2="16" y2="22" stroke="currentColor" strokeWidth="2"/>
                  <line x1="22" y1="10" x2="16" y2="22" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-text">Network</span>
                <span className="text-xs text-subtle -mt-1">Relationship OS</span>
              </div>
            </Link>

            {/* Connection Status */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent2 rounded-full pulse-hive"></div>
                <span className="text-xs text-subtle">Connected</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-subtle text-sm font-medium touch-target hover:text-text transition-colors duration-300"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hivemind Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-hive border-t border-border safe-area-bottom z-50">
        <div className="grid grid-cols-6 gap-1 px-2 py-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-node ${
                pathname === item.href
                  ? 'nav-active'
                  : 'nav-inactive'
              }`}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="text-xs leading-tight text-center">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default NavBar;
