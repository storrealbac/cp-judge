import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

import Testcase from "~/components/testcase";
import Latex from "react-latex-next";

import CodeEditor from "~/components/codeeditor";


export default function ProblemPage() {

  const problem_statement = `
Kostya has a text $s$ consisting of $n$ words made up of Latin alphabet letters. He also has two strips on which he must write the text. The first strip can hold m characters, while the second can hold as many as needed.
Kostya must choose a number $x$ and write the first $x$ words from s on the first strip, while all the remaining words are written on the second strip. To save space, the words are written without gaps, but each word must be entirely on one strip.
Since space on the second strip is very valuable, Kostya asks you to choose the maximum possible number $x$ such that all words $s_1, s_2, ..., s_x$ fit on the first strip of length $m$.
`;

  const input = `
The first line contains an integer $t$ $(1 \\leq t \\leq 1000)$ — the number of test cases.

The first line of each test case contains two integers $n$ and $m$ $(1 \\leq n \\leq 50; 1 \\leq m \\leq 500)$ — the number of words in the list and the maximum number of characters that can be on the first strip.

The next $n$ lines contain one word $s_i$ of lowercase Latin letters, where the length of $s_i$ does not exceed $10$.
`;

  const output = `For each test case, output the maximum number of words $x$ such that the first $x$ words have a total length of no more than $m$.`


  const inputValue = `5
3 1
a
b
c
2 9
alpha
beta
4 12
hello
world
and
codeforces
3 2
ab
c
d
1 2
abc
ab
a`

  const outputValue = `1
2
2
1
0`

  return (
    <div className="container mx-auto p-4 lg:p-6">
      {/* Main grid layout - stack on mobile, grid on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Problem statement section - full width on mobile, 3/4 on desktop */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-center"><Latex>Two Sum</Latex></CardTitle>
              <CardDescription className="text-center">Difficulty: Easy</CardDescription>
            </CardHeader>

            <CardContent>
              {problem_statement.split("\n").map((line, index) => (
                <p key={index} className="my-3"><Latex>{line}</Latex></p>
              ))}
              <Latex>{problem_statement}</Latex>
            </CardContent>

            <CardContent>
              <h1 className="font-bold">Input</h1>
              {input.split("\n").map((line, index) => (
                <p key={index} className="my-3"><Latex>{line}</Latex></p>
              ))}
            </CardContent>

            <CardContent>
              <h1 className="font-bold">Output</h1>
              {output.split("\n").map((line, index) => (
                <p key={index} className="my-3"><Latex>{line}</Latex></p>
              ))}
            </CardContent>
          </Card>

          <Testcase input={inputValue} output={outputValue} />

          <Card>
            <CardHeader>
              <CardTitle>Submit Solution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                <CodeEditor />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions panel - full width on mobile, 1/4 on desktop */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">No submissions yet</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}