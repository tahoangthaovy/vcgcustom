import { useState } from "react";
import AdminGate from "@/components/AdminGate";
import MatchForm from "@/components/MatchForm";
import MatchManagement from "@/components/MatchManagement";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, RotateCcw, Loader2, Plus, Settings, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Admin = () => {
  const { displayName } = useAuth();
  const [resetting, setResetting] = useState(false);

  const modName = displayName || "Moderator";

  const handleResetScores = async () => {
    if (!confirm("Bạn có chắc muốn reset toàn bộ điểm về 0?")) return;
    setResetting(true);
    try {
      const { error } = await supabase
        .from("players")
        .update({ total_score: 0, total_wins: 0 })
        .gte("total_score", 0);

      if (error) throw error;
      toast.success("Đã reset điểm thành công!");
    } catch (e: any) {
      toast.error("Lỗi: " + e.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <AdminGate>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Shield className="h-7 w-7 text-primary" />
            <h1 className="font-gaming text-3xl font-bold text-glow text-primary">
              MOD PANEL
            </h1>
          </div>
          <p className="text-muted-foreground">Quản lý trận đấu VCG</p>
          <div className="flex items-center justify-center gap-1 mt-2 text-sm text-primary">
            <User className="h-4 w-4" />
            <span className="font-medium">{modName}</span>
          </div>
        </div>

        <div className="card-gaming p-6 space-y-6">
          <Tabs defaultValue="add" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary">
              <TabsTrigger value="add" className="font-gaming text-xs">
                <Plus className="h-3 w-3 mr-1" />
                THÊM TRẬN
              </TabsTrigger>
              <TabsTrigger value="manage" className="font-gaming text-xs">
                <Settings className="h-3 w-3 mr-1" />
                QUẢN LÝ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="mt-4">
              <MatchForm moderatorName={modName} />
            </TabsContent>

            <TabsContent value="manage" className="mt-4">
              <MatchManagement />
            </TabsContent>
          </Tabs>

          <div className="border-t border-border pt-4">
            <Button
              variant="outline"
              onClick={handleResetScores}
              disabled={resetting}
              className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              {resetting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RotateCcw className="h-4 w-4 mr-2" />}
              RESET ĐIỂM THÁNG
            </Button>
          </div>
        </div>
      </div>
    </AdminGate>
  );
};

export default Admin;
