import { Box, Flex, Heading, Link as RadixLink } from "@radix-ui/themes";
import Link from "next/link";
import { HomeIcon, PersonIcon, RocketIcon } from "@radix-ui/react-icons";
import { ThemeToggle } from "@/app/components/themetoggle";
import { LogoutButton } from "@/app/components/logoutbutton";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = [
    { href: "/home", label: "Home", icon: <HomeIcon /> },
    { href: "/home/page1", label: "Page 1", icon: <PersonIcon /> },
    {
      href: "/home/page2",
      label: "Page 2",
      icon: <RocketIcon />,
    },
  ];

  return (
    <Flex>
      <Box
        width="250px"
        p="4"
        style={{
          height: "auto",
          minHeight: "100vh",
          borderRight: "1px solid var(--gray-a5)",
          backgroundColor: "var(--gray-a2)",
        }}
      >
        <Box mb="5">
          <Link href="/home">
            <Heading as="h3" size="6">
              Countent
            </Heading>
          </Link>
        </Box>
        <nav>
          <Flex direction="column" gap="3">
            {menuItems
              .filter((item) => item !== null)
              .map((item) => (
                <RadixLink asChild key={item.href}>
                  <Link href={item.href}>
                    <Flex align="center" gap="2">
                      {item.icon}
                      {item.label}
                    </Flex>
                  </Link>
                </RadixLink>
              ))}
          </Flex>
        </nav>
      </Box>
      <Flex direction="column" style={{ flexGrow: 1 }}>
        <Box
          p="4"
          style={{
            borderBottom: "1px solid var(--gray-a5)",
            backgroundColor: "var(--gray-a2)",
          }}
        >
          <Flex justify="end" gap="4">
            <ThemeToggle />
            <LogoutButton />
          </Flex>
        </Box>
        <main style={{ flexGrow: 1, padding: "2rem" }}>{children}</main>
      </Flex>
    </Flex>
  );
}
