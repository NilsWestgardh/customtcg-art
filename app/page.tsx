"use client"
// Hooks
import React, { 
  useState, 
  useEffect, 
  useMemo 
} from "react";
import { useTheme } from "next-themes";
// Utils
import Image from "next/image";
import fetch from "node-fetch";
import clsx from "clsx";
// Components
import Footer from "@/components/footer";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  MdOpenInNew,
  MdDownload,
} from "react-icons/md";
import { FaWandMagicSparkles } from "react-icons/fa6";
import CustomtcgArtLogoBlack from "@/public/customtcg-art-logo-black.svg";
import CustomtcgArtLogoWhite from "@/public/customtcg-art-logo-white.svg";

type TCG = {
  title: string;
  urlTitle: string;
  url: string;
  stylePrompt: string;
}

const disableDefaultPrompt = "I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS."
const tcgs: Record<string, TCG> = {
  nexus: { 
    title: "Nexus", 
    urlTitle: "play.nexus", 
    url: "https://play.nexus", 
    stylePrompt: "Style: Sci-fi, fantasy, cyberpunk. Technique: Airbrush. Color palette: Vivid. Lighting: Dynamic. Blending: Smooth. Details: Sharp. Edges: Bold. Mood: Epic. Perspective: Dramatic." 
  },
  magic: { 
    title: "Magic", 
    urlTitle: "/r/custommagic", 
    url: "https://reddit.com/r/custommagic", 
    stylePrompt: "Style: High fantasy realism. Technique: Goache. Color palette: Vivid. Lighting: Dynamic. Blending: Smooth. Details: Sharp. Edges: Bold. Mood: Epic. Perspective: Dramatic." 
  },
  hearthstone: { 
    title: "Hearthstone",  
    urlTitle: "/r/customhearthstone", 
    url: "https://reddit.com/r/customhearthstone", 
    stylePrompt: "Style: Stylized fantasy. Technique: Airbrush. Color palette: Vivid. Body proportions: Exaggerated. Lighting: Dramatic. Blending: Smooth. Details: Sharp. Edges: Bold, soft. Mood: Whimsical. Perspective: Dramatic." 
  },
  snap: { 
    title: "Marvel Snap", 
    urlTitle: "/r/CustomMarvelSnap", 
    url: "https://reddit.com/r/custommarvelsnap", 
    stylePrompt: "Style: Comic book aesthetic. Color palette: High saturation. Body proportions: Exaggerated. Lighting: Dynamic. Blending: Vivid. Details: Sharp. Edges: Bold linework. Mood: Heroic. Perspective: Dramatic." 
  },
  yugioh: { 
    title: "Yu-gi-oh!", 
    urlTitle: "/r/customyugioh", 
    url: "https://reddit.com/r/customyugioh", 
    stylePrompt: "Style: 90s Anime aesthetic. Color palette: Vivid. Body proportions: Exaggerated. Accents: Metallic. Lighting: High contrast. Blending: Flat. Details: Sharp. Edges: Bold linework. Mood: Exaggerated drama. Perspective: Dramatic. Background: Textured." 
  },
};

const textPlaceholder = [
  "A powerful wizard casting a spell on a stormy beach...",
  "A robot warrior fighting in a futuristic city...",
  "A dragon breathing fire in a medieval castle...",
  "A elf archer aiming at a flying monster in the sky...",
]

