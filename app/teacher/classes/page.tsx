

"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useCreateClassroomMutation } from "@/app/hooks/classes/useCreateClass"
import { useCreateClassScheduleMutation } from "@/app/hooks/schedules/useCreateClassSchedule"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useGetClassesQuery } from "@/app/hooks/classes/useGetClasses"
import { useGetClassSchedulesQuery } from "@/app/hooks/schedules/useGetClassSchedules"
import type { GetAllClassesFilter } from "@/app/service/classroom.service"
import { Controller, useForm, useWatch } from "react-hook-form"

const dayOptions = [
  { label: "Thứ 2", value: "MONDAY" },
  { label: "Thứ 3", value: "TUESDAY" },
  { label: "Thứ 4", value: "WEDNESDAY" },
  { label: "Thứ 5", value: "THURSDAY" },
  { label: "Thứ 6", value: "FRIDAY" },
  { label: "Thứ 7", value: "SATURDAY" },
  { label: "Chủ nhật", value: "SUNDAY" },
]

const studyModeOptions = [
  { label: "Online", value: "ONLINE" },
  { label: "Offline", value: "OFFLINE" },
  { label: "Hybrid", value: "HYBRID" },
]

const formatDate = (value?: string) => {
  if (!value) return "-"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

const getStatusStyles = (status?: string) => {
  switch ((status ?? "").toUpperCase()) {
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "INACTIVE":
      return "border-slate-200 bg-slate-100 text-slate-600"
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700"
    default:
      return "border-slate-200 bg-slate-100 text-slate-700"
  }
}

type ClassScheduleFormValues = {
  classroomId: string
  dayOfWeek: string
  startTime: string
  endTime: string
  studyMode: string
  location: string
  meetingUrl: string
}

const ClassesManagement = () => {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [codeSearch, setCodeSearch] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const classLookupFilter = useMemo(
    () => ({
      page: 0,
      size: 500,
      name: "",
      code: "",
    }),
    [],
  )
  const [filter, setFilter] = useState<GetAllClassesFilter>({
    page: 0,
    size: 5,
    name: "",
    code: "",
  })
  const { data, isLoading, refetch } = useGetClassesQuery(filter)
  const { data: allClassesResponse } = useGetClassesQuery(classLookupFilter)
  const { mutateAsync, isPending, error } = useCreateClassroomMutation()
  const {
    mutateAsync: createSchedule,
    isPending: isSchedulePending,
    error: scheduleError,
  } = useCreateClassScheduleMutation()
  const {
    control,
    register,
    handleSubmit: handleScheduleSubmit,
    reset: resetSchedule,
    formState: { isSubmitting: isScheduleSubmitting },
  } = useForm<ClassScheduleFormValues>({
    defaultValues: {
      classroomId: "",
      dayOfWeek: "MONDAY",
      startTime: "08:00:00",
      endTime: "11:30:00",
      studyMode: "ONLINE",
      location: "",
      meetingUrl: "",
    },
  })
  const selectedClassroomId = useWatch({ control, name: "classroomId" })

  const classes = data?.items ?? []
  const scheduleClasses = allClassesResponse?.items ?? []
  const selectedClass = scheduleClasses.find(
    (item) => item.id === selectedClassroomId,
  )
  const {
    data: schedules = [],
    isLoading: isSchedulesLoading,
    isFetching: isSchedulesFetching,
  } = useGetClassSchedulesQuery(selectedClassroomId || undefined)
  const totalPages = data?.totalPages ?? 1
  const currentPage = data?.number ?? filter.page
  const handleCreate = async () => {
    if (!name.trim() || !startDate || !endDate) return
    await mutateAsync({
      name: name.trim(),
      description: description.trim() || "",
      startDate,
      endDate,
    })

    setName("")
    setDescription("")
    setStartDate("")
    setEndDate("")
    await refetch()
  }

  const handleFilter = () => {
    setFilter((prev) => ({
      ...prev,
      page: 0,
      name: search.trim(),
      code: codeSearch.trim(),
    }))
  }

  const handlePageChange = (nextPage: number) => {
    setFilter((prev) => ({
      ...prev,
      page: nextPage,
    }))
  }

  const onSubmitSchedule = async (values: ClassScheduleFormValues) => {
    await createSchedule({
      classroomId: values.classroomId,
      dayOfWeek: values.dayOfWeek,
      startTime: values.startTime,
      endTime: values.endTime,
      studyMode: values.studyMode,
      location: values.location.trim() || undefined,
      meetingUrl: values.meetingUrl.trim() || undefined,
    })

    // resetSchedule({
    //   classroomId: "",
    //   dayOfWeek: "MONDAY",
    //   startTime: "08:00:00",
    //   endTime: "11:30:00",
    //   studyMode: "ONLINE",
    //   location: "",
    //   meetingUrl: "",
    // })
  }

  const handleGoToMaterials = (classId?: string) => {
    if (!classId) return
    router.push(
      `/teacher/dashboard_layout?menu=materials&classId=${encodeURIComponent(classId)}`,
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white px-6 py-5 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">
              Quản lý lớp học
            </h1>
            <p className="text-sm text-slate-600">
              Tạo mới, cập nhật và quản lý thông tin lớp học.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
    
            <Button className="h-10 rounded-xl cursor-pointer border border-slate-200 bg-white px-5 text-slate-700 hover:bg-slate-100">
              Xuất danh sách
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle>Danh sách lớp học</CardTitle>
              <CardDescription>
                Theo dõi thông tin lớp học và ghi chú mô tả.
              </CardDescription>
              <div className="flex flex-wrap gap-3">
                <Input
                  placeholder="Tìm theo tên lớp..."
                  className="h-10 w-64 border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <Input
                  placeholder="Tìm theo mã lớp..."
                  className="h-10 w-48 border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70"
                  value={codeSearch}
                  onChange={(event) => setCodeSearch(event.target.value)}
                />
                <Button
                  className="h-10 rounded-lg cursor-pointer bg-slate-900 text-white hover:bg-slate-800"
                  onClick={handleFilter}
                >
                  Lọc
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên lớp học</TableHead>
                   
                    <TableHead>Thời gian học</TableHead>
                    {/* <TableHead>Mã lớp</TableHead> */}
                     <TableHead>Mô tả</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Số học sinh</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-6 text-center text-sm text-slate-500"
                      >
                        Đang tải danh sách lớp học...
                      </TableCell>
                    </TableRow>
                  ) : classes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-6 text-center text-sm text-slate-500"
                      >
                        Chưa có lớp học nào phù hợp.
                      </TableCell>
                    </TableRow>
                  ) : (
                    classes.map((item) => (
                      <TableRow key={item.id ?? item.name}>
                        <TableCell className="font-medium text-slate-900">
                          <div className="space-y-1">
                            <div className="font-semibold text-slate-900">
                              {item.name}
                            </div>
                            {item.code ? (
                              <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-600">
                                {item.code}
                              </div>
                            ) : null}
                          </div>
                        </TableCell>
                       
                        <TableCell className="text-slate-600">
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                              Từ {formatDate(item.startDate)}
                            </span>
                            <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                              Đến {formatDate(item.endDate)}
                            </span>
                          </div>
                        </TableCell>
                         <TableCell className="text-slate-600">
                          {item.description || "-"}
                        </TableCell>
                        {/* <TableCell>
                          {item.code ? (
                            <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {item.code}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell> */}
                        <TableCell className="text-slate-600">
                          {item.status ? (
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusStyles(item.status)}`}
                            >
                              {item.status}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          <span className="inline-flex min-w-12 justify-center rounded-full border border-slate-200 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                            {item.totalStudent ?? 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button className="h-8 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-100">
                              Sửa
                            </Button>
                            <Button
                              className="h-8 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-100"
                              onClick={() => handleGoToMaterials(item.id)}
                              type="button"
                            >
                              Tài nguyên lớp học
                            </Button>
                            <Button className="h-8 cursor-pointer rounded-lg bg-slate-900 px-3 text-white hover:bg-slate-800">
                              Xoá
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                <span>
                  Trang {currentPage + 1} / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    className="h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-100"
                    onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                    disabled={currentPage <= 0}
                  >
                    Trước
                  </Button>
                  <Button
                    className="h-9 rounded-lg cursor-pointer border border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-100"
                    onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </CardContent>
              <Card className="border-slate-200/80 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Lịch học theo lớp</CardTitle>
                  <CardDescription>
                    Danh sách schedule của lớp đang chọn.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedClassroomId ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                      Chọn lớp học ở form trên để xem lịch học.
                    </div>
                  ) : isSchedulesLoading || isSchedulesFetching ? (
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
                      Đang tải danh sách lịch học...
                    </div>
                  ) : schedules.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                      Chưa có lịch học cho lớp này.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ngày học</TableHead>
                          <TableHead>Giờ</TableHead>
                          <TableHead>Hình thức</TableHead>
                          <TableHead>Địa điểm / Link</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {schedules.map((schedule) => (
                          <TableRow key={schedule.id}>
                            <TableCell className="font-medium text-slate-900">
                              {schedule.dayOfWeek}
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {schedule.startTime} - {schedule.endTime}
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {schedule.studyMode}
                            </TableCell>
                            <TableCell className="text-slate-600">
                              <div className="space-y-1">
                                <div>{schedule.location || "-"}</div>
                                {schedule.meetingUrl ? (
                                  <a
                                    className="block truncate text-slate-900 underline-offset-4 hover:underline"
                                    href={schedule.meetingUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {schedule.meetingUrl}
                                  </a>
                                ) : null}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
          </Card>

          <div className="space-y-6">
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
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-slate-600">
                    Mô tả lớp học
                  </label>
                  <textarea
                    className="min-h-30 w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300/70 focus-visible:border-slate-300 focus-visible:outline-none"
                    placeholder="Mô tả mục tiêu, đặc điểm, chương trình lớp học..."
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-slate-600">
                      Ngày bắt đầu
                    </label>
                    <Input
                      type="date"
                      className="h-10 border-slate-200/70 bg-white text-slate-900"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-slate-600">
                      Ngày kết thúc
                    </label>
                    <Input
                      type="date"
                      className="h-10 border-slate-200/70 bg-white text-slate-900"
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                    />
                  </div>
                </div>
                {error?.response?.data?.message ? (
                  <p className="text-xs text-rose-600">
                    {error.response.data.message}
                  </p>
                ) : null}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  className="h-10 w-full cursor-pointer rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                  onClick={handleCreate}
                  disabled={isPending || !name.trim() || !startDate || !endDate}
                >
                  {isPending ? "Đang lưu..." : "Lưu lớp học"}
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Tạo classSchedule cho lớp</CardTitle>
                <CardDescription>
                  Nhập lịch học theo lớp, bao gồm ngày, giờ, hình thức và liên kết học.
                </CardDescription>
                {selectedClass ? (
                  <p className="text-xs font-medium text-slate-500">
                    Đang xem lịch của: {selectedClass.name}
                    {selectedClass.code ? ` (${selectedClass.code})` : ""}
                  </p>
                ) : null}
              </CardHeader>
              <form onSubmit={handleScheduleSubmit(onSubmitSchedule)}>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-slate-600">
                      Lớp học
                    </label>
                    <Controller
                      control={control}
                      name="classroomId"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="h-10 cursor-pointer border-slate-200/70 bg-white text-slate-900">
                            <SelectValue placeholder="Chọn lớp học" />
                          </SelectTrigger>
                          <SelectContent>
                            {scheduleClasses.length === 0 ? (
                              <SelectItem value="__empty__" disabled>
                                Chưa có lớp học
                              </SelectItem>
                            ) : (
                              scheduleClasses.map((item) => (
                                <SelectItem className="cursor-pointer" key={item.id} value={item.id}>
                                  {item.name} {item.code ? `(${item.code})` : ""}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-slate-600">
                      Ngày học
                    </label>
                    <Controller
                      control={control}
                      name="dayOfWeek"
                      render={({ field }) => (
                        <select
                          className="h-10 rounded-lg border border-slate-200/70 bg-white px-3 text-sm text-slate-900 outline-none"
                          value={field.value}
                          onChange={field.onChange}
                        >
                          {dayOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <label className="text-xs font-medium text-slate-600">
                        Giờ bắt đầu
                      </label>
                      <Input
                        type="time"
                        step={1}
                        className="h-10 border-slate-200/70 bg-white text-slate-900"
                        {...register("startTime")}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-medium text-slate-600">
                        Giờ kết thúc
                      </label>
                      <Input
                        type="time"
                        step={1}
                        className="h-10 border-slate-200/70 bg-white text-slate-900"
                        {...register("endTime")}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-slate-600">
                      Hình thức học
                    </label>
                    <Controller
                      control={control}
                      name="studyMode"
                      render={({ field }) => (
                        <select
                          className="h-10 rounded-lg border border-slate-200/70 bg-white px-3 text-sm text-slate-900 outline-none"
                          value={field.value}
                          onChange={field.onChange}
                        >
                          {studyModeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-slate-600">
                      Địa điểm
                    </label>
                    <Input
                      placeholder="Phòng học 201 hoặc để trống nếu online"
                      className="h-10 border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70"
                      {...register("location")}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-slate-600">
                      Link học online
                    </label>
                    <Input
                      placeholder="https://meet.google.com/..."
                      className="h-10 border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70"
                      {...register("meetingUrl")}
                    />
                  </div>

                  {scheduleError?.response?.data?.message ? (
                    <p className="text-xs text-rose-600">
                      {scheduleError.response.data.message}
                    </p>
                  ) : null}
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button
                    type="submit"
                    className="h-10 cursor-pointer w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                    disabled={isSchedulePending || isScheduleSubmitting}
                  >
                    {isSchedulePending ? "Đang lưu lịch..." : "Lưu classSchedule"}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            
          </div>
        </div>  
      </div>
    </div>
  )
}

export default ClassesManagement
