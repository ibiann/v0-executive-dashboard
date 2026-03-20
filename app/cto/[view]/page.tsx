import { use } from "react";
import CtoViewClient from "./client";

export default function CtoViewPage({
  params,
}: {
  params: Promise<{ view: string }>;
}) {
  const { view } = use(params);
  return <CtoViewClient view={view} />;
}
