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
  console.log("Submitting report to Node.js API:", {
    ...data,
    photos: data.photos.map(p => p.substring(0, 30) + "..."),
    ownerSignature: data.ownerSignature ? data.ownerSignature.substring(0, 30) + "..." : null,
    technicianSignature: data.technicianSignature ? data.technicianSignature.substring(0, 30) + "..." : null,
  });

  try {
    const response = await fetch("https://faultapi.onrender.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("API error:", result.error || result);
      return { success: false, message: result.error || "Error submitting report" };
    }

    console.log("Report submitted successfully. Report ID:", result.reportId);
    return { success: true, message: "Report submitted successfully!", reportId: result.reportId };
  } catch (error) {
    console.error("Submission error:", error);
    return { success: false, message: "Network or unexpected error occurred." };
  }
}
