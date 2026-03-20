import { redirect } from "next/navigation";
import { use } from "react";

export default function PmProjectRoot({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  redirect(`/pm/${projectId}/phases`);
}
