"use client";
import NumberFlow from "@number-flow/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/use-language";
import { redirectNewTab } from "@/lib/utils";
import {
  STRIPE_PRICE_LOOKUP_KEYS,
  type StripePriceLookupKey,
} from "@/content/common";
import { toast } from "@/components/toast";
import { useSubscriptionAccess } from "@/hooks/use-subscription-access";

const Pricing = ({
  showFreePlan = false,
  companyId,
}: {
  showFreePlan?: boolean;
  companyId: string;
}) => {
  const { ttt } = useLanguage();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { refetch } = useSubscriptionAccess();
  const handleSubscribe = async (
    lookupKey: StripePriceLookupKey,
    planId: string
  ) => {
    if (planId === "hobby") return; // Free plan doesn't need checkout

    try {
      setIsLoading(planId);

      try {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            lookup_key: lookupKey,
            success_path: `/d/${companyId}/subscription/success`,
            cancel_path: `/d/${companyId}/subscription/cancel`,
            return_path: `/d/${companyId}`,
            company_id: companyId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create checkout session");
        }

        const result = await response.json();
        redirectNewTab(result.url, async () => {
          await refetch();
        });
      } catch (error) {
        console.error("Error creating checkout session:", error);
        throw error;
      }
    } catch (error) {
      console.error("Failed to redirect to checkout:", error);
      toast({
        type: "error",
        description: ttt("An unexpected error occurred. Please try again."),
      });
    } finally {
      setIsLoading(null);
    }
  };

  const plans = [
    {
      id: "hobby",
      name: ttt("Hobby"),
      type: "free",
      price: { monthly: ttt("Free forever"), yearly: ttt("Free forever") },
      description: ttt(
        "The perfect starting place for your web app or personal project."
      ),
      features: [
        ttt("50 API calls / month"),
        ttt("60 second checks"),
        ttt("Single-user account"),
        ttt("5 monitors"),
        ttt("Basic email support"),
      ],
      cta: ttt("Get started for free"),
    },
    {
      id: "pro",
      name: ttt("Pro"),
      type: "paid",
      price: { monthly: 90, yearly: 75 },
      lookupKeys: {
        monthly: STRIPE_PRICE_LOOKUP_KEYS.PRO_MONTHLY,
        yearly: STRIPE_PRICE_LOOKUP_KEYS.PRO_YEARLY,
      },
      description: ttt("Everything you need to build and scale your business."),
      features: [
        ttt("Unlimited API calls"),
        ttt("30 second checks"),
        ttt("Multi-user account"),
        ttt("10 monitors"),
        ttt("Priority email support"),
      ],
      cta: ttt("Subscribe to Pro"),
      popular: true,
    },
    {
      id: "enterprise",
      name: ttt("Enterprise"),
      type: "enterprise",
      price: {
        monthly: ttt("Get in touch for pricing"),
        yearly: ttt("Get in touch for pricing"),
      },
      lookupKeys: {
        monthly: STRIPE_PRICE_LOOKUP_KEYS.ENTERPRISE_MONTHLY,
        yearly: STRIPE_PRICE_LOOKUP_KEYS.ENTERPRISE_YEARLY,
      },
      description: ttt(
        "Critical security, performance, observability and support."
      ),
      features: [
        ttt("You can DDOS our API."),
        ttt("Nano-second checks."),
        ttt("Invite your extended family."),
        ttt("Unlimited monitors."),
        ttt("We'll sit on your desk."),
      ],
      cta: ttt("Contact us"),
    },
  ];
  const [frequency, setFrequency] = useState<string>("monthly");
  return (
    <>
      <Tabs defaultValue={frequency} onValueChange={setFrequency}>
        <TabsList>
          <TabsTrigger value="monthly">{ttt("Monthly")}</TabsTrigger>
          <TabsTrigger value="yearly">
            {ttt("Yearly")} <Badge variant="secondary">{ttt("20% off")}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="mt-4 grid w-full gap-4 lg:grid-cols-2">
        {(showFreePlan ? plans : plans.slice(1)).map((plan) => (
          <Card
            className={cn(
              "relative w-full text-left",
              plan.popular && "ring-2 ring-primary"
            )}
            key={plan.id}
          >
            {plan.popular && (
              <Badge className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-1/2 rounded-full">
                {ttt("Popular")}
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="font-medium text-xl">{plan.name}</CardTitle>
              <CardDescription>
                <p>{plan.description}</p>
                {typeof plan.price[frequency as keyof typeof plan.price] ===
                "number" ? (
                  <NumberFlow
                    className="font-medium text-foreground"
                    format={{
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }}
                    suffix={`/${ttt("month")}, ${ttt("billed")} ${
                      frequency === "monthly" ? ttt("monthly") : ttt("yearly")
                    }.`}
                    value={
                      plan.price[frequency as keyof typeof plan.price] as number
                    }
                  />
                ) : (
                  <span className="font-medium text-foreground">
                    {plan.price[frequency as keyof typeof plan.price]}.
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {plan.features.map((feature, index) => (
                <div
                  className="flex items-center gap-2 text-muted-foreground text-sm"
                  key={index}
                >
                  <BadgeCheck className="h-4 w-4" /> {feature}
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "secondary"}
                onClick={() => {
                  if (plan.lookupKeys) {
                    const lookupKey =
                      plan.lookupKeys[
                        frequency as keyof typeof plan.lookupKeys
                      ];
                    handleSubscribe(lookupKey, plan.id);
                  }
                }}
                disabled={isLoading === plan.id}
              >
                {isLoading === plan.id ? ttt("Loading...") : plan.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
};
export default Pricing;
