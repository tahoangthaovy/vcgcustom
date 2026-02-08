import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Loader2, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AdminGateProps {
  children: React.ReactNode;
}

const AdminGate = ({ children }: AdminGateProps) => {
  const { user, isModerator, isLoading, signIn, signOut, displayName } = useAuth();
  const [password, setPassword] = useState("");
  const [modName, setModName] = useState("");
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleLogin = async () => {
    if (!modName.trim()) {
      setError("Vui lòng nhập tên moderator");
      return;
    }
    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

    setIsSigningIn(true);
    setError("");

    const result = await signIn(password, modName.trim());
    
    if (result.error) {
      setError(result.error);
    }
    
    setIsSigningIn(false);
  };

  const handleLogout = async () => {
    await signOut();
    setPassword("");
    setModName("");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="card-gaming p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm mt-4">Đang tải...</p>
        </div>
      </div>
    );
  }

  // User is authenticated and is a moderator
  if (user && isModerator) {
    return (
      <div className="relative">
        {/* Logout button */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Đăng xuất
          </Button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="card-gaming p-8 w-full max-w-sm space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full gradient-gaming p-4">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <div>
          <h2 className="font-gaming text-xl font-bold text-foreground">MOD ACCESS</h2>
          <p className="text-muted-foreground text-sm mt-1">Nhập thông tin để truy cập</p>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-left block text-sm">Tên Moderator</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={modName}
                onChange={(e) => { setModName(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Nhập tên mod..."
                className="pl-9 bg-secondary border-border"
                disabled={isSigningIn}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-left block text-sm">Mật khẩu</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                className="pl-9 bg-secondary border-border"
                disabled={isSigningIn}
              />
            </div>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button 
            onClick={handleLogin} 
            disabled={isSigningIn}
            className="w-full gradient-gaming text-primary-foreground font-gaming"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ĐANG XÁC THỰC...
              </>
            ) : (
              "ĐĂNG NHẬP"
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          🔒 Xác thực bảo mật qua server
        </p>
      </div>
    </div>
  );
};

export default AdminGate;
