"use client";

import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";

export default function AdminError({ reset }) {
  return (
    <ErrorState
      title="Something went wrong"
      body="This screen could not be loaded. Please try again."
      action={<Button onClick={reset}>Try again</Button>}
    />
  );
}
