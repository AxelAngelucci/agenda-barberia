'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client-browser';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
    >
      Cerrar Sesión
    </Button>
  );
}