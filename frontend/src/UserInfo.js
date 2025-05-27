import React from "react";
import { useAuth } from "./AuthContext";

export default function UserInfo() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <div>
      <p>Welcome, {user.name} ({user.email})</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}