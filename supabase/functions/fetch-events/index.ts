import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EventData {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime?: string;
  source: string;
  externalId: string;
  imageUrl?: string;
  category: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { location = "Basel, Switzerland", radius = 50 } = await req.json()
    
    console.log(`Fetching events for location: ${location}, radius: ${radius}km`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const events: EventData[] = []

    // Mock event data for demonstration
    // In production, you would integrate with actual APIs like:
    // - Facebook Events API (requires app review)
    // - Eventbrite API
    // - Meetup API
    // - Local event platforms

    const mockEvents = [
      {
        title: "Basel Art Museum Night Tour",
        description: "Special evening exhibition showcasing contemporary Swiss artists with guided tours and wine tasting.",
        location: "Basel Art Museum, Basel",
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        source: "facebook_events",
        externalId: "fb_event_1",
        imageUrl: null,
        category: "indoor"
      },
      {
        title: "Rhine Valley Hiking Meetup",
        description: "Weekly hiking group exploring the scenic trails along the Rhine River. All fitness levels welcome!",
        location: "Rheinfelden, Germany",
        startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        source: "meetup",
        externalId: "meetup_1",
        imageUrl: null,
        category: "outdoor"
      },
      {
        title: "Lörrach Weekend Market",
        description: "Traditional weekend market featuring local produce, crafts, and live music performances.",
        location: "Lörrach Market Square, Lörrach",
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
        source: "local_events",
        externalId: "local_1",
        imageUrl: null,
        category: "outdoor"
      }
    ]

    // Insert events into activities table
    for (const event of mockEvents) {
      const { data, error } = await supabase
        .from('activities')
        .upsert({
          title: event.title,
          description: event.description,
          category: event.category,
          location: event.location,
          source: event.source,
          external_id: event.externalId,
          image_url: event.imageUrl,
          price_range: 'free',
          is_indoor: event.category === 'indoor',
          is_outdoor: event.category === 'outdoor',
          duration_minutes: 180 // Default 3 hours
        }, {
          onConflict: 'external_id,source'
        })

      if (error) {
        console.error('Error inserting event:', error)
      } else {
        console.log('Event inserted:', event.title)
        events.push(event)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        events,
        count: events.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in fetch-events function:', error)
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