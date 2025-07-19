import { MapPin, Clock, Users, Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Activity {
  id: string;
  title: string;
  description: string;
  category: "outdoor" | "indoor";
  location: string;
  distance: number;
  duration: string;
  rating: number;
  price: string;
  familyFriendly: boolean;
  weatherDependent: boolean;
  image: string;
  tags: string[];
}

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:scale-105 group">
      <div className="relative">
        <img 
          src={activity.image} 
          alt={activity.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <Badge variant={activity.category === "outdoor" ? "default" : "secondary"}>
            {activity.category}
          </Badge>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          {activity.familyFriendly && (
            <Badge variant="outline" className="bg-white/90">
              <Users className="h-3 w-3 mr-1" />
              Family
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{activity.title}</h3>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">{activity.rating}</span>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {activity.description}
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{activity.location} • {activity.distance}km away</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{activity.duration}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {activity.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="px-4 pb-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <span className="font-semibold text-nature-green">{activity.price}</span>
          <Button variant="nature" size="sm">
            Learn More
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ActivityCard;