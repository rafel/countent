"use server";

import { dbclient } from "@/db/db";
import { companyInvites, companyUsers, companies, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUser } from "@/utils/user";
import { redirect } from "next/navigation";

export interface PendingInviteWithCompany {
  inviteid: string;
  email: string;
  role: string;
  createdat: Date;
  companyid: string;
  companyName: string;
  inviterName: string | null;
  inviterEmail: string;
}

export async function getPendingInvitesForUser(email: string): Promise<PendingInviteWithCompany[]> {
  try {
    const invites = await dbclient
      .select({
        inviteid: companyInvites.inviteid,
        email: companyInvites.email,
        role: companyInvites.role,
        createdat: companyInvites.createdat,
        companyid: companyInvites.companyid,
        companyName: companies.name,
        inviterName: users.name,
        inviterEmail: users.email,
      })
      .from(companyInvites)
      .innerJoin(companies, eq(companyInvites.companyid, companies.companyid))
      .innerJoin(users, eq(companyInvites.invitedby, users.userid))
      .where(eq(companyInvites.email, email));

    return invites.map(invite => ({
      ...invite,
      companyName: invite.companyName || "Unknown Company"
    }));
  } catch (error) {
    console.error("Error fetching pending invites:", error);
    return [];
  }
}

export async function acceptInvite(inviteId: string): Promise<{ success: boolean; error?: string; companyId?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get the invite details
    const invite = await dbclient
      .select()
      .from(companyInvites)
      .where(and(
        eq(companyInvites.inviteid, inviteId),
        eq(companyInvites.email, user.email)
      ))
      .limit(1);

    if (!invite || invite.length === 0) {
      return { success: false, error: "Invite not found or not for this user" };
    }

    const inviteData = invite[0];

    // Check if user is already a member of this company
    const existingMembership = await dbclient
      .select()
      .from(companyUsers)
      .where(and(
        eq(companyUsers.companyid, inviteData.companyid),
        eq(companyUsers.userid, user.userid)
      ))
      .limit(1);

    if (existingMembership.length > 0) {
      // Remove the invite since user is already a member
      await dbclient
        .delete(companyInvites)
        .where(eq(companyInvites.inviteid, inviteId));
      
      return { success: false, error: "You are already a member of this company" };
    }

    // Add user to company
    await dbclient
      .insert(companyUsers)
      .values({
        userid: user.userid,
        companyid: inviteData.companyid,
        role: inviteData.role,
      });

    // Remove the invite
    await dbclient
      .delete(companyInvites)
      .where(eq(companyInvites.inviteid, inviteId));

    return { success: true, companyId: inviteData.companyid };
  } catch (error) {
    console.error("Error accepting invite:", error);
    return { success: false, error: "Failed to accept invitation" };
  }
}

export async function declineInvite(inviteId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Verify the invite belongs to this user and delete it
    await dbclient
      .delete(companyInvites)
      .where(and(
        eq(companyInvites.inviteid, inviteId),
        eq(companyInvites.email, user.email)
      ));

    return { success: true };
  } catch (error) {
    console.error("Error declining invite:", error);
    return { success: false, error: "Failed to decline invitation" };
  }
}

export async function redirectToDashboard() {
  redirect("/dashboard");
} 
