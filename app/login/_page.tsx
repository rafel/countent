import { signIn } from "@/utils/user";
import { Box, Button, Flex, Heading } from "@radix-ui/themes";
import { AvatarIcon } from "@radix-ui/react-icons";

export default function LoginPage() {
  return (
    <Flex align="center" justify="center" style={{ height: "100vh" }}>
      <Box
        p="6"
        style={{
          background: "var(--gray-a2)",
          borderRadius: "var(--radius-4)",
          border: "1px solid var(--gray-a5)",
        }}
      >
        <Heading align="center" mb="5">
          Countent
        </Heading>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <Button type="submit" size="3" style={{ width: "100%" }}>
            <AvatarIcon />
            Sign in with Google
          </Button>
        </form>
      </Box>
    </Flex>
  );
}
