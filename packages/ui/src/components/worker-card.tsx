import { Star } from "lucide-react";
import * as React from "react";
import { cn } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Badge } from "./badge";
import { Card, CardContent, CardFooter, CardHeader } from "./card";

export interface WorkerCardProps {
  id: string;
  name: string;
  avatarUrl?: string;
  title: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  hourlyRateCurrency: string;
  hourlyRateUnit: string;
  badges?: string[];
  isOnline?: boolean;
  consultationEnabled?: boolean;
  skills?: string[];
  className?: string;
}

export function WorkerCard({
  name,
  avatarUrl,
  title,
  rating,
  reviewCount,
  hourlyRate,
  hourlyRateCurrency,
  hourlyRateUnit,
  badges = [],
  isOnline = false,
  consultationEnabled = false,
  skills = [],
  className,
}: WorkerCardProps) {
  const isEmoji = (str: string | null | undefined) => {
    if (!str) return false;
    return /\p{Emoji}/u.test(str) && str.length <= 8;
  };

  return (
    <Card className={cn("overflow-hidden hover:shadow-md transition-shadow", className)}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12 border">
              {avatarUrl ? (
                isEmoji(avatarUrl) ? (
                  <div className="flex items-center justify-center w-full h-full text-2xl">
                    {avatarUrl}
                  </div>
                ) : (
                  <AvatarImage src={avatarUrl} alt={name} />
                )
              ) : null}
              <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            {isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold truncate">{name}</h3>
              <div className="flex items-center text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-medium">{rating}</span>
                <span className="text-muted-foreground ml-1">({reviewCount})</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{title}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex flex-wrap gap-2 mb-3">
          {badges.map((badge) => (
            <Badge key={badge} variant="secondary" className="text-xs">
              {badge}
            </Badge>
          ))}
          {consultationEnabled && (
            <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
              可咨询
            </Badge>
          )}
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
            {skills.slice(0, 3).map((skill) => (
              <span key={skill} className="bg-muted px-2 py-0.5 rounded">
                {skill}
              </span>
            ))}
            {skills.length > 3 && <span>+{skills.length - 3}</span>}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between border-t bg-muted/20 mt-auto">
        <div className="text-sm font-medium">
          {hourlyRateCurrency === "USD" ? "$" : hourlyRateCurrency}
          {hourlyRate}
          <span className="text-muted-foreground text-xs font-normal">{hourlyRateUnit}</span>
        </div>
        <div className="text-xs text-muted-foreground">From {name}</div>
      </CardFooter>
    </Card>
  );
}
