import {
  Building2,
  User,
  Briefcase,
  Store,
  Laptop,
  Palette,
  Rocket,
  Heart,
  Coffee,
  Lightbulb,
  Target,
  Zap,
  Globe,
  Camera,
  Music,
} from "lucide-react";
import { WorkspaceType } from "@/lib/db/tables/workspace";

export const workspaceIcons = [
  { id: "briefcase", icon: Briefcase },
  { id: "building2", icon: Building2 },
  { id: "user", icon: User },
  { id: "store", icon: Store },
  { id: "laptop", icon: Laptop },
  { id: "palette", icon: Palette },
  { id: "rocket", icon: Rocket },
  { id: "heart", icon: Heart },
  { id: "coffee", icon: Coffee },
  { id: "lightbulb", icon: Lightbulb },
  { id: "target", icon: Target },
  { id: "zap", icon: Zap },
  { id: "globe", icon: Globe },
  { id: "camera", icon: Camera },
  { id: "music", icon: Music },
];

// Icon mapping with fallback
export const getWorkspaceIcon = (iconId?: string) => {
  const iconData = workspaceIcons.find(icon => icon.id === iconId);
  return iconData ? iconData.icon : Briefcase; // Default fallback to Briefcase
};

// Workspace type translation keys
export const getWorkspaceTypeTranslationKey = (type: WorkspaceType): "Personal" | "Company" => {
  const typeMap: Record<WorkspaceType, "Personal" | "Company"> = {
    personal: "Personal",
    company: "Company",
  };
  return typeMap[type];
};
