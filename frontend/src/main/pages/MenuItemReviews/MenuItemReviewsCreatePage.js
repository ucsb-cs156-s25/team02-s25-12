import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import MenuItemReviewForm from "main/components/MenuItemReviews/MenuItemReviewForm";
import { Navigate } from "react-router-dom";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function MenuItemReviewCreatePage({ storybook = false }) {
  const objectToAxiosParams = (menuitemreview) => ({
    url: "/api/menuitemreviews/post",
    method: "POST",
    params: {
      itemId: menuitemreview.itemid,
      reviewerEmail: menuitemreview.revieweremail,
      stars: menuitemreview.stars,
      comments: menuitemreview.comments,
      dateReviewed: menuitemreview.datereviewed,
    },
  });

  const onSuccess = (menuitemreview) => {
    toast(
      `New menuitemreview Created - id: ${menuitemreview.id} reviewerEmail: ${menuitemreview.reviewerEmail}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/menuitemreviews/all"], // mutation makes this key stale so that pages relying on it reload
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/menuitemreviews" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create New Menu Item Review</h1>
        <MenuItemReviewForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
