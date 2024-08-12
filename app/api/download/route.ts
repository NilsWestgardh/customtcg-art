import { 
  NextRequest, 
  NextResponse 
} from 'next/server';

export const runtime = 'edge';

export async function POST(
  req: NextRequest
) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ 
        error: 'Image URL is required' 
      }, { 
        status: 400 
      });
    }

    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="custom-tcg-art.png"',
      },
    });
  } catch (error) {
    console.error('Error downloading image:', error);
    return NextResponse.json({ 
      error: 'Failed to download image' 
    }, { 
      status: 500 
    });
  }
}