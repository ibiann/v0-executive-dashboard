import { use } from "react";
import CtoProjectDrawerClient from "./client";

export default function CtoProjectDrawerPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  return <CtoProjectDrawerClient projectId={projectId} />;
}

