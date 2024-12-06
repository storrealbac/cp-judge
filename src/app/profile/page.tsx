"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Progress } from "~/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Pencil, X } from 'lucide-react'

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john@example.com",
    username: "johndoe",
    bio: "Competitive programmer and algorithm enthusiast",
    country: "United States",
    institution: "UTFSM",
  })

  const [isEditing, setIsEditing] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditing(false)
    // Here you would typically send the updated user data to your backend
  }

  const friends = [
    { name: "Alice Smith", username: "alice_smith", avatar: "/placeholder.svg" },
    { name: "Bob Johnson", username: "bob_j", avatar: "/placeholder.svg" },
    { name: "Carol Williams", username: "carol_w", avatar: "/placeholder.svg" },
  ]

  return (
    <div className="container py-10 m-auto">
      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg" alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  {isEditing ? (
                    <Input
                      name="name"
                      value={user.name}
                      onChange={handleInputChange}
                      className="font-bold text-2xl"
                    />
                  ) : (
                    <CardTitle>{user.name}</CardTitle>
                  )}
                  <CardDescription>@{user.username}</CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h3 className="font-semibold">Bio</h3>
                {isEditing ? (
                  <Textarea
                    name="bio"
                    value={user.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{user.bio}</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold">Country</h3>
                {isEditing ? (
                  <Input
                    name="country"
                    value={user.country}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{user.country}</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold">Institution</h3>
                {isEditing ? (
                  <Input
                    name="institution"
                    value={user.institution}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{user.institution}</p>
                )}
              </div>
              {isEditing && (
                <Button type="submit" className="w-full">
                  Save Changes
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Problem solving statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between">
                    <span>Problems solved</span>
                    <span>150 / 500</span>
                  </div>
                  <Progress value={30} className="mt-2" />
                </div>
                <div className="flex justify-between">
                  <span>Total Submissions</span>
                  <span>342</span>
                </div>
                <div className="flex justify-between">
                  <span>Acceptance Rate</span>
                  <span>68%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">100 Problems Solved</Badge>
                <Badge variant="secondary">30 Day Streak</Badge>
                <Badge variant="secondary">Top 10% in Contest</Badge>
                <Badge variant="secondary">Dynamic Programming Master</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>Solved "Two Sum" - 2 hours ago</li>
                <li>Attempted "Longest Palindromic Substring" - 1 day ago</li>
                <li>Participated in Weekly Contest 342 - 3 days ago</li>
                <li>Solved "Merge k Sorted Lists" - 5 days ago</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Friends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {friends.map((friend, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={friend.avatar} alt={friend.name} />
                      <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{friend.name}</p>
                      <p className="text-sm text-muted-foreground">@{friend.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}