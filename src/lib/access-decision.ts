export type AccessStatus = "pending" | "approved" | "rejected";
export type AccessResult = "updated" | "unchanged" | "email_sent" | "email_failed" | "stale";

/** The caller checks administrator permissions and reads the recipient from the database. */
export async function decideAccess(
  current: { status: AccessStatus; email: string },
  next: AccessStatus,
  retry: boolean,
  dependencies: {
    update: (expected: AccessStatus, next: AccessStatus) => Promise<boolean>;
    notify: (email: string) => Promise<void>;
  },
): Promise<AccessResult> {
  if (retry) {
    if (current.status !== "approved" || next !== "approved") return "unchanged";
  } else {
    if (current.status === next) return "unchanged";
    // Compare and update together: concurrent approval clicks send only one email.
    if (!await dependencies.update(current.status, next)) return "stale";
    if (next !== "approved") return "updated";
  }
  try {
    await dependencies.notify(current.email);
    return "email_sent";
  } catch {
    // Approval stays valid. The administrator can explicitly retry the email.
    return "email_failed";
  }
}
