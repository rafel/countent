"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { handleCheckoutSuccess } from "../functions/actions";
import { UserCompany } from "@/utils/company";

interface SuccessContentProps {
  company: UserCompany;
  userId: string;
  sessionId: string;
}

export default function SuccessContent({
  company,
  userId,
  sessionId,
}: SuccessContentProps) {
  const { ttt } = useLanguage();
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const processSubscription = async () => {
      try {
        const result = await handleCheckoutSuccess(
          sessionId,
          userId,
          company.companyid
        );

        if (result.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(result.error || "Unknown error occurred");
        }
      } catch (error) {
        console.error("Error processing subscription:", error);
        setStatus("error");
        setErrorMessage("Failed to process subscription");
      }
    };

    processSubscription();
  }, [sessionId, userId, company.companyid]);

  const handleContinue = () => {
    router.push(`/d/${company.companyid}`);
  };

  if (status === "processing") {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
          <CardTitle>{ttt("Processing Your Subscription")}</CardTitle>
          <CardDescription>
            {ttt("Please wait while we set up your subscription...")}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>{ttt("Subscription Error")}</CardTitle>
          <CardDescription>
            {ttt("There was an issue setting up your subscription")}:{" "}
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={handleContinue} variant="outline">
            {ttt("Continue to Dashboard")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle>{ttt("Subscription Activated!")}</CardTitle>
        <CardDescription>
          {ttt("Your subscription has been successfully activated for")}{" "}
          {company.name || ttt("your company")}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button onClick={handleContinue} className="w-full">
          {ttt("Continue to Dashboard")}
        </Button>
      </CardContent>
    </Card>
  );
}
