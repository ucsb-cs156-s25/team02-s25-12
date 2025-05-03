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

  // Stryker disable Regex
  const isodate_regex =
    /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/i;
  // Stryker restore Regex

  const navigate = useNavigate();
  const testIdPrefix = "RecommendationRequestForm";

  const onSubmit = (data) => submitAction(data);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
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
        <Form.Label htmlFor="requesterEmail">Requester Email</Form.Label>
        <Form.Control
          id="requesterEmail"
          type="email"
          isInvalid={Boolean(errors.requesterEmail)}
          {...register("requesterEmail", {
            required: "Requester Email is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.requesterEmail?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="professorEmail">Professor Email</Form.Label>
        <Form.Control
          id="professorEmail"
          type="email"
          isInvalid={Boolean(errors.professorEmail)}
          {...register("professorEmail", {
            required: "Professor Email is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.professorEmail?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="explanation">Explanation</Form.Label>
        <Form.Control
          id="explanation"
          as="textarea"
          rows={3}
          isInvalid={Boolean(errors.explanation)}
          {...register("explanation", {
            required: "Explanation is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.explanation?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateRequested">
          Date Requested
          <small className="text-muted">
            (ISO: YYYY-MM-DDTHH:MM or YYYY-MM-DDTHH:MM:SS)
          </small>
        </Form.Label>
        <Form.Control
          id="dateRequested"
          type="text"
          isInvalid={Boolean(errors.dateRequested)}
          {...register("dateRequested", {
            required: "Date Requested is required.",
            pattern: {
              value: isodate_regex,
              message:
                "Date must be in ISO format (YYYY-MM-DDTHH:MM or YYYY-MM-DDTHH:MM:SS)",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateRequested?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateNeeded">
          Date Needed
          <small className="text-muted">
            (ISO: YYYY-MM-DDTHH:MM or YYYY-MM-DDTHH:MM:SS)
          </small>
        </Form.Label>
        <Form.Control
          id="dateNeeded"
          type="text"
          isInvalid={Boolean(errors.dateNeeded)}
          {...register("dateNeeded", {
            required: "Date Needed is required.",
            pattern: {
              value: isodate_regex,
              message:
                "Date must be in ISO format (YYYY-MM-DDTHH:MM or YYYY-MM-DDTHH:MM:SS)",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateNeeded?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check
          id="done"
          label="Done?"
          type="checkbox"
          {...register("done")}
        />
      </Form.Group>

      <Button type="submit">{buttonLabel}</Button>
      <Button
        variant="secondary"
        onClick={() => navigate(-1)}
        data-testid={testIdPrefix + "-cancel"}
      >
        Cancel
      </Button>
    </Form>
  );
}

export default RecommendationRequestForm;
