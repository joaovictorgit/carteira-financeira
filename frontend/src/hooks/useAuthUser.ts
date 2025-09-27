import { UserResponse, UserService } from "@/services/user/userService";
import { useCallback, useEffect, useState } from "react";

export const useAuthUser = () => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const fetchUser = useCallback(async () => {
    try {
      const response = await UserService.getUserInfo();
      setUser(response);
    } catch (error) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, fetchUser };
};