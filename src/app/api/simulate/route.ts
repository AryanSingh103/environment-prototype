import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentAge, futureAge, city, scenario, trajectory } = body;

    if (!currentAge || !futureAge || !city || !scenario || !trajectory) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const yearsInFuture = futureAge - currentAge;
    if (yearsInFuture <= 0) {
      return NextResponse.json({ error: 'Future age must be greater than current age' }, { status: 400 });
    }

    const futureYear = new Date().getFullYear() + yearsInFuture;

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      // Dummy response if key is missing
      return NextResponse.json({
        story: `(Add your OpenAI API Key to .env.local!)\n\nFast forward ${yearsInFuture} years to the year ${futureYear}. At age ${futureAge}, living in ${city} feels very different. Because of ${scenario.toLowerCase()}, under the '${trajectory}' trajectory, things have changed significantly. You find yourself adapting daily to the new normal.`
      });
    }

    const prompt = `
You are a creative writer simulating the future impact of environmental changes.
The user is currently ${currentAge} years old, living in ${city}. 
They want to know what their daily life will be like ${yearsInFuture} years from now in the year ${futureYear}, when they are ${futureAge} years old.
They are focusing on the specific scenario: "${scenario}".

The world is currently on the following trajectory: "${trajectory}". 
(Note: 'Cleaner Future' means aggressive climate action was taken. 'Current Path' means +1.5 to 2°C warming with moderate impacts. 'Extreme Reality' means +2.5°C+ warming with worst-case severe impacts).

Write a short, immersive, 3-4 sentence story written in the second person ("You").
Describe a specific, tangible moment in their daily life at age ${futureAge} in the year ${futureYear} in ${city}. 
Focus heavily on the physical environment, health, or lifestyle changes caused by this scenario. 
Make it vivid and relatable. Do not use markdown.
    `.trim();

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!aiRes.ok) {
      const errorData = await aiRes.json();
      throw new Error(errorData.error?.message || 'Failed to call OpenAI');
    }

    const aiData = await aiRes.json();
    const story = aiData.choices[0].message.content.trim();

    return NextResponse.json({ 
      story,
      futureYear 
    });

  } catch (error: any) {
    console.error('Simulate API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate simulation' }, { status: 500 });
  }
}
