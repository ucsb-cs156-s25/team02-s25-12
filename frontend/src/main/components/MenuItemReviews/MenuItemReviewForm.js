import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function MenuItemReviewForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  // Stryker disable all

  const defaultValues = initialContents
    ? {
        ...initialContents,
      }
    : {};
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues });
  // Stryker restore all

  const navigate = useNavigate();

  const testIdPrefix = "MenuItemReviewForm";

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      {initialContents && (
        <Form.Group className="mb-3">
          <Form.Label htmlFor="id">Id</Form.Label>
          <Form.Control
            data-testid={testIdPrefix + "-id"}
            id="id"
            type="text"
            {...register("id")}
            value={initialContents.id}
            disabled
          />
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label htmlFor="itemId">Item Id</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-itemId"}
          id="itemId"
          type="text"
          isInvalid={Boolean(errors.itemid)}
          {...register("itemId", {
            required: "Item Id is required",
            maxLength: {
              value: 30,
              message: "Max length 30 characters",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.itemId?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="reviewerEmail">Reviewer Email</Form.Label>
        <Form.Control
          // data-testid={testIdPrefix + "-revieweremail"}
          id="reviewerEmail"
          type="text"
          isInvalid={Boolean(errors.revieweremail)}
          {...register("reviewerEmail", {
            required: "Reviewer Email is required",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.reviewerEmail?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="stars">Stars</Form.Label>
        <Form.Control
          // data-testid={testIdPrefix + "-stars"}
          id="stars"
          type="text"
          isInvalid={Boolean(errors.stars)}
          {...register("stars", {
            required: "Stars is required",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.stars?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="comments">Comments</Form.Label>
        <Form.Control
          // data-testid={testIdPrefix + "-comments"}
          id="comments"
          type="text"
          isInvalid={Boolean(errors.comments)}
          {...register("comments", {
            required: "Comments is required",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.comments?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateReviewed">Date (iso format)</Form.Label>
        <Form.Control
          // data-testid={testIdPrefix + "-datereviewed"}
          id="dateReviewed"
          type="datetime-local"
          isInvalid={Boolean(errors.dateReviewed)}
          {...register("dateReviewed", {
            required: true,
            // pattern: isodate_regex,
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateReviewed && "Date Reviewed is required"}
        </Form.Control.Feedback>
      </Form.Group>

      <Button
        type="submit" /* <Button type="submit" data-testid={testIdPrefix + "-submit"}> */
      >
        {buttonLabel}
      </Button>
      <Button
        variant="Secondary"
        onClick={() => navigate(-1)}
        data-testid={testIdPrefix + "-cancel"}
      >
        Cancel
      </Button>
    </Form>
  );
}

export default MenuItemReviewForm;
