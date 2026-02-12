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
  return <StudentProfileClient studentId={params.id} />;
}
