import { Suspense } from "react";
import dynamic from "next/dynamic";

// const MarksEntryGrid = dynamic(
//   () => import("@/components/features/academics/marks-entry-grid"),
//   { ssr: false },
// );

export default function MarksEntryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold font-heading">Marks Entry</h1>
        <p className="text-muted-foreground">
          Enter and publish assessment scores for your class.
        </p>
      </div>

      <Suspense fallback={<div>Loading entry grid...</div>}>
        {/* <MarksEntryGrid subjectId="sub-math-101" /> */}
        <div className="p-4 border border-dashed rounded text-muted-foreground">
          Marks Entry Grid Temporarily Disabled for Build Verification
        </div>
      </Suspense>
    </div>
  );
}
