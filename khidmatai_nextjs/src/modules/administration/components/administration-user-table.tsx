import Link from "next/link";
import type { AdministrationUserListItem } from "../types/administration-workspace-types";
import { buttonVariants } from "@/components/ui/button";

export function AdministrationUserTable({ users }: { users: AdministrationUserListItem[] }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-ink/10 bg-white">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-ink/8 text-xs uppercase text-ink/40">
          <tr>
            {["Account", "Role", "Status", "Joined", ""].map((label) => (
              <th key={label} className="px-4 py-3">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/6">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                    {getInitials(user.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{user.name}</p>
                    <p className="truncate text-xs text-ink/45">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 capitalize text-ink/60">{user.role}</td>
              <td className="px-4">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.deactivatedAt ? "bg-slate-100 text-slate-700" : user.banned ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}
                >
                  {user.deactivatedAt ? "Deactivated" : user.banned ? "Banned" : "Active"}
                </span>
              </td>
              <td className="px-4 text-ink/45">{new Date(user.createdAt).toLocaleDateString()}</td>
              <td className="px-4 text-right">
                <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={`/admin/users/${encodeURIComponent(user.id)}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!users.length && <p className="p-10 text-center text-sm text-ink/40">No matching accounts found.</p>}
    </div>
  );
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U"
  );
}
