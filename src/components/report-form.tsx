"use client";

import type { ChangeEvent } from 'react';
import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import SignaturePad from '@/components/signature-pad';
import { submitReportAction, type ReportData } from '@/app/actions';
import { User, Phone, SquareAsterisk, MessageSquare, MapPin, Camera, Trash2, Send, Zap, Loader2, UploadCloud } from 'lucide-react';
import Image from 'next/image';

const reportFormSchema = z.object({
  ownerName: z.string().min(2, { message: "Owner name must be at least 2 characters." }),
  phoneNumber: z.string().regex(/^(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?[\d\s-]{7,15}$/, { message: "Invalid phone number format." }),
  licensePlate: z.string().min(3, { message: "License plate must be at least 3 characters." }).max(10),
  faultDescription: z.string().min(10, { message: "Fault description must be at least 10 characters." }),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface PhotoPreview {
  file: File;
  url: string;
}

const ReportForm: React.FC = () => {
  const { toast } = useToast();
  const [ownerSignature, setOwnerSignature] = useState<string | null>(null);
  const [technicianSignature, setTechnicianSignature] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isFetchingAISuggestion, setIsFetchingAISuggestion] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
  });

  const faultDescriptionValue = watch("faultDescription");

  useEffect(() => {
    // Clean up Object URLs
    return () => {
      photos.forEach(photo => URL.revokeObjectURL(photo.url));
    };
  }, [photos]);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const newPhotoPreviews = newFiles.map(file => ({
        file,
        url: URL.createObjectURL(file),
      }));
      setPhotos(prevPhotos => [...prevPhotos, ...newPhotoPreviews].slice(0, 5)); // Limit to 5 photos
       if (prevPhotos.length + newFiles.length > 5) {
        toast({
          title: "Photo Limit Reached",
          description: "You can upload a maximum of 5 photos.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prevPhotos => {
      const photoToRemove = prevPhotos[index];
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.url);
      }
      return prevPhotos.filter((_, i) => i !== index);
    });
  };

  const handleCaptureLocation = () => {
    setIsFetchingLocation(true);
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsFetchingLocation(false);
          toast({ title: "Location Captured", description: `Lat: ${position.coords.latitude.toFixed(4)}, Lon: ${position.coords.longitude.toFixed(4)}` });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(`Error: ${error.message}`);
          setIsFetchingLocation(false);
          toast({ title: "Location Error", description: error.message, variant: "destructive" });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setIsFetchingLocation(false);
      toast({ title: "Location Error", description: "Geolocation not supported.", variant: "destructive" });
    }
  };

  const fetchAISuggestion = async (): Promise<string> => {
    setIsFetchingAISuggestion(true);
    // Simulate API call to Genkit flow
    await new Promise(resolve => setTimeout(resolve, 1200));
    const suggestions = [
      "Loud clunking noise from front suspension when going over bumps. Possible worn strut mounts or ball joints.",
      "Engine misfires and rough idling. Check spark plugs, ignition coils, and fuel injectors.",
      "AC blows warm air. Potential refrigerant leak or compressor issue.",
      "Battery drains quickly overnight. Suspect parasitic draw or failing alternator.",
      "Check engine light is on. Fault code P0420: Catalyst System Efficiency Below Threshold.",
    ];
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setIsFetchingAISuggestion(false);
    return randomSuggestion;
  };

  const handleAISuggestion = async () => {
    const suggestion = await fetchAISuggestion();
    setValue("faultDescription", suggestion);
    toast({ title: "AI Suggestion", description: "Fault description populated." });
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const onSubmit: SubmitHandler<ReportFormValues> = async (data) => {
    setIsSubmitting(true);

    if (!ownerSignature) {
      toast({ title: "Missing Signature", description: "Owner signature is required.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    if (!technicianSignature) {
      toast({ title: "Missing Signature", description: "Technician signature is required.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    let photoBase64s: string[] = [];
    try {
      photoBase64s = await Promise.all(photos.map(p => convertFileToBase64(p.file)));
    } catch (error) {
      console.error("Error converting photos to Base64:", error);
      toast({ title: "Photo Error", description: "Could not process photos.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const reportData: ReportData = {
      ...data,
      location: location || undefined,
      photos: photoBase64s,
      ownerSignature,
      technicianSignature,
    };

    try {
      const result = await submitReportAction(reportData);
      if (result.success) {
        toast({ title: "Report Submitted", description: `${result.message} (ID: ${result.reportId})`, variant: "default" });
        // Optionally reset form here
      } else {
        toast({ title: "Submission Failed", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl"><User className="mr-2 h-6 w-6 text-primary" />Owner Information</CardTitle>
          <CardDescription>Enter the vehicle owner's details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ownerName">Owner Name</Label>
            <Input id="ownerName" {...register("ownerName")} placeholder="e.g., John Doe" aria-invalid={errors.ownerName ? "true" : "false"} />
            {errors.ownerName && <p className="text-sm text-destructive mt-1">{errors.ownerName.message}</p>}
          </div>
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" type="tel" {...register("phoneNumber")} placeholder="e.g., (555) 123-4567" aria-invalid={errors.phoneNumber ? "true" : "false"} />
            {errors.phoneNumber && <p className="text-sm text-destructive mt-1">{errors.phoneNumber.message}</p>}
          </div>
          <div>
            <Label htmlFor="licensePlate">License Plate</Label>
            <Input id="licensePlate" {...register("licensePlate")} placeholder="e.g., ABC-123" aria-invalid={errors.licensePlate ? "true" : "false"} />
            {errors.licensePlate && <p className="text-sm text-destructive mt-1">{errors.licensePlate.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl"><MessageSquare className="mr-2 h-6 w-6 text-primary" />Fault Description</CardTitle>
          <CardDescription>Provide a detailed description of the vehicle's fault.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="faultDescription">Description</Label>
            <Textarea
              id="faultDescription"
              {...register("faultDescription")}
              rows={5}
              placeholder="Describe the issue, symptoms, and when it occurs..."
              aria-invalid={errors.faultDescription ? "true" : "false"}
              className="min-h-[120px]"
            />
            {errors.faultDescription && <p className="text-sm text-destructive mt-1">{errors.faultDescription.message}</p>}
          </div>
          <Button type="button" variant="outline" onClick={handleAISuggestion} disabled={isFetchingAISuggestion || faultDescriptionValue?.length > 0}>
            {isFetchingAISuggestion ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            Suggest Description
          </Button>
           {faultDescriptionValue?.length > 0 && <p className="text-xs text-muted-foreground">Clear current description to enable AI suggestion.</p>}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl"><MapPin className="mr-2 h-6 w-6 text-primary" />Location & Photos</CardTitle>
          <CardDescription>Capture current GPS location and photos of the vehicle/damage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>GPS Location</Label>
            <div className="flex items-center space-x-3 mt-1">
              <Button type="button" variant="outline" onClick={handleCaptureLocation} disabled={isFetchingLocation}>
                {isFetchingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                Capture Location
              </Button>
              {location && <p className="text-sm text-green-600">Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}</p>}
            </div>
            {locationError && <p className="text-sm text-destructive mt-1">{locationError}</p>}
          </div>
          <Separator />
          <div>
            <Label htmlFor="photos">Photos (max 5)</Label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-input hover:border-primary transition-colors">
                <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="flex text-sm text-muted-foreground">
                        <label
                            htmlFor="photos"
                            className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring"
                        >
                            <span>Upload files</span>
                            <Input id="photos" type="file" className="sr-only" accept="image/*" multiple onChange={handlePhotoChange} disabled={photos.length >= 5} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB each</p>
                </div>
            </div>

            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group aspect-square">
                    <Image src={photo.url} alt={`Preview ${index + 1}`} layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="vehicle damage" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemovePhoto(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Remove photo</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl"><User className="mr-2 h-6 w-6 text-primary" />Signatures</CardTitle>
          <CardDescription>Collect signatures from the owner and technician.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="block text-center mb-2 font-medium">Owner Signature</Label>
              <SignaturePad onSignatureChange={setOwnerSignature} />
              {!ownerSignature && handleSubmitCount > 0 && <p className="text-sm text-destructive mt-1 text-center">Owner signature is required.</p>}
            </div>
            <div>
              <Label className="block text-center mb-2 font-medium">Technician Signature</Label>
              <SignaturePad onSignatureChange={setTechnicianSignature} />
              {!technicianSignature && handleSubmitCount > 0 && <p className="text-sm text-destructive mt-1 text-center">Technician signature is required.</p>}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 text-base" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
        Send Report
      </Button>
    </form>
  );
};

// Dummy variable to track submit attempts for showing signature errors
let handleSubmitCount = 0;
const originalHandleSubmit = ReportForm.prototype ? ReportForm.prototype.handleSubmit : null;
if (typeof originalHandleSubmit === 'function') {
    ReportForm.prototype.handleSubmit = function(...args: any[]) {
        handleSubmitCount++;
        return originalHandleSubmit.apply(this, args);
    } as any;
} else {
    // For environments where prototype might not be available as expected (e.g. HMR dev)
    // This is a simplified approach, proper context handling would be more robust.
    const originalOnSubmit = ReportForm; // Placeholder, needs actual component instance or static method
}


export default ReportForm;
