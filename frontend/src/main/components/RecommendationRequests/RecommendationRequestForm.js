// src/main/components/RecommendationRequests/RecommendationRequestForm.js
import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function RecommendationRequestForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });
  // Stryker restore all
  const navigate = useNavigate();
  const testIdPrefix = "RecommendationRequestForm";

  // Stryker disable Regex
  const isodate_regex =
    /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/i;
  // Stryker restore Regex

  const onSubmit = (data) => submitAction(data);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {initialContents && (
        <Form.Group className="mb-3">
          <Form.Label htmlFor="id">Id</Form.Label>
          <Form.Control
            data-testid={`${testIdPrefix}-id`}
            id="id"
            type="text"
            {...register("id")}
            value={initialContents.id}
            disabled
          />
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label htmlFor="requesterEmail">Requester Email</Form.Label>
        <Form.Control
          data-testid={`${testIdPrefix}-requesterEmail`}
          id="requesterEmail"
          type="email"
          isInvalid={Boolean(errors.requesterEmail)}
          {...register("requesterEmail", { required: true })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.requesterEmail && "Requester Email is required."}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="professorEmail">Professor Email</Form.Label>
        <Form.Control
          data-testid={`${testIdPrefix}-professorEmail`}
          id="professorEmail"
          type="email"
          isInvalid={Boolean(errors.professorEmail)}
          {...register("professorEmail", { required: true })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.professorEmail && "Professor Email is required."}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="explanation">Explanation</Form.Label>
        <Form.Control
          data-testid={`${testIdPrefix}-explanation`}
          id="explanation"
          as="textarea"
          rows={3}
          isInvalid={Boolean(errors.explanation)}
          {...register("explanation", { required: true })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.explanation && "Explanation is required."}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateRequested">
          Date Requested&nbsp;
          <small className="text-muted">(ISO)</small>
        </Form.Label>
        <Form.Control
          data-testid={`${testIdPrefix}-dateRequested`}
          id="dateRequested"
          type="text"
          isInvalid={Boolean(errors.dateRequested)}
          {...register("dateRequested", {
            required: true,
            pattern: isodate_regex,
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateRequested &&
            "Date Requested is required and must be ISO‑8601"}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateNeeded">
          Date Needed&nbsp;
          <small className="text-muted">(ISO)</small>
        </Form.Label>
        <Form.Control
          data-testid={`${testIdPrefix}-dateNeeded`}
          id="dateNeeded"
          type="text"
          isInvalid={Boolean(errors.dateNeeded)}
          {...register("dateNeeded", {
            required: true,
            pattern: isodate_regex,
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateNeeded &&
            "Date Needed is required and must be ISO‑8601"}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check
          data-testid={`${testIdPrefix}-done`}
          id="done"
          label="Done?"
          type="checkbox"
          {...register("done")}
        />
      </Form.Group>

      <Button data-testid={`${testIdPrefix}-submit`} type="submit">
        {buttonLabel}
      </Button>{" "}
      <Button
        data-testid={`${testIdPrefix}-cancel`}
        variant="secondary"
        onClick={() => navigate(-1)}
      >
        Cancel
      </Button>
    </Form>
  );
}

export default RecommendationRequestForm;
