import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Badge } from "~/components/ui/badge"

const problems = [
  { id: 1, name: "Weird Algorithm", type: "Introductory Problems", solved: 157910 },
  { id: 2, name: "Missing Number", type: "Introductory Problems", solved: 145288 },
  { id: 3, name: "Repetitions", type: "Introductory Problems", solved: 124665 },
  { id: 4, name: "Increasing Array", type: "Introductory Problems", solved: 117708 },
  { id: 5, name: "Permutations", type: "Introductory Problems", solved: 108665 },
  { id: 6, name: "Number Spiral", type: "Introductory Problems", solved: 93665 },
  { id: 7, name: "Two Knights", type: "Introductory Problems", solved: 81665 },
  { id: 8, name: "Two Sets", type: "Introductory Problems", solved: 77665 },
  { id: 9, name: "Bit Strings", type: "Introductory Problems", solved: 75665 },
  { id: 10, name: "Trailing Zeros", type: "Introductory Problems", solved: 71665 },
]

export default function ProblemSetPage() {
  return (
    <div className="container m-auto py-10">
      <h1 className="text-3xl font-bold mb-6">CSES Problem Set</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Solved</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {problems.map((problem) => (
            <TableRow key={problem.id}>
              <TableCell className="font-medium">{problem.id}</TableCell>
              <TableCell>
                <Link href={`/problem/${problem.id}`} className="text-blue-500 hover:underline">
                  {problem.name}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{problem.type}</Badge>
              </TableCell>
              <TableCell className="text-right">{problem.solved}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

