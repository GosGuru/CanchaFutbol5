"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { getSession } from "@/lib/storage"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const session = useMemo(() => getSession(), [])

  useEffect(() => {
    if (!session) {
      router.push("/login")
    }
  }, [router, session])

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar />
      <main className="flex-1 p-8 md:pl-72">
        {children}
      </main>
    </div>
  )
}
