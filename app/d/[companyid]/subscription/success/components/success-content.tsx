"use client";

import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { UserCompany } from "@/lib/db/tables/company";

interface SuccessContentProps {
  company: UserCompany;
}

export default function SuccessContent({ company }: SuccessContentProps) {
  const { ttt } = useLanguage();
  const router = useRouter();

  const handleContinue = () => {
    router.push(`/d/${company.companyid}`);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle>{ttt("Subscription Activated!")}</CardTitle>
        <CardDescription>
          {ttt("Your subscription has been successfully activated")}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button onClick={handleContinue} className="w-full">
          {ttt("Continue")}
        </Button>
      </CardContent>
    </Card>
  );
}
