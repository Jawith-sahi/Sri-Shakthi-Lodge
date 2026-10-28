"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { MessageCircle, Phone } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { AvailabilityForm } from "@/components/booking/AvailabilityForm";
import { GuestForm } from "@/components/booking/GuestForm";
import { PaymentPanel } from "@/components/booking/PaymentPanel";
import { RoomOption } from "@/components/booking/RoomOption";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { SummaryPanel } from "@/components/booking/SummaryPanel";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState, Notice } from "@/components/ui/States";
import { RoomCardSkeleton } from "@/components/ui/Skeleton";
import { getPrimaryPhone, getWhatsAppUrl } from "@/config/lodge";
import { isApiConfigured } from "@/config/environment";
import { searchAvailability } from "@/lib/api/rooms.api";
import { createBooking } from "@/lib/api/bookings.api";
import { getErrorMessage } from "@/lib/api/errors";
import { searchSchema } from "@/lib/schemas";
import { formatDate } from "@/lib/utils/format";
import { newIdempotencyKey } from "@/lib/utils/idempotency";

const SEARCH_KEYS = ["checkIn", "checkOut", "adults", "children", "rooms", "category"];

function readSearch(params) {
  const raw = Object.fromEntries(SEARCH_KEYS.map((k) => [k, params.get(k) ?? undefined]));
  if (!raw.checkIn || !raw.checkOut) return null;
  const parsed = searchSchema.safeParse({
    adults: 2,
    children: 0,
    rooms: 1,
    category: "",
    ...Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined)),
  });
  return parsed.success ? parsed.data : null;
}

/**
 * Search → Rooms → Guest details → Summary → Payment → (confirmation page).
 * Availability, prices and the final booking all come from the backend. Nothing is confirmed here:
 * the confirmation page shows "confirmed" only when the backend reports it.
 */
