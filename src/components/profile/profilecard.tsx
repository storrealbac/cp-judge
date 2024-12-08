"use client"
import React, { useState } from "react";
import { api } from "~/trpc/react";
import { User } from "@prisma/client";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Mail, MapPin, Building2, X, Save, UserMinus, UserPlus } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

export default function ProfileCard({ profile }: { profile: User }) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    id: profile.id,
    name: profile.name || "",
    email: profile.email || "",
    biography: profile.biography || "",
    country: profile.country || "",
    institution: profile.institution || "",
  });

  const utils = api.useUtils();

  // Get following status
  const { data: followingStatus } = api.profile.getLastFollowers.useQuery(
    { username: profile.username ?? "" },
    {
      enabled: !!profile.username && !!session,
      select: (data) => data.some(follower => follower.id === session?.user.id)
    }
  );

  const updateProfile = api.profile.update.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      void utils.profile.get.invalidate();
      toast.success("Profile updated successfully", {
        description: "Your changes have been saved."
      });
    },
    onError: (error) => {
      toast.error("Failed to update profile", {
        description: error.message || "Please try again later."
      });
    }
  });

  const followUser = api.profile.followUser.useMutation({
    onSuccess: () => {
      void utils.profile.getLastFollowers.invalidate();
      toast.success("Successfully followed user");
    },
    onError: (error) => {
      toast.error("Failed to follow user", {
        description: error.message || "Please try again later."
      });
    }
  });

  const unfollowUser = api.profile.unfollowUser.useMutation({
    onSuccess: () => {
      void utils.profile.getLastFollowers.invalidate();
      toast.success("Successfully unfollowed user");
    },
    onError: (error) => {
      toast.error("Failed to unfollow user", {
        description: error.message || "Please try again later."
      });
    }
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (!editedProfile.name.trim()) {
      toast.error("Name is required");
      return;
    }
    updateProfile.mutate({
      id: editedProfile.id,
      name: editedProfile.name,
      email: editedProfile.email,
      biography: editedProfile.biography,
      country: editedProfile.country,
      institution: editedProfile.institution,
    });
  };

  const handleCancel = () => {
    setEditedProfile({
      id: profile.id,
      name: profile.name || "",
      email: profile.email || "",
      biography: profile.biography || "",
      country: profile.country || "",
      institution: profile.institution || "",
    });
    setIsEditing(false);
  };

  const handleFollowToggle = () => {
    if (followingStatus) {
      unfollowUser.mutate({ targetUserId: profile.id });
    } else {
      followUser.mutate({ targetUserId: profile.id });
    }
  };

  const isCurrentUser = session?.user.username === profile.username;

  const inputStyles = !isEditing ? "border-none bg-transparent p-0 focus-visible:ring-0 disabled:opacity-100" : "";

return (
  <Card className="w-full max-w-2xl mx-auto flex flex-col min-h-[600px]">
    <CardHeader>
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20 ring-2 ring-primary/10">
          <AvatarImage 
            src={profile.image ?? "/placeholder.svg"} 
            alt={profile.name ?? ""} 
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/5">
            {profile.name?.[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <Input
            name="name"
            value={editedProfile.name}
            onChange={handleInputChange}
            className={`font-semibold text-2xl h-auto ${inputStyles}`}
            placeholder="Your name"
            disabled={!isEditing}
            required
          />
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <CardDescription>{profile.email}</CardDescription>
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent className="flex-grow">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-foreground mb-2">About</h3>
          <Textarea
            name="biography"
            value={editedProfile.biography}
            onChange={handleInputChange}
            placeholder=":)"
            className={`min-h-[100px] resize-none ${!isEditing ? 'border-none bg-transparent p-0 focus-visible:ring-0 disabled:opacity-100' : ''}`}
            disabled={!isEditing}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Input
              name="country"
              value={editedProfile.country}
              onChange={handleInputChange}
              placeholder="Your country"
              className={inputStyles}
              disabled={!isEditing}
            />
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Input
              name="institution"
              value={editedProfile.institution}
              onChange={handleInputChange}
              placeholder="Your institution"
              className={inputStyles}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>
    </CardContent>
    <CardFooter className="flex justify-end gap-2 pt-6 mt-auto">
      {!isCurrentUser && session && (
        <Button
          variant={followingStatus ? "destructive" : "outline"}
          size="sm"
          className="h-9 px-3"
          onClick={handleFollowToggle}
        >
          {followingStatus ? (
            <>
              <UserMinus className="h-4 w-4 mr-2" />
              Unfollow
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Follow
            </>
          )}
        </Button>
      )}
      {isCurrentUser && (
        <>
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                size="sm"
                className="h-9 px-3"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                className="h-9 px-3"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              size="sm"
              className="h-9 px-3"
            >
              Edit Profile
            </Button>
          )}
        </>
      )}
    </CardFooter>
  </Card>
);
}