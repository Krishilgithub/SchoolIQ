// This page is now using client-side rendering due to API integration
// Import the client component
import StudentProfileClient from "./student-profile-client";

interface StudentProfilePageProps {
  params: {
    id: string;
  };
}

export default function StudentProfilePage({
  params,
}: StudentProfilePageProps) {
  const resolvedParams = await params;
  return <StudentProfileClient studentId={resolvedParams.id} />;
}