export function BookingFlow() {
  const t = useTranslations("booking");
  const tc = useTranslations("common");
  const tAll = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();

  const preferredRoom = params.get("room") || "";
  const initial = useMemo(() => readSearch(params), []); // eslint-disable-line react-hooks/exhaustive-deps

  const [step, setStep] = useState(initial ? "availability" : "search");
  const [search, setSearch] = useState(initial);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(Boolean(initial));
  const [loadError, setLoadError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [guest, setGuest] = useState(null);
  const [createError, setCreateError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);

  const submitLock = useRef(false);
  const idempotencyKey = useRef(newIdempotencyKey());
  const headingRef = useRef(null);

  // Live availability: never cached, cancelled when the search changes.
  useEffect(() => {
    if (!search || !isApiConfigured) {
      setLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);
    searchAvailability(search, { signal: controller.signal })
      .then((result) => setAvailability(result))
      .catch((error) => {
        if (!error.isAborted) setLoadError(error);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [search, reloadTick]);

  // Move focus to the heading whenever the step changes (screen-reader + keyboard friendly).
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const options = useMemo(() => {
    const list = availability?.results || [];
    if (!preferredRoom) return list;
    return [...list].sort((a, b) => Number(b.slug === preferredRoom) - Number(a.slug === preferredRoom));
  }, [availability, preferredRoom]);

  const nights = availability?.nights || 0;
  const phone = getPrimaryPhone();
  const whatsappUrl = getWhatsAppUrl();

  function commitSearch(values) {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(values).filter(([, v]) => v !== "" && v !== undefined).map(([k, v]) => [k, String(v)]))
    );
    window.history.replaceState(null, "", `?${query.toString()}`);
    setSearch(values);
    setSelected(null);
    setGuest(null);
    setCreateError(null);
    idempotencyKey.current = newIdempotencyKey();
    setStep("availability");
  }

  function selectRoom(option) {
    setSelected(option);
    idempotencyKey.current = newIdempotencyKey(); // new room/dates => a new booking intent
    setStep("guest");
  }

  function submitGuest(values) {
    setGuest(values);
    idempotencyKey.current = newIdempotencyKey();
    setCreateError(null);
    setStep("summary");
  }

  async function confirmBooking() {
    if (submitLock.current || created) return; // double-submit prevention
    submitLock.current = true;
    setCreating(true);
    setCreateError(null);
    try {
      const result = await createBooking(
        {
          roomId: selected.roomId,
          checkIn: search.checkIn,
          checkOut: search.checkOut,
          adults: search.adults,
          children: search.children,
          rooms: search.rooms,
          paymentMethod: guest.paymentMethod,
          guest: {
            name: guest.name.trim(),
            phone: guest.phone,
            email: guest.email || undefined,
            arrivalTime: guest.arrivalTime || undefined,
            notes: guest.notes || undefined,
          },
        },
        idempotencyKey.current
      );
      setCreated(result);
      const goesToPayment = guest.paymentMethod === "online" && Number(result.advanceAmount) > 0;
      if (goesToPayment) setStep("payment");
      else router.push(`/booking/success?ref=${encodeURIComponent(result.reference)}&token=${encodeURIComponent(result.accessToken || "")}`);
    } catch (error) {
      setCreateError({ message: getErrorMessage(error, tAll), conflict: error.code === "conflict" });
    } finally {
      submitLock.current = false;
      setCreating(false);
    }
  }

  const goConfirmation = () =>
    router.push(`/booking/success?ref=${encodeURIComponent(created.reference)}&token=${encodeURIComponent(created.accessToken || "")}`);

  // ---- Backend not connected: be honest, offer phone/WhatsApp instead of fake availability ----
  if (!isApiConfigured) {
    return (
      <EmptyState
        title={t("unavailableTitle")}
        body={t("unavailableBody")}
        action={
          <>
            {phone ? (
              <LinkButton external href={`tel:${phone.tel}`}>
                <Phone className="h-4 w-4" aria-hidden="true" /> {phone.display}
              </LinkButton>
            ) : null}
            {whatsappUrl ? (
              <LinkButton external href={whatsappUrl} variant="outline">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> {tAll("nav.whatsapp")}
              </LinkButton>
            ) : null}
            <LinkButton href="/contact" variant="outline">
              {tAll("nav.contact")}
            </LinkButton>
          </>
        }
      />
    );
  }

  const stepKey = { search: "search", availability: "availability", guest: "guest", summary: "summary", payment: "payment" }[step];

  return (
    <div>
      <StepIndicator current={stepKey} />
      <h2 ref={headingRef} tabIndex={-1} className="sr-only">
        {t(`steps.${stepKey}`)}
      </h2>

      {step === "search" ? (
        <div className="mx-auto max-w-2xl rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h3 className="mb-4 text-xl font-bold text-primary-900">{t("searchTitle")}</h3>
          <AvailabilityForm onSearch={commitSearch} initialValues={search || undefined} roomSlug={preferredRoom || undefined} />
        </div>
      ) : null}

      {step === "availability" && search ? (
        <section aria-live="polite">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-primary-900">{t("availability.title")}</h3>
              <p className="text-sm text-muted">
                {t("availability.forDates", {
                  checkIn: formatDate(search.checkIn, locale),
                  checkOut: formatDate(search.checkOut, locale),
                  nights: tc("nights", { count: nights || 1 }),
                  guests: tc("guestsCount", { count: Number(search.adults) + Number(search.children) }),
                })}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setStep("search")}>
              {t("availability.changeSearch")}
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4" role="status" aria-label={t("availability.loading")}>
              {[0, 1, 2].map((i) => (
                <RoomCardSkeleton key={i} />
              ))}
            </div>
          ) : loadError ? (
            <ErrorState
              title={t("availability.errorTitle")}
              body={getErrorMessage(loadError, tAll)}
              action={
                <Button variant="outline" onClick={() => setReloadTick((n) => n + 1)}>
                  {tc("retry")}
                </Button>
              }
            />
          ) : options.length === 0 || options.every((o) => !(Number(o.availableCount) > 0)) ? (
            <EmptyState
              title={t("availability.none")}
              body={t("availability.noneHint")}
              action={
                <>
                  <Button variant="outline" onClick={() => setStep("search")}>
                    {t("availability.changeSearch")}
                  </Button>
                  <LinkButton href="/contact">{tAll("nav.contact")}</LinkButton>
                </>
              }
            />
          ) : (
            <>
              <ul className="space-y-4">
                {options.map((option) => (
                  <RoomOption
                    key={option.roomId}
                    option={option}
                    nights={nights}
                    onSelect={selectRoom}
                    highlighted={Boolean(preferredRoom) && option.slug === preferredRoom}
                  />
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted">{t("availability.taxesNote")}</p>
            </>
          )}
        </section>
      ) : null}

      {step === "guest" && selected ? (
        <div className="mx-auto max-w-2xl">
          <GuestForm
            defaultValues={guest || undefined}
            allowOnline={!availability?.paymentOptions || availability.paymentOptions.includes("online")}
            onSubmit={submitGuest}
            onBack={() => setStep("availability")}
          />
        </div>
      ) : null}

      {step === "summary" && selected && guest ? (
        <div className="mx-auto max-w-2xl">
          <SummaryPanel
            search={search}
            option={selected}
            nights={nights}
            guest={guest}
            error={createError}
            busy={creating}
            onBack={() => setStep("guest")}
            onConfirm={confirmBooking}
            onChangeSearch={() => setStep("availability")}
          />
        </div>
      ) : null}

      {step === "payment" && created ? (
        <div className="mx-auto max-w-2xl space-y-4">
          <PaymentPanel
            reference={created.reference}
            token={created.accessToken}
            advanceAmount={created.advanceAmount}
            onVerified={goConfirmation}
          />
          <Notice tone="info">
            <button type="button" className="font-medium text-primary underline underline-offset-2" onClick={goConfirmation}>
              {t("confirmation.heading")} →
            </button>
          </Notice>
        </div>
      ) : null}
    </div>
  );
}