const MAX_CHAR_COUNT = 200;
const CHAR_COUNT_WARNING = 150;
export default function CustomTCGArtGenerator(): JSX.Element {
  const [placeholder, setPlaceholder] = useState<string | null>(null);
  const [selectedTCG, setSelectedTCG] = useState<string>("nexus");
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [outputArt, setOutputArt] = useState<string | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const { theme } = useTheme();
  const { title, urlTitle, url } = useMemo(() => tcgs[selectedTCG], [selectedTCG]);
  const charCount = useMemo(() => inputPrompt.length, [inputPrompt]);
  const showCharCount = charCount > CHAR_COUNT_WARNING;

  function handleSelect(value: string) {
    setSelectedTCG(value);
  };

  function handleInput(value: string) {
    if (value.length <= MAX_CHAR_COUNT) {
      setInputPrompt(value);
    }
  };

  async function handleSubmit() {
    setGenerating(true);
    setError(null);
    toast("Generating artwork...")
    
    try {
      if (!inputPrompt) return;
      const constructedPrompt = `${disableDefaultPrompt} Subject matter: ${inputPrompt}. ${tcgs[selectedTCG].stylePrompt}, Pose: Dynamic, Composition: rule of thirds, Focus: Centered.`;
  
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt: constructedPrompt,
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error('Error response from server:', data);
        throw new Error(data.error || 'An unexpected error occurred');
      }
  
      if (!data.imageUrl) {
        console.error('No image URL in response:', data);
        throw new Error('Art URL not found in the response.');
      }
  
      toast("Art generated successfully!")
      setOutputArt(data.imageUrl);
  
    } catch (error) {
      console.error('Error generating artwork:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate artwork. Please try again later.');
      toast.error('Failed to generate artwork. Please try again later.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownload(): Promise<void> {
    if (!outputArt) return;
  
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: outputArt }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to download image');
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob as Blob | MediaSource);
  
      const link = document.createElement('a');
      link.href = url;
      link.download = 'custom-tcg-art.png';
      document.body.appendChild(link);
      link.click();
  
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
  
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download the image. Please try again.');
    }
  }

  useEffect(() => {
    if (placeholder) return;
    setPlaceholder(textPlaceholder[Math.floor(Math.random() * textPlaceholder.length)]);
  }, [placeholder]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col justify-between items-center w-full px-4 sm:px-0 min-h-screen">
      <div className="flex flex-col items-center w-full max-w-[480px] gap-4 py-8">
        <div className="flex justify-between items-center w-full mb-4">
          {mounted ? (
            <Image
              src={theme === 'dark' ? CustomtcgArtLogoWhite : CustomtcgArtLogoBlack}
              alt="CustomTCG.art logo"
              width={163}
              height={24}
            />
          ) : (
            <Skeleton className="w-[163px] h-[24px] rounded-sm" />
          )}
          <ThemeToggle />
        </div>
        {outputArt && (
          <div className="w-full">
            <AspectRatio ratio={4 / 3}>
              {!generating ? (
                <Image 
                  src={outputArt} 
                  alt="Custom TCG Art Generator image" 
                  className="rounded-sm object-cover" 
                  fill
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <Skeleton className="w-full h-full" />
                </div>
              )}
            </AspectRatio>
          </div>
        )}
        {!outputArt && generating && (
          <div className="w-full">
            <AspectRatio ratio={4 / 3}>
              <div className="flex items-center justify-center w-full h-full">
                <Skeleton className="w-full h-full" />
              </div>
            </AspectRatio>
          </div>
        )}
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <p className="text-sm">Make art inspired by:</p>
            {mounted ? (
              <Select disabled={generating} onValueChange={handleSelect} value={selectedTCG}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={title} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tcgs).map(([key, { title }]) => (
                    <SelectItem key={key} value={key}>{title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Skeleton className="w-[140px] h-[40px] rounded-sm" />
            )}
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-slate-500 hover:underline transition-all"
          >
            {urlTitle === "play.nexus" ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <p className="text-xs">{urlTitle}</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    Nexus TCG has player-made cards.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <p className="text-xs">{urlTitle}</p>
            )}
            <MdOpenInNew className="w-4 h-4" />
          </a>
        </div>
        <div className="flex flex-col w-full gap-2">
          {placeholder ? (
            <Textarea
              value={inputPrompt}
              onChange={(e) => handleInput(e.target.value)}
              disabled={generating}
              placeholder={placeholder}
              className="w-full"
            />
          ) : (
            <Skeleton className="w-full h-[80px] rounded-sm" />
          )}
          <div className="flex justify-end w-full mb-2">
            {inputPrompt.length === 0 ? (
              <small className="flex justify-start w-full">
                A prompt describing the art you want to generate.
              </small>
            ) : (
              <small className={clsx("flex justify-start w-full",
                {
                  "opacity-50": generating
                }
              )}>
                A good prompt describes: subject, setting, and often an action.
              </small>
            )}
            {showCharCount && (
              <small className={`text-xs ${charCount === MAX_CHAR_COUNT ? 'text-red-500' : 'text-slate-500'}`}>
                {charCount}/{MAX_CHAR_COUNT}
              </small>
            )}
          </div>
          <div className="flex flex-row justify-between items-center gap-2">
            {inputPrompt.length > 0 && (
              <Button
                onClick={handleSubmit}
                disabled={generating || inputPrompt.length === 0}
                variant="outline"
                size="lg"
                className="flex justify-between w-full px-4"
              >
                Generate art
                <FaWandMagicSparkles className="w-5 h-5" />
              </Button>
            )}
            {outputArt && (
              <Button
                onClick={handleDownload}
                disabled={ generating || !outputArt}
                variant="outline"
                size="lg"
                className="flex justify-between w-full px-4"
              >
                Download art
                <MdDownload className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="w-full max-w-[480px] pb-4">
        <Footer />
      </div>
    </div>
  );
}