"use client";

import { CreditCard, Sparkles, Calendar, AlertCircle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import PricingDialog from "@/components/pricingdialog/pricingdialog";
import { redirectNewTab } from "@/lib/utils";
import { toast } from "@/components/toast";
import { PortalSessionRequest } from "@/app/api/stripe/portal/route";
import { useWorkspace } from "@/hooks/use-workspace";

interface SubscriptionBillingSectionProps {
  workspaceid: string;
  isWorkspaceContext?: boolean; // true = workspace settings, false = user settings
}

export function SubscriptionBillingSection({
  workspaceid,
  isWorkspaceContext = false,
}: SubscriptionBillingSectionProps) {
  const { ttt } = useLanguage();
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const { workspace, isLoading, refetch } = useWorkspace();

  const currentPlan = workspace?.stripeSubscription?.plan || "free";
  const isFreePlan = currentPlan === "free";
  const hasBillingPage = workspace?.stripeSubscription?.plan;

  const handleBillingHistory = async () => {
    try {
      setIsLoadingPortal(true);

      // Determine the return path based on context
      const returnPath = isWorkspaceContext
        ? `/d/${workspaceid}`
        : `/d/${workspaceid}`;

      try {
        const body : PortalSessionRequest = {
          path: returnPath,
          workspaceid: workspaceid,
        };
        const response = await fetch("/api/stripe/portal", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Failed to create portal session: ${response.status} - ${
              errorData.error || response.statusText
            }`
          );
        }

        const result = await response.json();
        await redirectNewTab(result.url, async () => {
          await refetch();
        });
      } catch (error) {
        console.error("Error creating portal session:", error);
        toast({
          type: "error",
          description: ttt("An unexpected error occurred. Please try again."),
        });
        throw error;
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error);
      if (
        error instanceof Error &&
        error.message.includes("No subscription found")
      ) {
        // You could show a toast: "No billing history available - you haven't had any paid subscriptions yet"
        console.log("No billing history available");
      }
    } finally {
      setIsLoadingPortal(false);
    }
  };

  return (
    <>
      <div className="space-y-6 mt-4">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle className="text-base">{ttt("Current Plan")}</CardTitle>
            </div>
            <CardDescription>
              {isWorkspaceContext
                ? ttt("Your workspace's current subscription plan")
                : ttt("Your current subscription plan")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{ttt("Plan")}</span>
                  <span className="text-sm capitalize">{currentPlan}</span>
                </div>

                {/* Only show next billing date for paid plans */}
                {!isFreePlan && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {ttt("Next Billing Date")}
                    </span>
                    <span className="text-sm">
                      {new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </>
            )}

            <Separator />

            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button
                onClick={() => setShowPricingDialog(true)}
                className="flex-1 cursor-pointer"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isFreePlan
                  ? ttt("Upgrade Subscription")
                  : ttt("Manage Subscription")}
              </Button>
              {hasBillingPage && (
                <Button
                  variant="outline"
                  className="flex-1 cursor-pointer"
                  onClick={handleBillingHistory}
                  disabled={isLoadingPortal}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {isLoadingPortal ? ttt("Loading...") : ttt("Billing History")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage & Limits Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              {ttt("Usage & Limits")}
            </CardTitle>
            <CardDescription>
              {ttt("Track your current usage against plan limits")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* TODO: Replace with actual usage data */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{ttt("API Calls")}</span>
                <span>450 / 1,000</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: "45%" }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{ttt("Storage")}</span>
                <span>2.1 GB / 10 GB</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: "21%" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PricingDialog
        open={showPricingDialog}
        onOpenChange={setShowPricingDialog}
        workspaceid={workspaceid}
        limitReached={false}
      />
    </>
  );
}
