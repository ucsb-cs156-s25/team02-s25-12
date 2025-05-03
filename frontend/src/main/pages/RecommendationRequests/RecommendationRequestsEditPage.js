import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams, Navigate } from "react-router-dom";
import RecommendationRequestForm from "main/components/RecommendationRequests/RecommendationRequestForm";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function RecommendationRequestsEditPage({ storybook = false }) {
  let { id } = useParams();

  const {
    data: recommendationRequest,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/recommendationrequest?id=${id}`],
    {
      // Stryker disable next-line all : GET is the default, so mutating this to "" doesn't introduce a bug
      method: "GET",
      url: "/api/recommendationrequest",
      params: { id },
    },
  );

  const objectToAxiosPutParams = (rr) => ({
    url: "/api/recommendationrequest",
    method: "PUT",
    params: { id: rr.id },
    data: {
      requesterEmail: rr.requesterEmail,
      professorEmail: rr.professorEmail,
      explanation: rr.explanation,
      dateRequested: rr.dateRequested,
      dateNeeded: rr.dateNeeded,
      done: rr.done,
    },
  });

  const onSuccess = (rr) => {
    toast(
      `RecommendationRequest Updated - id: ${rr.id} requesterEmail: ${rr.requesterEmail}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/recommendationrequest?id=${id}`],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/recommendationrequests" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Recommendation Request</h1>
        {recommendationRequest && (
          <RecommendationRequestForm
            submitAction={onSubmit}
            buttonLabel="Update"
            initialContents={recommendationRequest}
          />
        )}
      </div>
    </BasicLayout>
  );
}
