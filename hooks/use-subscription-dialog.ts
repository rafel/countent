"use client";

import { useState, useEffect } from "react";
import { commonSettings } from "@/content/common";

export type SubscriptionDialogTarget =
  | "billing"
  | "usage"
  | "plans"
  | "history";

export interface SubscriptionDialogOptions {
  userId: string;
  workspaceId?: string;
  target?: SubscriptionDialogTarget;
  onClose?: () => void;
}

/**
 * Universal subscription dialog manager
 * Automatically determines which dialog to show based on subscription model
 */
export class SubscriptionDialogManager {
  private static instance: SubscriptionDialogManager;
  private currentDialog: {
    type: "user" | "workspace";
    target: SubscriptionDialogTarget;
    options: SubscriptionDialogOptions;
  } | null = null;

  private listeners: Array<(dialog: typeof this.currentDialog) => void> = [];

  static getInstance(): SubscriptionDialogManager {
    if (!SubscriptionDialogManager.instance) {
      SubscriptionDialogManager.instance = new SubscriptionDialogManager();
    }
    return SubscriptionDialogManager.instance;
  }

  /**
   * Subscribe to dialog state changes
   */
  subscribe(listener: (dialog: typeof this.currentDialog) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.currentDialog));
  }

  /**
   * Show the appropriate subscription dialog
   */
  showSubscriptionDialog(options: SubscriptionDialogOptions) {
    const { userId, workspaceId, target = "billing" } = options;

    // Determine which dialog to show based on subscription model
    const dialogType = this.determineDialogType(workspaceId);

    this.currentDialog = {
      type: dialogType,
      target,
      options,
    };

    this.notify();
  }

  /**
   * Close the current subscription dialog
   */
  closeDialog() {
    const onClose = this.currentDialog?.options.onClose;
    this.currentDialog = null;
    this.notify();
    onClose?.();
  }

  /**
   * Get current dialog state
   */
  getCurrentDialog() {
    return this.currentDialog;
  }

  /**
   * Determine which dialog to show based on business rules
   */
  private determineDialogType(workspaceId?: string): "user" | "workspace" {
    const subscriptionModel = commonSettings.subscriptionModel;

    if (subscriptionModel === "b2b") {
      // B2B: Always show in workspace dialog (workspace pays)
      return "workspace";
    } else {
      // B2C: Show in user dialog (user pays)
      return "user";
    }
  }
}

// Export singleton instance
export const subscriptionDialogManager =
  SubscriptionDialogManager.getInstance();

/**
 * Convenience functions for common use cases
 */

// Show subscription management (billing)
export function showSubscriptionManagement(
  userId: string,
  workspaceId?: string
) {
  subscriptionDialogManager.showSubscriptionDialog({
    userId,
    workspaceId,
    target: "billing",
  });
}

// Show usage and limits
export function showUsageDialog(userId: string, workspaceId?: string) {
  subscriptionDialogManager.showSubscriptionDialog({
    userId,
    workspaceId,
    target: "usage",
  });
}

// Show pricing plans
export function showPricingDialog(userId: string, workspaceId?: string) {
  subscriptionDialogManager.showSubscriptionDialog({
    userId,
    workspaceId,
    target: "plans",
  });
}

// Show billing history
export function showBillingHistory(userId: string, workspaceId?: string) {
  subscriptionDialogManager.showSubscriptionDialog({
    userId,
    workspaceId,
    target: "history",
  });
}

export function useSubscriptionDialog() {
  const [currentDialog, setCurrentDialog] = useState(
    subscriptionDialogManager.getCurrentDialog()
  );

  useEffect(() => {
    const unsubscribe = subscriptionDialogManager.subscribe(setCurrentDialog);
    return unsubscribe;
  }, []);

  return {
    currentDialog,
    closeDialog: () => subscriptionDialogManager.closeDialog(),
  };
}
