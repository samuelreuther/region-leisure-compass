import { MapPin, Clock, Users, Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Activity {
  id: string;
  title: string;
  description: string;
  category: "outdoor" | "indoor";
  location: string;
  distance?: number;
  duration: string;
  rating?: number;
  price: string;
  familyFriendly?: boolean;
  weatherDependent?: boolean;
  image?: string;
  tags?: string[];
  votes?: {
    thumbsUp: number;
    thumbsDown: number;
  };
  // Database fields
  source?: string;
  price_range?: string;
  duration_minutes?: number;
  is_indoor?: boolean;
  is_outdoor?: boolean;
  image_url?: string;
}

interface ActivityCardProps {
  activity: Activity;
  onVote?: (activityId: string, type: 'up' | 'down') => void;
}

const ActivityCard = ({ activity, onVote }: ActivityCardProps) => {
  // Map database fields to component fields
  const displayActivity = {
    ...activity,
    image: activity.image_url || activity.image || "/placeholder.svg",
    category: activity.is_indoor ? "indoor" : "outdoor" as "indoor" | "outdoor",
    price: activity.price_range || activity.price || "Free",
    duration: activity.duration_minutes ? `${activity.duration_minutes} min` : activity.duration || "Unknown",
    rating: activity.rating || 0,
    distance: activity.distance || 0,
    tags: activity.tags || [],
    votes: activity.votes || { thumbsUp: 0, thumbsDown: 0 },
    familyFriendly: activity.familyFriendly || false
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:scale-105 group">
      <div className="relative">
        <img 
          src={displayActivity.image} 
          alt={displayActivity.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <Badge variant={displayActivity.category === "outdoor" ? "default" : "secondary"}>
            {displayActivity.category}
          </Badge>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          {displayActivity.familyFriendly && (
            <Badge variant="outline" className="bg-white/90">
              <Users className="h-3 w-3 mr-1" />
              Family
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{displayActivity.title}</h3>
          {displayActivity.rating > 0 && (
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">{displayActivity.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {displayActivity.description}
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{displayActivity.location}{displayActivity.distance > 0 ? ` • ${displayActivity.distance}km away` : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{displayActivity.duration}</span>
          </div>
        </div>
        
        {displayActivity.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {displayActivity.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-4 pb-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <span className="font-semibold text-nature-green">{displayActivity.price}</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-green-100"
                onClick={() => onVote?.(activity.id, 'up')}
              >
                <ThumbsUp className="h-4 w-4 text-green-600" />
              </Button>
              <span className="text-xs text-muted-foreground">{displayActivity.votes.thumbsUp}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-red-100"
                onClick={() => onVote?.(activity.id, 'down')}
              >
                <ThumbsDown className="h-4 w-4 text-red-600" />
              </Button>
              <span className="text-xs text-muted-foreground">{displayActivity.votes.thumbsDown}</span>
            </div>
            <Button variant="nature" size="sm">
              Learn More
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ActivityCard;