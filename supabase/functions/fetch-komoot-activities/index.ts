import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface KomootActivity {
  title: string;
  description: string;
  location: string;
  distance: number;
  duration: number;
  difficulty: number;
  type: 'walking' | 'hiking' | 'cycling';
  coordinates?: { lat: number; lng: number };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { location = "Basel, Switzerland", radius = 50 } = await req.json()
    
    console.log(`Fetching Komoot activities for location: ${location}, radius: ${radius}km`)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Mock Komoot data - in production you would use the Komoot API
    const mockKomootActivities: KomootActivity[] = [
      {
        title: "Rhine Trail Easy Walk",
        description: "Gentle 3km riverside walk perfect for families. Enjoy stunning views of the Rhine and stop at traditional cafes along the way.",
        location: "Rheinfelden to Bad Säckingen",
        distance: 3.2,
        duration: 45,
        difficulty: 1,
        type: 'walking',
        coordinates: { lat: 47.5536, lng: 7.7929 }
      },
      {
        title: "Black Forest Discovery Hike",
        description: "Moderate 7km forest trail with waterfalls and panoramic viewpoints. Experience the beauty of the Schwarzwald region.",
        location: "Todtnau Black Forest Trail",
        distance: 7.1,
        duration: 150,
        difficulty: 3,
        type: 'hiking',
        coordinates: { lat: 47.8402, lng: 7.9437 }
      },
      {
        title: "Basel City Bike Tour",
        description: "Urban cycling adventure through Basel's historic districts. 12km route covering major attractions and hidden gems.",
        location: "Basel City Center Circuit",
        distance: 12.5,
        duration: 90,
        difficulty: 2,
        type: 'cycling',
        coordinates: { lat: 47.5596, lng: 7.5886 }
      },
      {
        title: "Vosges Mountain Hike",
        description: "Challenging 9km mountain trail with elevation gain. Spectacular views over the Rhine Valley and Swiss Alps.",
        location: "Grand Ballon, Vosges",
        distance: 8.7,
        duration: 180,
        difficulty: 4,
        type: 'hiking',
        coordinates: { lat: 47.9163, lng: 7.1431 }
      },
      {
        title: "Rhine Valley Cycling Route",
        description: "Scenic 18km bike ride through vineyards and traditional villages. Mostly flat terrain with gentle hills.",
        location: "Lörrach to Weil am Rhein",
        distance: 17.8,
        duration: 120,
        difficulty: 2,
        type: 'cycling',
        coordinates: { lat: 47.6144, lng: 7.6658 }
      }
    ]

    const activities = []

    for (const activity of mockKomootActivities) {
      const categoryMap = {
        walking: 'outdoor',
        hiking: 'outdoor', 
        cycling: 'outdoor'
      }

      const priceMap = {
        walking: 'free',
        hiking: 'free',
        cycling: 'free'
      }

      const { data, error } = await supabase
        .from('activities')
        .upsert({
          title: activity.title,
          description: activity.description,
          category: categoryMap[activity.type],
          location: activity.location,
          source: 'komoot',
          external_id: `komoot_${activity.type}_${activity.title.replace(/\s+/g, '_').toLowerCase()}`,
          price_range: priceMap[activity.type],
          is_indoor: false,
          is_outdoor: true,
          duration_minutes: activity.duration,
          difficulty_level: activity.difficulty,
          coordinates: activity.coordinates ? `(${activity.coordinates.lat},${activity.coordinates.lng})` : null
        }, {
          onConflict: 'external_id,source'
        })

      if (error) {
        console.error('Error inserting Komoot activity:', error)
      } else {
        console.log('Komoot activity inserted:', activity.title)
        activities.push(activity)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        activities,
        count: activities.length,
        source: 'komoot'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in fetch-komoot-activities function:', error)
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