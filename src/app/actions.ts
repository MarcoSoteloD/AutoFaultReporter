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

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiBaseUrl) {
    console.error("API URL not configured. Please set NEXT_PUBLIC_API_URL in .env.local");
    // Es importante retornar aquí para que el cliente reciba una respuesta clara.
    return { success: false, message: "Error: La URL de la API no está configurada en el servidor." };
  }

  try {
    const response = await fetch(`${apiBaseUrl}/reports`, { // Asumiendo que el endpoint es /reports
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Intenta leer el cuerpo del error como JSON, si falla, usa el statusText
      let errorMessage = `Error submitting report: ${response.status} ${response.statusText}`;
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorResult.error || JSON.stringify(errorResult);
        console.error("API error response body:", errorResult);
      } catch (e) {
        console.error("Could not parse error response as JSON:", e);
      }
      console.error("API error status:", response.status, response.statusText);
      return { success: false, message: errorMessage };
    }

    // Solo intenta parsear como JSON si la respuesta es OK y se espera contenido.
    // Si tu API devuelve un 201 Created sin cuerpo, o un 204 No Content, esto podría necesitar ajuste.
    const result = await response.json(); 
    console.log("Report submitted successfully. API Response:", result);
    return { success: true, message: "Report submitted successfully!", reportId: result.reportId }; // Asume que la API devuelve reportId
  } catch (error) {
    console.error("Submission error:", error);
    return { success: false, message: "Network or unexpected error occurred." };
  }
}
