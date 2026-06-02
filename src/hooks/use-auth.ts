import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthState = {
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  roleLoading: boolean;
};

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setIsAdmin(false);
      setIsTeacher(false);
      setRoleLoading(false);
      return;
    }
    setRoleLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .then(({ data }) => {
        const roles = (data ?? []).map((r) => r.role);
        setIsAdmin(roles.includes("admin"));
        setIsTeacher(roles.includes("teacher"));
        setRoleLoading(false);
      });
  }, [session?.user?.id]);

  return { session, loading, isAdmin, isTeacher, roleLoading };
}
