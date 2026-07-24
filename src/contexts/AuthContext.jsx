import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        setUserProfile(data);
      }
    } catch (e) {
      console.error("Error fetching profile in AuthContext", e);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Safety timeout: Ensure loading state is never stuck true for more than 3 seconds
    const safetyTimer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 3000);

    // Check active sessions and sets the user
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return;
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id).finally(() => {
            if (isMounted) setLoading(false);
          });
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error getting session:", err);
        if (isMounted) setLoading(false);
      });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => {
          if (isMounted) setLoading(false);
        });
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = (email, password, metadata) => {
    return supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: metadata
      }
    });
  };

  const signIn = (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = () => {
    return supabase.auth.signOut();
  };

  const resetPassword = (email) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
  };

  const updatePassword = (newPassword) => {
    return supabase.auth.updateUser({ password: newPassword });
  };

  const updateProfileContext = (profileData) => {
    setUserProfile(profileData);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, updateProfileContext, signUp, signIn, signOut, resetPassword, updatePassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
