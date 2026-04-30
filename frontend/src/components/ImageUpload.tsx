import { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageUploadProps {
  file: File | null;
  url: string;
  onFileChange: (file: File | null) => void;
  onUrlChange: (url: string) => void;
}

export function ImageUpload({ file, url, onFileChange, onUrlChange }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (f: File) => {
    if (f && f.type.startsWith("image/")) {
      onFileChange(f);
      onUrlChange("");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onUrlChange(urlInput.trim());
      onFileChange(null);
      setShowUrlInput(false);
      setUrlInput("");
    }
  };

  const clearImage = () => {
    onFileChange(null);
    onUrlChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      setStream(mediaStream);
      setShowCamera(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const photoFile = new File([blob], "photo.jpg", { type: "image/jpeg" });
          onFileChange(photoFile);
          onUrlChange("");
        }
      }, "image/jpeg", 0.8);
      stopCamera();
    }
  };

  useEffect(() => {
    if (showCamera && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [showCamera, stream]);

  const displayUrl = file ? URL.createObjectURL(file) : url;

  if (showCamera) {
    return (
      <div className="space-y-3">
        <div className="relative rounded-lg overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-48 object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <div className="flex gap-2">
          <Button onClick={takePhoto} className="flex-1">
            <Camera className="w-4 h-4 mr-2" />
            Tomar foto
          </Button>
          <Button variant="outline" onClick={stopCamera}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  if (displayUrl) {
    return (
      <div className="space-y-3">
        <div className="relative rounded-lg overflow-hidden border bg-muted">
          <img src={displayUrl} alt="Preview" className="w-full h-48 object-contain bg-muted" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={clearImage}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="flex-1">
            <Upload className="w-4 h-4 mr-2" />
            Cambiar archivo
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowUrlInput(true)} className="flex-1">
            <LinkIcon className="w-4 h-4 mr-2" />
            URL
          </Button>
          <Button variant="outline" size="sm" onClick={startCamera} className="flex-1">
            <Camera className="w-4 h-4 mr-2" />
            Cámara
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showUrlInput ? (
        <form onSubmit={handleUrlSubmit} className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="secondary">Agregar</Button>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowUrlInput(false)} className="w-full">
            Cancelar
          </Button>
        </form>
      ) : (
        <div
          className={`rounded-lg border-2 border-dashed p-6 transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            </div>

            <div className="text-center">
              <p className="text-sm font-medium">
                Arrastra una imagen o selecciona
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG hasta 5MB
              </p>
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir archivo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUrlInput(true)}
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                URL
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={startCamera}
              >
                <Camera className="w-4 h-4 mr-2" />
                Cámara
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
