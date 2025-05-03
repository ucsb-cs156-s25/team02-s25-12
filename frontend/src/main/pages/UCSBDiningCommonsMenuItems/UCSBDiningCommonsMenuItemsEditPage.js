import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router-dom";
import UCSBDiningCommonsMenuItemForm from "main/components/UCSBDiningCommonsMenuItems/UCSBDiningCommonsMenuItemForm";
import { Navigate } from "react-router-dom";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function UCSBDiningCommonsMenuItemEditPage({
  storybook = false,
}) {
  let { id } = useParams();

  const {
    data: ucsbdiningcommonsmenuitem,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/ucsbdiningcommonsmenuitems?id=${id}`],
    {
      // Stryker disable next-line all : GET is the default, so mutating this to "" doesn't introduce a bug
      method: "GET",
      url: `/api/ucsbdiningcommonsmenuitems`,
      params: {
        id,
      },
    },
  );

  const objectToAxiosPutParams = (ucsbdiningcommonsmenuitem) => ({
    url: "/api/ucsbdiningcommonsmenuitems",
    method: "PUT",
    params: {
      id: ucsbdiningcommonsmenuitem.id,
    },
    data: {
      diningCommonsCode: ucsbdiningcommonsmenuitem.diningCommonsCode,
      name: ucsbdiningcommonsmenuitem.name,
      station: ucsbdiningcommonsmenuitem.station,
    },
  });

  const onSuccess = (ucsbdiningcommonsmenuitem) => {
    toast(
      `Menu Item Updated - id: ${ucsbdiningcommonsmenuitem.id} name: ${ucsbdiningcommonsmenuitem.name}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/ucsbdiningcommonsmenuitems?id=${id}`],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/ucsbdiningcommonsmenuitems" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Menu Item</h1>
        {ucsbdiningcommonsmenuitem && (
          <UCSBDiningCommonsMenuItemForm
            submitAction={onSubmit}
            buttonLabel={"Update"}
            initialContents={ucsbdiningcommonsmenuitem}
          />
        )}
      </div>
    </BasicLayout>
  );
}
