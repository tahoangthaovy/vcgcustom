import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isModerator: boolean;
  displayName: string | null;
  signIn: (password: string, displayName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModerator, setIsModerator] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkModeratorStatus(session.user.id);
        setDisplayName(session.user.user_metadata?.display_name ?? null);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await checkModeratorStatus(session.user.id);
          setDisplayName(session.user.user_metadata?.display_name ?? null);
        } else {
          setIsModerator(false);
          setDisplayName(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkModeratorStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("moderators")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data) {
        setIsModerator(true);
      } else {
        setIsModerator(false);
      }
    } catch {
      setIsModerator(false);
    }
  };

  const signIn = async (password: string, modDisplayName: string): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-admin", {
        body: { password, displayName: modDisplayName },
      });

      if (error) {
        console.error("Function error:", error);
        return { error: "Không thể kết nối đến server" };
      }

      if (data.error) {
        return { error: data.error };
      }

      if (data.session) {
        // Set the session returned from the Edge Function
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        setDisplayName(modDisplayName);
        return {};
      }

      return { error: "Có lỗi xảy ra" };
    } catch (err) {
      console.error("Sign in error:", err);
      return { error: "Có lỗi xảy ra" };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsModerator(false);
    setDisplayName(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isModerator,
        displayName,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
