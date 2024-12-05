import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Textarea } from "~/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

export default function ProblemPage() {
  return (
<div className="container mx-auto p-6">
  {/* Main grid layout */}
  <div className="grid grid-cols-4 gap-6">
    {/* Problem statement - 75% width (3 columns) */}
    <div className="col-span-3">
      <Card>
        <CardHeader>
          <CardTitle>Two Sum</CardTitle>
          <CardDescription>Difficulty: Easy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert">
            <p>
              Given an array of integers nums and an integer target, return
              indices of the two numbers such that they add up to target.
            </p>
            <h3>Example 1:</h3>
            <pre>
              Input: nums = [2,7,11,15], target = 9
              Output: [0,1]
              Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
            </pre>
            <h3>Constraints:</h3>
            <ul>
              <li>2 ≤ nums.length ≤ 104</li>
              <li>-109 ≤ nums[i] ≤ 109</li>
              <li>-109 ≤ target ≤ 109</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Submissions panel - 25% width (1 column) */}
    <div className="col-span-1">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add submission history here */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">No submissions yet</p>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Code submission area - full width below */}
    <div className="col-span-4">
      <Card>
        <CardHeader>
          <CardTitle>Submit Solution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Select defaultValue="cpp">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                </SelectContent>
              </Select>
              <Button>Run Tests</Button>
              <Button>Submit</Button>
            </div>
            <Textarea
              className="font-mono min-h-[400px]"
              placeholder="Write your code here..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
  )
}

