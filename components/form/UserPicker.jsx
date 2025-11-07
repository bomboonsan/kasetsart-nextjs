import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_ALL_USERS } from "../../graphql/userQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Search, User, X } from "lucide-react";

export default function UserPicker({ label, selectedUser, onSelect }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const {
    data: usersData,
    loading,
    error,
  } = useQuery(GET_ALL_USERS, {
    variables: {
      pagination: { pageSize: 100 },
      filters: searchTerm
        ? {
            or: [
              { firstNameTH: { containsi: searchTerm } },
              { lastNameTH: { containsi: searchTerm } },
              { firstNameEN: { containsi: searchTerm } },
              { lastNameEN: { containsi: searchTerm } },
              { email: { containsi: searchTerm } },
              { username: { containsi: searchTerm } },
            ],
          }
        : {},
    },
    skip: !searchOpen,
    ssr: false, // prevent server-side fetch to avoid build/chunking issues
  });

  useEffect(() => {
    // New query returns an array of users directly (no .data/.attributes wrapper)
    const returned = usersData?.usersPermissionsUsers;
    if (Array.isArray(returned)) {
      const users = returned.map((user) => ({
        id: user.documentId || user.id,
        documentId: user.documentId || user.id,
        username: user.username,
        email: user.email,
        firstNameTH: user.firstNameTH,
        lastNameTH: user.lastNameTH,
        firstNameEN: user.firstNameEN,
        lastNameEN: user.lastNameEN,
        academicPosition: user.academicPosition,
        departments: Array.isArray(user.departments)
          ? user.departments.map((d) => ({ id: d.documentId, name: d.title }))
          : [],
        faculties: Array.isArray(user.faculties)
          ? user.faculties.map((f) => ({ id: f.documentId, name: f.title }))
          : [],
        organizations: Array.isArray(user.organizations)
          ? user.organizations.map((o) => ({ id: o.documentId, name: o.title }))
          : [],
      }));
      setFilteredUsers(users);
    } else {
      setFilteredUsers([]);
    }
  }, [usersData]);

  const handleUserSelect = (user) => {
    onSelect(user);
    setSearchOpen(false);
    setSearchTerm("");
  };

  const clearSelection = () => {
    onSelect(null);
  };

  const formatUserDisplay = (user) => {
    const thName = `${user.firstNameTH || ""} ${user.lastNameTH || ""}`.trim();
    const enName = `${user.firstNameEN || ""} ${user.lastNameEN || ""}`.trim();
    return thName || enName || user.email || user.username;
  };

  const formatUserOrganization = (user) => {
    const orgs = [
      ...(user.departments || []),
      ...(user.faculties || []),
      ...(user.organizations || []),
    ]
      .map((org) => org.name)
      .filter(Boolean);
    return orgs.length > 0 ? orgs.join(", ") : "";
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
      )}

      {selectedUser ? (
        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <User className="w-5 h-5 text-gray-600" />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {formatUserDisplay(selectedUser)}
            </div>
            {selectedUser.email && (
              <div className="text-xs text-gray-600">{selectedUser.email}</div>
            )}
            {formatUserOrganization(selectedUser) && (
              <div className="text-xs text-gray-500">
                {formatUserOrganization(selectedUser)}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-gray-500"
            >
              <Search className="w-4 h-4 mr-2 cursor-pointer" />
              เลือกผู้ใช้งาน...
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>เลือกผู้ใช้งาน</DialogTitle>
              <DialogDescription>
                ค้นหาและเลือกผู้ใช้งานจากระบบ
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 cursor-pointer">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="ค้นหาด้วยชื่อ, อีเมล, หรือหน่วยงาน..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                {loading && (
                  <div className="p-4 text-center text-gray-500">
                    กำลังโหลด...
                  </div>
                )}
                {error && (
                  <div className="p-4 text-center text-red-500">
                    เกิดข้อผิดพลาด: {error.message}
                  </div>
                )}
                {!loading && !error && filteredUsers.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    ไม่พบผู้ใช้งาน
                  </div>
                )}
                {!loading &&
                  !error &&
                  filteredUsers.map((user) => (
                    <div
                      key={user.documentId}
                      className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {formatUserDisplay(user)}
                          </div>
                          {user.email && (
                            <div className="text-xs text-gray-600">
                              {user.email}
                            </div>
                          )}
                          {user.academicPosition && (
                            <div className="text-xs text-gray-500">
                              {user.academicPosition}
                            </div>
                          )}
                          {formatUserOrganization(user) && (
                            <div className="text-xs text-gray-500">
                              {formatUserOrganization(user)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
