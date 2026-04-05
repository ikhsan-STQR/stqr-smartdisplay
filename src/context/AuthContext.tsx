import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  userRole: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }
      return data?.role || null;
    } catch (err) {
      console.error("Fatal error fetching role:", err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Global Safety Timeout
    const globalTimeout = setTimeout(() => {
      if (mounted) {
        console.warn("AuthContext: Global initialization timeout reached.");
        setIsLoading(false);
      }
    }, 5000);

    const handleSession = async (session: Session | null) => {
      if (!mounted) return;
      
      let nextRole: string | null = null;
      let nextIsAdmin = false;

      try {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          nextRole = await fetchUserRole(session.user.id);
          // If role fetch fails but user exists, default to 'user' role
          if (!nextRole) nextRole = "user";
          nextIsAdmin = nextRole === "admin";
        }
      } catch (err) {
        console.error("Auth state handling failed:", err);
        nextRole = "user"; // Safe default
      } finally {
        if (mounted) {
          setUserRole(nextRole);
          setIsAdmin(nextIsAdmin);
          setIsLoading(false);
          clearTimeout(globalTimeout);
        }
      }
    };

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      handleSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(globalTimeout);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    setUserRole(null);
    setIsAdmin(false);
    return await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, isLoading, userRole, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
