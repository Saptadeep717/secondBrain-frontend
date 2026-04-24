import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function SettingsPage() {
  const { username, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/api/v1/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      toast.success('Password changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await apiFetch('/api/v1/logout-all', { method: 'POST' });
      clearAuth();
      toast.success('Logged out from all devices');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Failed');
    }
  };

  return (
    <div className="p-6 pb-20 lg:pb-6 max-w-2xl">
      {/* Account */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Account</h2>
        <div className="bg-card border border-border rounded-lg p-4 mb-4">
          <Label className="text-muted-foreground text-xs">Username</Label>
          <p className="text-sm font-medium">{username || 'Unknown'}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium mb-3">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <Input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" placeholder="Current password" className="bg-secondary border-border" required />
            <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="New password" className="bg-secondary border-border" required />
            <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm new password" className="bg-secondary border-border" required />
            <Button type="submit" size="sm" disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</Button>
          </form>
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Danger Zone</h2>
        <div className="bg-card border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Logout from all devices</h3>
              <p className="text-xs text-muted-foreground">This will invalidate all active sessions</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">Logout All</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Logout from all devices?</AlertDialogTitle>
                  <AlertDialogDescription>All active sessions will be terminated. You'll need to sign in again.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogoutAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Logout All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </section>
    </div>
  );
}
