"use server";

export interface ReportData {
  ownerName: string;
  phoneNumber: string;
  licensePlate: string;
  faultDescription: string;
  location?: { latitude: number; longitude: number };
  photos: string[]; // Base64 encoded images
  ownerSignature: string | null; // Base64 encoded signature
  technicianSignature: string | null; // Base64 encoded signature
}

export async function submitReportAction(data: ReportData): Promise<{ success: boolean; message: string; reportId?: string }> {
  console.log("Submitting report via Server Action:", {
    ...data,
    photos: data.photos.map(p => p.substring(0,30) + "..."), // Log snippet
    ownerSignature: data.ownerSignature ? data.ownerSignature.substring(0,30) + "..." : null,
    technicianSignature: data.technicianSignature ? data.technicianSignature.substring(0,30) + "..." : null,
  });

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate potential random failure
  if (Math.random() < 0.1) {
    console.error("Simulated report submission failure.");
    return { success: false, message: "Failed to submit report due to a simulated network error. Please try again." };
  }
  
  const reportId = `REP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  console.log("Report submitted successfully. Report ID:", reportId);
  return { success: true, message: "Report submitted successfully!", reportId };
}
