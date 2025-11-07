"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client/react";
import Pageheader from "@/components/layout/Pageheader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MY_BOOKS } from "@/graphql/me";
import { DELETE_BOOK } from "@/graphql/formQueries";
import TablePagination from "@/components/ui/table-pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export default function BookTable() {
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
    // filter by Thai or EN title, or writer containing the search term (case-insensitive)
    return {
      or: [
        { titleTH: { containsi: debouncedSearch } },
        { titleEN: { containsi: debouncedSearch } },
        { writers: { containsi: debouncedSearch } },
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

  const { data, loading, error, refetch } = useQuery(MY_BOOKS, {
    variables: queryVariables,
    context: authContext,
  });

  const [deleteBook, { loading: deleteLoading }] = useMutation(DELETE_BOOK);

  const handleDelete = async (documentId) => {
    if (!documentId || deleteLoading) return;
    const confirmed = window.confirm("ยืนยันการลบข้อมูลหนังสือนี้หรือไม่?");
    if (!confirmed) return;
    try {
      setDeletingId(documentId);
      await deleteBook({
        variables: { documentId },
        context: authContext,
      });
      await refetch();
    } catch (err) {
      console.error("Failed to delete book", err);
      window.alert(
        err?.message ? `ลบข้อมูลไม่สำเร็จ: ${err.message}` : "ลบข้อมูลไม่สำเร็จ"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const rawBooks = data?.books || [];
  const books = rawBooks;

  const canGoNextPage = rawBooks.length === PAGE_SIZE;

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
        title="จัดการข้อมูลหนังสือหรือตำรา"
        btnName="เพิ่มข้อมูลหนังสือหรือตำรา"
        btnLink="/form/create/book"
      />

      {/* filter */}
      <div className="mb-4 flex items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white"
          placeholder="ค้นหาจากชื่อผลงาน..."
        />
      </div>
      {/* /filter */}

      <div className="text-sm text-gray-600 mb-4">
        แสดง {books.length} รายการ (หน้า {page})
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={"px-5"}>ชื่อผลงาน</TableHead>
              <TableHead className={"px-5"}>ประเภท</TableHead>
              <TableHead className={"px-5"}>Year Contracted</TableHead>
              <TableHead className={"px-5"}>ระดับผลงาน</TableHead>
              <TableHead className={"px-5"}>วันที่เพิ่มเข้าสู่ระบบ</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="p-6 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={6} className="p-6 text-center text-red-600">
                  Error loading books: {error.message}
                </TableCell>
              </TableRow>
            )}

            {books.length === 0 && !loading && !error && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="p-6 text-center text-gray-500"
                >
                  ไม่พบข้อมูลหนังสือ
                </TableCell>
              </TableRow>
            )}

            {books.map((b) => (
              <TableRow key={b.documentId}>
                <TableCell className={"px-5 md:max-w-64 whitespace-normal"}>
                  <div className="font-semibold ">
                    {b.titleTH || b.titleEN || "—"}
                  </div>
                  {b.titleEN && b.titleTH && (
                    <div className="text-xs text-gray-500">{b.titleEN}</div>
                  )}
                </TableCell>
                <TableCell className={"px-5"}>
                  {b.bookType == "0" ? "หนังสือ" : "ตำรา"}
                </TableCell>
                <TableCell className={"px-5"}>
                  {b.yearContracted ? b.yearContracted : "-"}
                </TableCell>
                <TableCell className={"px-5"}>
                  {b.level == "0" ? "ระดับชาติ" : "ระดับนานาชาติ"}
                </TableCell>
                <TableCell className={"px-5"}>
                  {b.createdAt
                    ? new Date(b.createdAt).toLocaleDateString("th-TH")
                    : "-"}
                </TableCell>
                <TableCell className="text-right px-5">
                  <div className="flex justify-end gap-3">
                    <a
                      className="text-blue-600"
                      href={`/form/book/view/${b.documentId}`}
                    >
                      ดู
                    </a>
                    <a
                      className="text-green-600"
                      href={`/admin/form/book/edit/${b.documentId}`}
                    >
                      แก้ไข
                    </a>
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 py-0 leading-0 h-5 text-red-600"
                      onClick={() => handleDelete(b.documentId)}
                      disabled={deletingId === b.documentId || deleteLoading}
                    >
                      {deletingId === b.documentId ? "กำลังลบ..." : "ลบ"}
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
        itemsCount={books.length}
        onPrevious={handlePreviousPage}
        onNext={handleNextPage}
        hasNextPage={canGoNextPage}
        isLoading={loading}
      />
    </div>
  );
}
