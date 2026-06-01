'use client';

export default function LogoutButton() {
  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-neutral-500 hover:text-black transition-colors"
    >
      Log ud
    </button>
  );
}
