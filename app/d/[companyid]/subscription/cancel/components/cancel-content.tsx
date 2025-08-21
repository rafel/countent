"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { showPricingDialog } from "@/hooks/use-subscription-dialog";
import { UserCompany } from "@/utils/company";

interface CancelContentProps {
  company: UserCompany;
  userId: string;
}

export default function CancelContent({ company, userId }: CancelContentProps) {
  const { ttt } = useLanguage();
  const router = useRouter();

  const handleTryAgain = () => {
    showPricingDialog(userId, company.companyid);
  };

  const handleContinue = () => {
    router.push(`/d/${company.companyid}`);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <XCircle className="h-6 w-6 text-orange-600" />
        </div>
        <CardTitle>{ttt("Subscription Canceled")}</CardTitle>
        <CardDescription>
          {ttt("Your subscription setup was canceled. No charges were made.")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleTryAgain} className="w-full">
          {ttt("Try Again")}
        </Button>
        <Button onClick={handleContinue} variant="outline" className="w-full">
          {ttt("Continue to Dashboard")}
        </Button>
      </CardContent>
    </Card>
  );
}
