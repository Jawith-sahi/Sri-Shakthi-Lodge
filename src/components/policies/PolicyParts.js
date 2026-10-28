import { getTranslations } from "next-intl/server";
import { lodge } from "@/config/lodge";
import { StatusBadge } from "@/components/ui/StatusBadge";

/** Plain-text paragraphs from CMS text (blank line = new paragraph). Never rendered as HTML. */
export function TextBlocks({ text }) {
  return text
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((para, i) => (
      <p key={i} className="whitespace-pre-line">
        {para}
      </p>
    ));
}

export async function CheckInOutPolicy() {
  const t = await getTranslations("policies");
  return (
    <>
      <p>{t("checkInText", { time: lodge.checkIn.label })}</p>
      {lodge.checkOut.verified ? (
        <p>{t("checkOutText", { time: lodge.checkOut.label })}</p>
      ) : (
        <p>
          {t("checkOutPending")} <StatusBadge tone="amber">{t("pendingBadge")}</StatusBadge>
        </p>
      )}
    </>
  );
}

export async function LateCheckoutPolicy() {
  const t = await getTranslations("policies");
  return (
    <>
      <p>{t("lateCheckoutText")}</p>
      <ul>
        <li>{t("lateFree")}</li>
        <li>{t("latePartial")}</li>
        <li>{t("lateFull")}</li>
      </ul>
    </>
  );
}

export async function ExtensionPolicy() {
  const t = await getTranslations("policies");
  return <p>{t("extensionText")}</p>;
}

export async function PaymentsPolicy() {
  const t = await getTranslations("policies");
  return <p>{t("paymentsText")}</p>;
}

export async function RulesPolicy() {
  const t = await getTranslations("policies");
  return (
    <ul>
      <li>{t("rulesNoLiquor")}</li>
      <li>{t("rulesDamage")}</li>
    </ul>
  );
}

export async function CancellationSummary() {
  const t = await getTranslations("policies");
  return (
    <>
      <p>{t("cancellationText")}</p>
      <p>
        {t("cancellationPending")} <StatusBadge tone="amber">{t("pendingBadge")}</StatusBadge>
      </p>
    </>
  );
}
