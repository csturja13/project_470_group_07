/**
 * soldBannerStyle: "none" | "no_delivery_discount" | "free_delivery"
 * When awaitingAdminSoldLabel is true and banner is still "none", show a reserved state (no SOLD OUT graphic).
 */
export default function PetSoldOverlay({
  soldBannerStyle = "none",
  awaitingAdminSoldLabel = false,
  className = ""
}) {
  const showSoldRibbon = soldBannerStyle === "no_delivery_discount" || soldBannerStyle === "free_delivery";
  const showFreeExtra = soldBannerStyle === "free_delivery";
  const showReservedOnly = awaitingAdminSoldLabel && soldBannerStyle === "none";

  if (!showSoldRibbon && !showReservedOnly) return null;

  return (
    <div className={`petSoldOverlayRoot ${className}`}>
      {showReservedOnly ? (
        <div className="petReservedBanner">Reserved — payment received</div>
      ) : (
        <>
          <div className="petSoldRibbon">SOLD OUT!</div>
          {showFreeExtra ? <div className="petSoldFreeDelivery">FREE DELIVERY</div> : null}
        </>
      )}
    </div>
  );
}
