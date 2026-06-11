import { UserProfile } from "@clerk/nextjs";

export default function UserProfilePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <UserProfile path="/user-profile" routing="path" />
    </main>
  );
}