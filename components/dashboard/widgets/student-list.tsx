"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const students = [
  {
    name: "Evelyn Harper",
    id: "PRE43178",
    marks: 1185,
    percent: "98%",
    status: "Top 1%",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  },
  {
    name: "Diana Plenty",
    id: "PRE43174",
    marks: 1165,
    percent: "91%",
    status: "Top 5%",
    image: "https://i.pravatar.cc/150?u=a04258a2462d826712d",
  },
  {
    name: "John Millar",
    id: "PRE43187",
    marks: 1175,
    percent: "92%",
    status: "Top 5%",
    image: "https://i.pravatar.cc/150?u=a04258114e29026302d",
  },
  {
    name: "Miles Esther",
    id: "PRE45371",
    marks: 1180,
    percent: "93%",
    status: "Top 5%",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  },
];

export function StarStudents() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Star Students</CardTitle>
        <CardDescription>Top performers this semester</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Student</TableHead>
              <TableHead>Marks</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead className="text-right">Rank</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.image} />
                      <AvatarFallback>{student.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{student.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {student.id}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{student.marks}</TableCell>
                <TableCell>{student.percent}</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-700 hover:bg-orange-100"
                  >
                    {student.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
