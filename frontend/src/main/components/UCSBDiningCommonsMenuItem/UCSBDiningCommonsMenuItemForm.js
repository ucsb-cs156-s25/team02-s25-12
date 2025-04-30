import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function UCSBDiningCommonsMenuItemForm({
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

  const testIdPrefix = "UCSBDiningCommonsMenuItemForm";

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Row>
        {initialContents && (
          <Col>
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
          </Col>
        )}

        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="diningCommonsCode">
              diningCommonsCode
            </Form.Label>
            <Form.Control
              data-testid={testIdPrefix + "-diningCommonsCode"}
              id="diningCommonsCode"
              type="text"
              isInvalid={Boolean(errors.diningCommonsCode)}
              {...register("diningCommonsCode", {
                required: "diningCommonsCode is required.",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.diningCommonsCode?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="name">Name</Form.Label>
            <Form.Control
              data-testid={testIdPrefix + "-name"}
              id="name"
              type="text"
              isInvalid={Boolean(errors.name)}
              {...register("name", {
                required: "Name is required.",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="name">Name</Form.Label>
            <Form.Control
              data-testid={testIdPrefix + "-name"}
              id="name"
              type="text"
              isInvalid={Boolean(errors.name)}
              {...register("name", {
                required: "Name is required.",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="station">Station</Form.Label>
            <Form.Control
              data-testid={testIdPrefix + "-station"}
              id="name"
              type="text"
              isInvalid={Boolean(errors.name)}
              {...register("name", {
                required: "Name is required.",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button
            type="submit"
            data-testid="UCSBDiningCommonsMenuItemForm-submit"
          >
            {buttonLabel}
          </Button>
          <Button
            variant="Secondary"
            onClick={() => navigate(-1)}
            data-testid="UCSBDiningCommonsMenuItemForm-cancel"
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default UCSBDiningCommonsMenuItemForm;
