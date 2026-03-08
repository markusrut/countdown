import Link from 'next/link';
import { AuthButton } from './AuthButton';

export const Header = () => {
  return (
    <header style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <h1 className="text-gradient" style={{ margin: 0, fontSize: '1.5rem' }}>Countdown Magic</h1>
      </Link>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <AuthButton />
      </div>
    </header>
  );
};
