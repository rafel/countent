import { Box, Flex, Heading, Link as RadixLink } from "@radix-ui/themes";
import Link from "next/link";
import { HomeIcon, PersonIcon, RocketIcon } from "@radix-ui/react-icons";
import { UserAvatar } from "@/app/components/useravatar";
import Image from "next/image";
import { getUser } from "@/utils/user";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = [
    { href: "/dashboard", label: "Home", icon: <HomeIcon /> },
    { href: "/dashboard/page1", label: "Page 1", icon: <PersonIcon /> },
    {
      href: "/dashboard/page2",
      label: "Page 2",
      icon: <RocketIcon />,
    },
  ];

  const user = await getUser();

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
          <Link href="/dashboard">
            <Heading
              as="h3"
              size="3"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Image src="/logo.svg" alt="Countent" width={25} height={25} />{" "}
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
          <Flex justify="end" align="center" gap="4">
            {user && <UserAvatar user={user} size="2" />}
          </Flex>
        </Box>
        <main style={{ flexGrow: 1, padding: "2rem" }}>{children}</main>
      </Flex>
    </Flex>
  );
}
