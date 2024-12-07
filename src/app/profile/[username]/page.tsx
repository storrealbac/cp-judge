"use client"
import { use } from "react"
import { useSession } from "next-auth/react"
import { api } from "~/trpc/react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Progress } from "~/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"

import ProfileCard from "~/components/profile/profilecard"

export default function ProfilePage({ params }: {
  params: Promise<{ username: string }> 
}) {

  const { username } = use(params);
  const { data: session } = useSession()

  const { data: profile, isLoading, error } = api.profile.get.useQuery({
    username: username ?? ""
  });

  const { data: followers } = api.profile.getLastFollowers.useQuery({
    username: username ?? ""
  });

  const { data: following } = api.profile.getLastFollowings.useQuery({
    username: username ?? ""
  });

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  if (!profile) {
    return <div>No profile found</div>
  }

  const isCurrentUser = session?.user.username === profile.username;

  return (
    <div className="container py-10 m-auto">
      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <ProfileCard profile={profile} />
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
              <div className="flex items-center justify-between">
                <CardTitle>Following</CardTitle>
                <Badge variant="secondary">{(following ?? []).length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {following && following.map((follow) => (
                  <div key={follow.id} className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={follow.image ?? "./does-not-exist.svg"} alt={follow.name ?? ""} />
                      <AvatarFallback>{follow.name?.[0] ?? "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{follow.name}</p>
                      <p className="text-sm text-muted-foreground">{follow.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Followers</CardTitle>
                <Badge variant="secondary">{(followers ?? []).length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {followers && followers.map((follow) => (
                  <div key={follow.id} className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={follow.image ?? "/placeholder.svg"} alt={follow.name ?? ""} />
                      <AvatarFallback>{follow.name?.[0] ?? "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{follow.name}</p>
                      <p className="text-sm text-muted-foreground">{follow.email}</p>
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