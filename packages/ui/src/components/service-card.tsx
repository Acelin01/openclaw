import { Star, Clock } from "lucide-react";
import * as React from "react";
import { cn } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Badge } from "./badge";
import { Card, CardContent, CardFooter, CardHeader } from "./card";

export interface ServiceCardProps {
  id: string;
  title: string;
  coverImageUrl: string;
  providerName: string;
  providerAvatarUrl?: string;
  rating: number;
  reviewCount: number;
  priceAmount: number;
  priceCurrency: string;
  priceUnit?: string;
  deliveryTime?: string;
  category?: string;
  className?: string;
}

export function ServiceCard({
  title,
  coverImageUrl,
  providerName,
  providerAvatarUrl,
  rating,
  reviewCount,
  priceAmount,
  priceCurrency,
  priceUnit,
  deliveryTime,
  category,
  className,
}: ServiceCardProps) {
  const isEmoji = (str: string | null | undefined) => {
    if (!str) return false;
    return /\p{Emoji}/u.test(str) && str.length <= 8;
  };

  return (
    <Card
      className={cn(
        "overflow-hidden hover:shadow-md transition-shadow group h-full flex flex-col",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={coverImageUrl}
          alt={title}
          className="object-cover w-full h-full transition-transform group-hover:scale-105"
        />
        {category && (
          <Badge className="absolute top-2 left-2 bg-black/60 hover:bg-black/70 backdrop-blur-sm border-none text-white">
            {category}
          </Badge>
        )}
      </div>
      <CardHeader className="p-4 pb-2 space-y-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            {providerAvatarUrl ? (
              isEmoji(providerAvatarUrl) ? (
                <div className="flex items-center justify-center w-full h-full text-[10px]">
                  {providerAvatarUrl}
                </div>
              ) : (
                <AvatarImage src={providerAvatarUrl} alt={providerName} />
              )
            ) : null}
            <AvatarFallback>{providerName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-muted-foreground truncate">{providerName}</span>
        </div>
        <h3 className="font-semibold leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
          {title}
        </h3>
      </CardHeader>
      <CardContent className="p-4 py-2 flex-1">
        <div className="flex items-center text-sm mb-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
          <span className="font-medium">{rating}</span>
          <span className="text-muted-foreground ml-1">({reviewCount})</span>
        </div>
        {deliveryTime && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {deliveryTime}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 border-t mt-auto flex items-center justify-between bg-muted/20">
        <div className="text-xs text-muted-foreground">Starting at</div>
        <div className="font-semibold">
          {priceCurrency === "USD" ? "$" : priceCurrency}
          {priceAmount}
          {priceUnit && (
            <span className="text-xs font-normal text-muted-foreground ml-1">{priceUnit}</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
