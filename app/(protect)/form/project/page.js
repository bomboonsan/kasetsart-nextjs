"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client/react";
import Pageheader from "@/components/layout/Pageheader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MY_PROJECTS } from "@/graphql/me";
import { DELETE_PROJECT } from "@/graphql/projectQueries";
import TablePagination from "@/components/ui/table-pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export default function ProjectTable() {
  const { data: session, status } = useSession();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const authContext = useMemo(
    () => ({
      headers: {
        Authorization: session?.jwt ? `Bearer ${session?.jwt}` : "",
      },
    }),
    [session?.jwt]
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const filters = useMemo(() => {
    if (!debouncedSearch) return undefined;
    // filter by Thai or EN name containing the search term (case-insensitive)
    return {
      or: [
        { nameTH: { containsi: debouncedSearch } },
        { nameEN: { containsi: debouncedSearch } },
      ],
    };
  }, [debouncedSearch]);

  const queryVariables = useMemo(
    () => ({
      pagination: { page, pageSize: PAGE_SIZE },
      sort: ["updatedAt:desc"],
      filters,
      userId: session?.user?.documentId,
    }),
    [page, filters, session?.user?.documentId]
  );

  const { data, loading, error, refetch } = useQuery(MY_PROJECTS, {
    variables: queryVariables,
    context: authContext,
  });

  const [deleteProject, { loading: deleteLoading }] =
    useMutation(DELETE_PROJECT);

  const handleDelete = async (documentId) => {
    if (!documentId || deleteLoading) return;
    const confirmed = window.confirm("ยืนยันการลบโครงการนี้หรือไม่?");
    if (!confirmed) return;
    try {
      setDeletingId(documentId);
      await deleteProject({
        variables: { documentId },
        context: authContext,
      });
      await refetch();
    } catch (err) {
      console.error("Failed to delete project", err);
      window.alert(
        err?.message ? `ลบข้อมูลไม่สำเร็จ: ${err.message}` : "ลบข้อมูลไม่สำเร็จ"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const rawProjects = data?.projects || [];
  const projects = rawProjects;

  const canGoNextPage = rawProjects.length === PAGE_SIZE;

  const handleNextPage = () => {
    if (!canGoNextPage || loading) return;
    setPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    if (page <= 1 || loading) return;
    setPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div>
      <Pageheader
        title="จัดการโครงการวิจัย"
        btnName="เพิ่มทุนโครงการวิจัย"
        btnLink="/form/create/project"
      />

      {/* filter */}
      <div className="mb-4 flex items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white"
          placeholder="ค้นหาจากชื่อโครงการ..."
        />
      </div>
      {/* /filter */}

      <div className="text-sm text-gray-600 mb-4">
        แสดง {projects.length} รายการ (หน้า {page})
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={"px-5"}>ชื่อโครงการ</TableHead>
              <TableHead className={"px-5"}>ปีงบประมาณ</TableHead>
              <TableHead className={"px-5"}>งบประมาณ</TableHead>
              <TableHead className={"px-5"}>วันที่เผยแพร่</TableHead>
              <TableHead className={"px-5"}>วันที่เพิ่มเข้าสู่ระบบ</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} className="p-6 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={7} className="p-6 text-center text-red-600">
                  Error loading projects
                </TableCell>
              </TableRow>
            )}
            {projects.length === 0 && !loading && !error && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="p-6 text-center text-gray-500"
                >
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            )}

            {projects.map((p) => (
              <TableRow key={p.documentId}>
                <TableCell className={"px-5 md:max-w-64 whitespace-normal"}>
                  <div className="font-semibold">
                    {p.nameTH || p.nameEN || "—"}
                  </div>
                  {p.nameEN && p.nameTH && (
                    <div className="text-xs text-gray-500">{p.nameEN}</div>
                  )}
                </TableCell>
                <TableCell className={"px-5"}>{p.fiscalYear || "-"}</TableCell>
                <TableCell className={"px-5"}>
                  {p.budget ? `${p.budget} บาท` : "-"}
                </TableCell>
                <TableCell className={"px-5"}>
                  {p.durationStart
                    ? new Date(p.durationStart).toLocaleDateString("th-TH") +
                      " - " +
                      (p.durationEnd
                        ? new Date(p.durationEnd).toLocaleDateString("th-TH")
                        : "-")
                    : "-"}
                </TableCell>
                <TableCell className={"px-5"}>
                  {p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString("th-TH")
                    : "-"}
                </TableCell>
                <TableCell className="text-right px-5">
                  <div className="flex justify-end gap-3">
                    <a
                      className="text-blue-600"
                      href={`/form/project/view/${p.documentId}`}
                    >
                      ดู
                    </a>
                    <a
                      className="text-green-600"
                      href={`/form/project/edit/${p.documentId}`}
                    >
                      แก้ไข
                    </a>
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 py-0 leading-0 h-5 text-red-600"
                      onClick={() => handleDelete(p.documentId)}
                      disabled={deletingId === p.documentId || deleteLoading}
                    >
                      {deletingId === p.documentId ? "กำลังลบ..." : "ลบ"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        page={page}
        pageSize={PAGE_SIZE}
        itemsCount={projects.length}
        onPrevious={handlePreviousPage}
        onNext={handleNextPage}
        hasNextPage={canGoNextPage}
        isLoading={loading}
      />
    </div>
  );
}
