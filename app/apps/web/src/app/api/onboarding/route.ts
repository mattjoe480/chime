import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {completeOnboarding} from "@/lib/grpc/onboarding";
import {onboarding} from "@/proto/onboarding";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      console.error("No user ID in session:", session);
      return NextResponse.json(
              {error: "User not authenticated"},
              {status: 401}
      );
    }

    const data = await req.json();
    const {userType, ...profileData} = data;

    // Create the appropriate onboarding request based on user type
    let onboardingRequest;
    if (userType === 'patient') {
      // @ts-ignore
      onboardingRequest = new onboarding.OnboardingRequest({
        // @ts-ignore
        user_id: session.user.id,
        patient: new onboarding.PatientOnboardingRequest({
          user_id: session.user.id,
          date_of_birth: profileData.dateOfBirth,
          emergency_contact_name: profileData.emergencyContactName,
          emergency_contact_phone: profileData.emergencyContactPhone,
          medical_conditions: profileData.medicalConditions,
          current_medications: profileData.currentMedications,
        })
      });
    } else {
      // @ts-ignore
      onboardingRequest = new onboarding.OnboardingRequest({
        // @ts-ignore
        user_id: session.user.id,
        doctor: new onboarding.DoctorOnboardingRequest({
          user_id: session.user.id,
          medical_license: profileData.medicalLicense,
          specialization: profileData.specialization,
          years_of_experience: parseInt(profileData.yearsOfExperience),
          hospital_affiliation: profileData.hospitalAffiliation,
        })
      });
    }

    console.log("Session user ID:", session.user.id);
    console.log("Onboarding request:", onboardingRequest.toObject());

    const response = await completeOnboarding(
            onboardingRequest,
            session.user.chime_access_token
    );
    console.log("Onboarding response:" + response);

    return NextResponse.json({
      ...response,
      userType, // Include the userType in response
      redirectTo: userType === 'patient' ? '/patient/dashboard' : '/doctor/dashboard'
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
            {error: "Failed to complete onboarding"},
            {status: 500}
    );
  }
} 