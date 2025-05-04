import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router-dom";
import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { Navigate } from "react-router-dom";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function UCSBOrganizationEditPage({ storybook = false }) {
  let { id } = useParams();

  const {
    data: ucsborganization,
    _error,
    _status,
  } = useBackend([`/api/ucsborganizations?orgCode=${id}`], {
    method: "GET",
    url: `/api/ucsborganizations`,
    params: { orgCode: id },
  });

  const objectToAxiosPutParams = (ucsborganization) => ({
    url: "/api/ucsborganizations",
    method: "PUT",
    params: { id: ucsborganization.orgCode },
    data: {
      orgCode: ucsborganization.orgCode,
      orgTranslationShort: ucsborganization.orgTranslationShort,
      orgTranslation: ucsborganization.orgTranslation,
      inactive: ucsborganization.inactive === "true",
    },
  });

  const onSuccess = (ucsborganization) => {
    toast(
      `Organization Updated - id: ${ucsborganization.orgCode} orgCode: ${ucsborganization.orgCode}`,
    );
  };

  const mutation = useBackendMutation(objectToAxiosPutParams, { onSuccess }, [
    `/api/ucsborganizations?orgCode=${id}`,
  ]);

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/ucsborganizations" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Organization</h1>
        {ucsborganization && (
          <UCSBOrganizationForm
            submitAction={onSubmit}
            buttonLabel={"Update"}
            initialContents={ucsborganization}
          />
        )}
      </div>
    </BasicLayout>
  );
}
