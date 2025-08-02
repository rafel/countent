"use client";

import { useState, useEffect } from "react";
import { Avatar, DropdownMenu, Flex, Text, Button } from "@radix-ui/themes";
import { MoonIcon, SunIcon, ExitIcon } from "@radix-ui/react-icons";
import { User } from "@/db/schema";
import { useTheme } from "./themeprovider";
import { signOut } from "next-auth/react";

interface UserAvatarProps {
  user: User;
  size?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
}

export function UserAvatar({ user, size = "2" }: UserAvatarProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const fallbackText = user.name
    ? user.name.charAt(0).toUpperCase()
    : user.email?.charAt(0).toUpperCase() || "U";

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Avatar
          size={size}
          src={user.image || undefined}
          fallback={fallbackText}
          radius="full"
          style={{ cursor: "pointer" }}
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        style={
          {
            "--dropdown-menu-item-hover": "var(--gray-a3)",
          } as React.CSSProperties
        }
      >
        <div
          style={{
            padding: "8px 12px",
            borderBottom: "1px solid var(--gray-a4)",
          }}
        >
          <Flex align="center" gap="2">
            <Flex direction="column">
              <Text size="2" weight="medium">
                {user.name || "User"}
              </Text>
              <Text size="1" color="gray">
                {user.email}
              </Text>
            </Flex>
          </Flex>
        </div>
        <DropdownMenu.Item asChild>
          <Button
            variant="ghost"
            size="2"
            onClick={toggleTheme}
            style={{
              width: "100%",
              justifyContent: "flex-start",
              margin: "4px 0",
              padding: "8px 12px",
            }}
          >
            <Flex align="center" gap="2">
              {mounted && (theme === "dark" ? <SunIcon /> : <MoonIcon />)}
              <Text>Toggle theme</Text>
            </Flex>
          </Button>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Button
            variant="ghost"
            size="2"
            onClick={() => signOut()}
            style={{
              width: "100%",
              justifyContent: "flex-start",
              margin: "4px 0",
              padding: "8px 12px",
            }}
          >
            <Flex align="center" gap="2">
              <ExitIcon />
              <Text>Logout</Text>
            </Flex>
          </Button>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
