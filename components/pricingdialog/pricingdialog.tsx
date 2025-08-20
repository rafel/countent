"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/use-language";
import Pricing from "./pricing";
import { Alert } from "../ui/alert";
import { AlertCircle } from "lucide-react";

const PricingDialog = ({
  open,
  onOpenChange,
  showFreePlan = false,
  limitReached = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showFreePlan?: boolean;
  limitReached?: boolean;
}) => {
  const { ttt } = useLanguage();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {limitReached && (
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              {ttt(
                "You have reached the limit of your current plan. Please upgrade to continue."
              )}
            </Alert>
          )}    
          <DialogTitle>{ttt("Manage subscription")}</DialogTitle>
          <DialogDescription>
            {ttt("Choose the plan that's right for you.")}
          </DialogDescription>
        </DialogHeader>
        <Pricing showFreePlan={showFreePlan} />
      </DialogContent>
    </Dialog>
  );
};
export default PricingDialog;
