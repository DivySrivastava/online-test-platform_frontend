import { useContext, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { UserContext } from "../contexts/UserContext";

const WARNING_THRESHOLDS = [
  { key: "5min", ms: 5 * 60 * 1000, label: "5 minutes" },
  { key: "30sec", ms: 30 * 1000, label: "30 seconds" },
];

const TOAST_ID = "session-timeout-toast";
const AUTO_CLOSE_MS = 10 * 1000;

const WarningMessage = ({ label }) => (
  <div>
    <strong>Your session is about to expire</strong>
    <div style={{ marginTop: 4 }}>
      For your security, you'll be signed out in approximately{" "}
      <strong>{label}</strong>. Please save your work.
    </div>
  </div>
);

const SessionTimeoutToast = () => {
  const { user, logoutUser } = useContext(UserContext);
  const intervalRef = useRef(null);
  const shownRef = useRef({});
  const expiryRef = useRef(null); // track which expiry we last set up for

  useEffect(() => {
    const expiry = Number(localStorage.getItem("sessionExpiry"));

    // No user or no expiry -> stop everything
    if (!user || !expiry) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Only (re)initialize shownRef/interval if the expiry actually changed
    // (new login/session), not on every unrelated re-render.
    if (expiryRef.current === expiry && intervalRef.current) {
      return; // already running for this session, do nothing
    }

    expiryRef.current = expiry;
    if (intervalRef.current) clearInterval(intervalRef.current);
    shownRef.current = {};

    intervalRef.current = setInterval(() => {
      const remaining = expiry - Date.now();

      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        toast.dismiss(TOAST_ID);
        logoutUser();
        return;
      }

      for (const threshold of WARNING_THRESHOLDS) {
        if (remaining <= threshold.ms && !shownRef.current[threshold.key]) {
          shownRef.current[threshold.key] = true;

          toast.warning(<WarningMessage label={threshold.label} />, {
            toastId: `${TOAST_ID}-${threshold.key}`,
            position: "bottom-right",
            autoClose: AUTO_CLOSE_MS,
            closeOnClick: true,
            draggable: false,
            hideProgressBar: false,
          });
        }
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, logoutUser]);

  return null;
};

export default SessionTimeoutToast;
