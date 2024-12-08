"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationEllipsis,
  PaginationPrevious,
} from "~/components/ui/pagination"

interface ProblemsPaginationProps {
  totalProblems: number
}

const getPageRange = (current: number, total: number) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 3) return [1, 2, 3, 4, '...', total];
  if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];

  return [1, '...', current - 1, current, current + 1, '...', total];
};

export default function ProblemsPagination({ totalProblems }: ProblemsPaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const page = Number(searchParams.get("page")) || 1
  const perPage = Number(searchParams.get("perPage")) || 10

  const totalPages = Math.ceil(totalProblems / perPage)

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={createPageURL(page - 1)}
            onClick={(e) => {
              e.preventDefault()
              if (page > 1) router.push(createPageURL(page - 1))
            }}
          />
        </PaginationItem>
        {getPageRange(page, totalPages).map((pageNum, i) => (
          <PaginationItem key={i}>
            {pageNum === '...' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href={createPageURL(pageNum)}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(createPageURL(pageNum));
                }}
                isActive={page === pageNum}
              >
                {pageNum}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href={createPageURL(page + 1)}
            onClick={(e) => {
              e.preventDefault()
              if (page < totalPages) router.push(createPageURL(page + 1))
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

