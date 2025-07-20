import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { location = "Basel, Switzerland", radius = 50 } = await req.json()
    
    console.log(`Fetching places for location: ${location}, radius: ${radius}km`)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Mock Google Places data - in production you would use Google Places API
    const mockPlaces = [
      {
        title: "Rhine Riverside Relaxation",
        description: "Peaceful spots along the Rhine River perfect for picnics, reading, or simply enjoying the water views. Free parking available.",
        location: "Rhine River Banks, Basel",
        category: "outdoor",
        price_range: "free",
        rating: 4.6,
        type: "nature_spot"
      },
      {
        title: "Isteiner Schwellen Natural Pool",
        description: "Natural swimming area in the Rhine with shallow pools perfect for families. Beautiful limestone formations create natural pools.",
        location: "Istein, Germany",
        category: "outdoor", 
        price_range: "free",
        rating: 4.8,
        type: "swimming"
      },
      {
        title: "Grenzach BBQ Area",
        description: "Public barbecue facilities with picnic tables overlooking the Rhine. Bring your own charcoal and enjoy riverside grilling.",
        location: "Grenzach-Wyhlen Riverside",
        category: "outdoor",
        price_range: "free",
        rating: 4.4,
        type: "bbq_area"
      },
      {
        title: "Kannenfeldpark Public BBQ",
        description: "Urban park with designated barbecue areas, playgrounds, and open spaces. Perfect for family gatherings in the city.",
        location: "Kannenfeldpark, Basel",
        category: "outdoor",
        price_range: "free", 
        rating: 4.3,
        type: "bbq_area"
      },
      {
        title: "Café Frühling",
        description: "Newly opened specialty coffee shop focusing on locally roasted beans and homemade pastries. Cozy atmosphere with outdoor seating.",
        location: "Lörrach City Center",
        category: "indoor",
        price_range: "budget",
        rating: 4.5,
        type: "cafe",
        isNew: true
      },
      {
        title: "Bistro Rheinblick",
        description: "Contemporary restaurant with Rhine views, featuring modern European cuisine and local wines. Opened 2 months ago.",
        location: "Rheinfelden Riverside",
        category: "indoor",
        price_range: "premium",
        rating: 4.7,
        type: "restaurant",
        isNew: true
      },
      {
        title: "Craft Corner Basel",
        description: "Artisan shop specializing in local crafts, handmade jewelry, and sustainable products. Supporting regional artists.",
        location: "Basel Old Town",
        category: "indoor",
        price_range: "budget",
        rating: 4.6,
        type: "shop",
        isNew: true
      }
    ]

    const activities = []

    for (const place of mockPlaces) {
      const { data, error } = await supabase
        .from('activities')
        .upsert({
          title: place.title,
          description: place.description,
          category: place.category,
          location: place.location,
          source: place.isNew ? 'google_places_new' : 'google_places',
          external_id: `places_${place.type}_${place.title.replace(/\s+/g, '_').toLowerCase()}`,
          price_range: place.price_range,
          rating: place.rating,
          is_indoor: place.category === 'indoor',
          is_outdoor: place.category === 'outdoor',
          duration_minutes: place.type === 'restaurant' ? 120 : place.type === 'cafe' ? 60 : 180
        }, {
          onConflict: 'external_id,source'
        })

      if (error) {
        console.error('Error inserting place:', error)
      } else {
        console.log('Place inserted:', place.title)
        activities.push(place)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        activities,
        count: activities.length,
        source: 'google_places'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in fetch-places function:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})