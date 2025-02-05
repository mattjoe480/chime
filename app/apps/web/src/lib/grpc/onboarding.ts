import { onboarding } from "@/proto/onboarding";
import { getService, addAuthToken } from "@/lib/grpc/client";
import { ServiceError } from "@grpc/grpc-js";
import OnboardingRequest = onboarding.OnboardingRequest;
import OnboardingResponse = onboarding.OnboardingResponse;
import OnboardingClient = onboarding.OnboardingClient;

export async function completeOnboarding(
  request: OnboardingRequest,
  authToken: string
): Promise<OnboardingResponse> {
  const client = await getService<OnboardingClient>("onboarding.Onboarding");
  const metadata = addAuthToken(authToken);
  console.log("Metadata:", metadata);
  console.log("Request:", request.toObject());

  return new Promise((resolve, reject) => {
    client.CompleteOnboarding(
      request,
      metadata,
      (err: ServiceError | null, response?: OnboardingResponse) => {
        const result = handleOnboardingResponse(err, response);
        if (result instanceof onboarding.OnboardingResponse) {
          return resolve(result);
        }
        return reject(result);
      }
    );
  });
}

function handleOnboardingResponse(
  error: ServiceError | null,
  response?: OnboardingResponse
): OnboardingResponse | Error {
  if (error) {
    return new Error(`Onboarding failed: ${error.message}`);
  }
  if (!response) {
    return new Error("No response received from server");
  }
  return onboarding.OnboardingResponse.fromObject(response);
} 