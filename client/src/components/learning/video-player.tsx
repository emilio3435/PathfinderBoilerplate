import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize,
  SkipBack,
  SkipForward,
  ExternalLink
} from "lucide-react";

interface VideoResource {
  id: string;
  title: string;
  url: string;
  duration: string;
  description?: string;
  transcript?: string;
  keyPoints?: string[];
}

interface VideoPlayerProps {
  video: VideoResource;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
}

export default function VideoPlayer({ video, onComplete, onProgress }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      onProgress?.(progress);
      
      // Mark as complete when 90% watched
      if (progress >= 90 && onComplete) {
        onComplete();
      }
    }
  };

  const openInNewTab = () => {
    window.open(video.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="border border-green-200 bg-green-50">
      <CardContent className="p-6">
        {/* Video Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Play className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-charcoal">{video.title}</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Video
                </Badge>
                <span className="text-sm text-gray-600">{video.duration}</span>
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={openInNewTab}
            className="flex items-center space-x-2"
            data-testid="button-open-video"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open in New Tab</span>
          </Button>
        </div>

        {/* Video Description */}
        {video.description && (
          <p className="text-gray-700 mb-4" data-testid="text-video-description">
            {video.description}
          </p>
        )}

        {/* Video Player Placeholder */}
        <div className="bg-gray-900 rounded-lg relative mb-4 aspect-video flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-8 w-8 text-white ml-1" />
            </div>
            <p className="text-white text-lg font-medium mb-2">Video Content</p>
            <p className="text-gray-300 text-sm mb-4">
              This would integrate with your video hosting platform
            </p>
            <Button 
              onClick={openInNewTab}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border border-white border-opacity-30"
              data-testid="button-play-video"
            >
              <Play className="h-4 w-4 mr-2" />
              Watch Video
            </Button>
          </div>
          
          {/* Video Controls Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black bg-opacity-50 rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white hover:bg-opacity-20"
                data-testid="button-toggle-play"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => skip(-10)}
                className="text-white hover:bg-white hover:bg-opacity-20"
                data-testid="button-skip-back"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => skip(10)}
                className="text-white hover:bg-white hover:bg-opacity-20"
                data-testid="button-skip-forward"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white hover:bg-opacity-20"
                data-testid="button-toggle-mute"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white hover:bg-opacity-20"
                data-testid="button-fullscreen"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Key Points */}
        {video.keyPoints && video.keyPoints.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Key Points Covered:</h4>
            <ul className="space-y-1">
              {video.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start space-x-2 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm" data-testid={`text-key-point-${index}`}>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Transcript Toggle */}
        {video.transcript && (
          <div>
            <Button 
              variant="ghost" 
              onClick={() => setShowTranscript(!showTranscript)}
              className="text-green-700 hover:bg-green-100 mb-3"
              data-testid="button-toggle-transcript"
            >
              {showTranscript ? 'Hide' : 'Show'} Transcript
            </Button>
            
            {showTranscript && (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-medium text-gray-900 mb-2">Video Transcript</h4>
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap" data-testid="text-video-transcript">
                  {video.transcript}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}