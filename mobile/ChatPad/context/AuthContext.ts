import React, { Dispatch } from "react";

export const AuthContext = React.createContext<{
  user: unknown;
  setUser: React.Dispatch<unknown>;
}>({ user: {}, setUser: () => {} });
