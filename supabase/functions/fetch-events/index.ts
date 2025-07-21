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
        title: "Jazz Night at Atlantis Basel",
        description: "Live jazz performances featuring local and international artists in an intimate club setting with craft cocktails.",
        location: "Atlantis Basel, Klosterberg 13, Basel",
        startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        source: "facebook_events",
        externalId: "fb_jazz_1",
        imageUrl: null,
        category: "indoor"
      },
      {
        title: "Summer Music Festival",
        description: "Three-day outdoor music festival featuring rock, pop, and electronic artists from across Europe.",
        location: "Dreiländerpark, Weil am Rhein, Germany",
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000).toISOString(),
        source: "eventbrite",
        externalId: "eb_festival_1",
        imageUrl: null,
        category: "outdoor"
      },
      {
        title: "Acoustic Sessions at Café Frühling",
        description: "Intimate acoustic performances by local singer-songwriters while enjoying specialty coffee and pastries.",
        location: "Café Frühling, Lörrach",
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        source: "local_events",
        externalId: "local_acoustic_1",
        imageUrl: null,
        category: "indoor"
      },
      {
        title: "Rhine Concert Series",
        description: "Classical music concert performed by the Basel Symphony Orchestra with stunning Rhine River views.",
        location: "Rheinufer Basel, Basel",
        startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000).toISOString(),
        source: "ticketmaster",
        externalId: "tm_concert_1",
        imageUrl: null,
        category: "outdoor"
      },
      {
        title: "Electronic Night at Nordstern",
        description: "Underground electronic music event with DJs spinning techno, house, and ambient tracks until dawn.",
        location: "Nordstern, Voltastrasse 30, Basel",
        startTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
        source: "facebook_events",
        externalId: "fb_electronic_1",
        imageUrl: null,
        category: "indoor"
      },
      {
        title: "Live Music at Bistro Rheinblick",
        description: "Weekly live music dinner featuring local bands playing blues, folk, and indie rock while you dine.",
        location: "Bistro Rheinblick, Grenzach-Wyhlen, Germany",
        startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        source: "local_events",
        externalId: "local_bistro_1",
        imageUrl: null,
        category: "indoor"
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