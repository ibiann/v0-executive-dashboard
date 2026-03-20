import { redirect } from "next/navigation";

export default function PmProjectRoot({ params }: { params: { projectId: string } }) {
  redirect(`/pm/${params.projectId}/phases`);
}
