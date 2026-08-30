import { create } from "zustand";
import { api } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import {  log, error } from "@/lib/logger";
type CheckoutState =
  | "IDLE"
  | "INITIATING"
  | "STK_PUSH_SENT"
  | "PENDING_CONFIRMATION"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED";

interface State {
  state: CheckoutState;
  checkoutRequestId: string | null;
  message: string | null;
  receipt: string | null;
  transactionId: number | null;
  polling: boolean;

  startCheckout: (payload: any) => Promise<void>;
  pollStatusOnce: (checkoutRequestId: string) => Promise<void>;
  stopPolling: () => void;
  reset: () => void;
}

export const useCheckoutStore = create<State>((set, get) => {
  let pollTimer: any = null;

  const startPolling = (checkoutRequestId: string) => {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(async () => {
      try {
        await get().pollStatusOnce(checkoutRequestId);
      } catch (e) {
        // ignore per-iteration errors
      }
    }, 3000);
  };

  const stopPollingInternal = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    set({ polling: false });
  };

  return {
    state: "IDLE",
    checkoutRequestId: null,
    message: null,
    receipt: null,
    transactionId: null,
    polling: false,

    startCheckout: async (payload) => {
      if (get().state !== "IDLE") return;
      set({ state: "INITIATING", message: null });
      try {
        const data = await useCartStore.getState().checkout(payload);
        console.log("src/store/checkoutStore.ts: checkoutStore.startCheckout server response=", data);
        const checkoutRequestId = data?.checkout_request_id || data?.checkoutRequestId || data?.checkoutRequestId;
        const responseStatus = data?.status || data?.transaction_status || "PENDING";
        if (!checkoutRequestId) {
          error("src/store/checkoutStore.ts: unexpected checkout response, missing checkout_request_id, server response=", data);
          set({ state: "FAILED", message: "Server did not return a checkout request ID" });
          return;
        }

        // Payment initiation is not proof of success. The transaction remains pending until
        // the provider callback or the server polling endpoint confirms a terminal state.
        set({
          checkoutRequestId: String(checkoutRequestId),
          state: responseStatus === "SUCCESS" ? "SUCCESS" : "STK_PUSH_SENT",
          message: data?.message || data?.detail || "Payment initiated. Awaiting confirmation.",
          polling: true,
        });

        if (responseStatus === "SUCCESS") {
          set({ state: "SUCCESS", receipt: data?.receipt || null, transactionId: data?.transactionId || null });
          stopPollingInternal();
          return;
        }

        startPolling(String(checkoutRequestId));
        await get().pollStatusOnce(String(checkoutRequestId));
      } catch (e: any) {
        error("src/store/checkoutStore.ts: checkoutStore.startCheckout error=", e);
        set({ state: "FAILED", message: e?.message || "Failed to initiate checkout" });
      }
    },

    pollStatusOnce: async (checkoutRequestId) => {
      try {
        const resp = await api<any>(`/payments/status/?checkout_request_id=${encodeURIComponent(checkoutRequestId)}`);
        const status = resp?.status;
        const msg = resp?.message || null;
        if (!status) return;
        if (status === "PENDING") {
          set({
            state: "PENDING_CONFIRMATION",
            message: msg || "Payment initiated. Awaiting confirmation from M-Pesa.",
            receipt: resp?.receipt || null,
            transactionId: resp?.transactionId || null,
          });
          return;
        }
        if (status === "SUCCESS") {
          set({ state: "SUCCESS", message: msg || "Payment confirmed.", receipt: resp?.receipt || null, transactionId: resp?.transactionId || null });
          // finalize: ensure cart cleared only after confirmed success
          try {
            await useCartStore.getState().clearCart();
          } catch (e) {
            // ignore
          }
          stopPollingInternal();
          return;
        }
        if (status === "FAILED" || status === "CANCELLED") {
          set({ state: status === "FAILED" ? "FAILED" : "CANCELLED", message: msg });
          stopPollingInternal();
          return;
        }
      } catch (e: any) {
        error("src/store/checkoutStore.ts: pollStatusOnce error=", e);
        // network or 404 — keep polling. If 404, backend hasn't created the record yet.
        // If repeated failures are seen, UI can expose retry.
        // Do not flip to FAILED here to avoid false negatives.
      }
    },

    stopPolling: () => {
      stopPollingInternal();
    },

    reset: () => {
      stopPollingInternal();
      set({ state: "IDLE", checkoutRequestId: null, message: null, receipt: null, transactionId: null });
    },
  };
});

export default useCheckoutStore;
