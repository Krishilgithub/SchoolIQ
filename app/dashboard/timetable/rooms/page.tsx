"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RoomService } from "@/lib/services/room";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Grid3x3,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/types/database.types";

type Room = Database["public"]["Tables"]["rooms"]["Row"];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function RoomsPage() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [formData, setFormData] = useState({
    room_number: "",
    room_name: "",
    room_type: "classroom" as "classroom" | "lab" | "library" | "auditorium" | "sports" | "other",
    capacity: 30,
    floor: "",
    building: "",
    facilities: [] as string[],
  });

  useEffect(() => {
    loadRooms();
  }, [filterType]);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const type = filterType === "all" ? undefined : filterType;
      const data = await RoomService.getRoomsByType("", type);
      setRooms(data);
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await RoomService.createRoom({
        ...formData,
        school_id: "", // Will be filled by service
        is_available: true,
      });

      toast({
        title: "Success",
        description: "Room created successfully",
      });

      setDialogOpen(false);
      setFormData({
        room_number: "",
        room_name: "",
        room_type: "classroom",
        capacity: 30,
        floor: "",
        building: "",
        facilities: [],
      });
      loadRooms();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      });
    }
  };

  const getRoomTypeBadge = (type: string) => {
    const variants = {
      classroom: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      lab: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      library: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      auditorium: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      sports: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };
    return variants[type as keyof typeof variants] || variants.other;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/timetable">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Room Management
            </h2>
            <p className="text-muted-foreground">
              Manage classrooms, labs, and other facilities
            </p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Room</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room_number">Room Number *</Label>
                  <Input
                    id="room_number"
                    placeholder="e.g., 101, Lab-A"
                    value={formData.room_number}
                    onChange={(e) =>
                      setFormData({ ...formData, room_number: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="room_name">Room Name</Label>
                  <Input
                    id="room_name"
                    placeholder="e.g., Physics Lab"
                    value={formData.room_name}
                    onChange={(e) =>
                      setFormData({ ...formData, room_name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room_type">Room Type *</Label>
                  <Select
                    value={formData.room_type}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, room_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classroom">Classroom</SelectItem>
                      <SelectItem value="lab">Laboratory</SelectItem>
                      <SelectItem value="library">Library</SelectItem>
                      <SelectItem value="auditorium">Auditorium</SelectItem>
                      <SelectItem value="sports">Sports Facility</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="30"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="building">Building</Label>
                  <Input
                    id="building"
                    placeholder="e.g., Main Building"
                    value={formData.building}
                    onChange={(e) =>
                      setFormData({ ...formData, building: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    placeholder="e.g., Ground, 1st, 2nd"
                    value={formData.floor}
                    onChange={(e) =>
                      setFormData({ ...formData, floor: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                  Create Room
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Rooms
                </p>
                <p className="text-2xl font-bold">{rooms.length}</p>
              </div>
              <Grid3x3 className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Available
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {rooms.filter((r) => r.is_available).length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  In Use
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {rooms.filter((r) => !r.is_available).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Capacity
                </p>
                <p className="text-2xl font-bold">
                  {rooms.reduce((sum, r) => sum + (r.capacity || 0), 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Filter */}
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Label>Filter by Type:</Label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="classroom">Classroom</SelectItem>
              <SelectItem value="lab">Laboratory</SelectItem>
              <SelectItem value="library">Library</SelectItem>
              <SelectItem value="auditorium">Auditorium</SelectItem>
              <SelectItem value="sports">Sports Facility</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Rooms Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </Card>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <Card className="p-12 text-center">
          <Grid3x3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first room
          </p>
        </Card>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {rooms.map((room) => (
            <motion.div key={room.id} variants={item}>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      {room.room_number}
                    </h3>
                    {room.room_name && (
                      <p className="text-sm text-muted-foreground">
                        {room.room_name}
                      </p>
                    )}
                  </div>
                  <Badge className={getRoomTypeBadge(room.room_type)}>
                    {room.room_type}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    Capacity: {room.capacity}
                  </div>
                  {room.building && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      {room.building}
                      {room.floor && `, ${room.floor}`}
                    </div>
                  )}
                  <div className="flex items-center">
                    {room.is_available ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Available
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                        <XCircle className="mr-1 h-3 w-3" />
                        In Use
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
                  <Button variant="outline" className="flex-1" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
