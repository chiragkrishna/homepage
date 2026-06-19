import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const version = Number(widget.version ?? 1);

  const endpoint = version >= 2 ? "v2" : "v1";

  const { data: resultData, error: resultError } = useWidgetAPI(widget, endpoint);

  if (resultError) {
    return <Container service={service} error={resultError} />;
  }

  if (!widget.fields || widget.fields.length === 0) {
    widget.fields =
      version >= 2 ? ["online", "offline", "updates", "pending"] : ["online", "offline", "offline_alt", "total"];
  } else if (widget.fields.length > 4) {
    widget.fields = widget.fields.slice(0, 4);
  }

  if (!resultData) {
    return (
      <Container service={service}>
        {widget.fields.map((field) => (
          <Block key={field} label={`esphome.${field}`} />
        ))}
      </Container>
    );
  }

  let values = {};

  if (version >= 2) {
    const devices = Array.isArray(resultData) ? resultData : (resultData.configured ?? []);

    const total = devices.length;

    const online = devices.filter((device) => device.state === "online").length;

    const offline = devices.filter((device) => device.state !== "online").length;

    const updates = devices.filter((device) => device.update_available).length;

    const pending = devices.filter((device) => device.has_pending_changes).length;

    values = {
      online,
      offline,
      updates,
      pending,
      total,
    };
  } else {
    const total = Object.keys(resultData).length;

    const online = Object.entries(resultData).filter(([, value]) => value === true).length;

    const notOnline = Object.entries(resultData).filter(([, value]) => value !== true).length;

    const offline = Object.entries(resultData).filter(([, value]) => value === false).length;

    const unknown = Object.entries(resultData).filter(([, value]) => value === null).length;

    values = {
      online,
      offline,
      offline_alt: notOnline,
      unknown,
      total,
    };
  }

  return (
    <Container service={service}>
      {widget.fields.map((field) => (
        <Block
          key={field}
          label={`esphome.${field}`}
          value={t("common.number", {
            value: values[field] ?? 0,
          })}
        />
      ))}
    </Container>
  );
}
