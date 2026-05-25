
"use client"
"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const CoursesManagement = () => {
  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white px-6 py-5 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">
              Quản lý khóa học
            </h1>
            <p className="text-sm text-slate-600">
              Tạo mới, cập nhật và theo dõi nội dung khóa học.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="h-10 rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800">
              Tạo khóa học
            </Button>
            <Button className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-slate-700 hover:bg-slate-100">
              Xuất danh sách
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle>Danh sách khóa học</CardTitle>
              <CardDescription>
                Quản lý toàn bộ khóa học và trạng thái hoạt động.
              </CardDescription>
              <div className="flex flex-wrap gap-3">
                <Input
                  placeholder="Tìm theo tên khóa học..."
                  className="h-10 w-64 border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70"
                />
                <Input
                  placeholder="Lọc theo lớp học"
                  className="h-10 w-48 border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70"
                />
                <Button className="h-10 rounded-lg bg-slate-900 text-white hover:bg-slate-800">
                  Lọc
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên khóa học</TableHead>
                    <TableHead>Lớp học</TableHead>
                    <TableHead>Số buổi học</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Cập nhật</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium text-slate-900">
                      Toán 12 - Chương 1
                    </TableCell>
                    <TableCell>12A1</TableCell>
                    <TableCell>12</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                        Đang hoạt động
                      </span>
                    </TableCell>
                    <TableCell>21/05/2026</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-100">
                          Sửa
                        </Button>
                        <Button className="h-8 rounded-lg bg-slate-900 px-3 text-white hover:bg-slate-800">
                          Quản lý
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-slate-900">
                      Lý 11 - Động học
                    </TableCell>
                    <TableCell>11B2</TableCell>
                    <TableCell>9</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                        Đang cập nhật
                      </span>
                    </TableCell>
                    <TableCell>18/05/2026</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-100">
                          Sửa
                        </Button>
                        <Button className="h-8 rounded-lg bg-slate-900 px-3 text-white hover:bg-slate-800">
                          Quản lý
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-slate-900">
                      Hóa 10 - Cơ bản
                    </TableCell>
                    <TableCell>10C3</TableCell>
                    <TableCell>6</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        Tạm dừng
                      </span>
                    </TableCell>
                    <TableCell>14/05/2026</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-100">
                          Sửa
                        </Button>
                        <Button className="h-8 rounded-lg bg-slate-900 px-3 text-white hover:bg-slate-800">
                          Quản lý
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Tạo lớp học</CardTitle>
              <CardDescription>
                Nhập thông tin tên và mô tả lớp học.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-600">
                  Tên lớp học
                </label>
                <Input
                  placeholder="Ví dụ: 12A1 - Khối Tự nhiên"
                  className="h-10 border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-600">
                  Mô tả lớp học
                </label>
                <textarea
                  className="min-h-30 w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300/70 focus-visible:border-slate-300 focus-visible:outline-none"
                  placeholder="Mô tả mục tiêu, đặc điểm, chương trình lớp học..."
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="h-10 w-full cursor-pointer rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                Lưu lớp học
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CoursesManagement
