"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type ConfirmOptions = {
  description: string;
};

type PendingConfirmation = ConfirmOptions & {
  resolve: (confirmed: boolean) => void;
};

const ConfirmDialogContext = createContext<
  ((options: ConfirmOptions) => Promise<boolean>) | null
>(null);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirmation | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setPending({ ...options, resolve });
      }),
    []
  );

  const close = useCallback(
    (confirmed: boolean) => {
      if (!pending) return;

      pending.resolve(confirmed);
      setPending(null);
      dialogRef.current?.close();
    },
    [pending]
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !pending) return;

    if (!dialog.open) {
      dialog.showModal();
    }

    requestAnimationFrame(() => cancelButtonRef.current?.focus());
  }, [pending]);

  const language =
    typeof document !== "undefined" && document.documentElement.lang === "vi"
      ? "vi"
      : "en";
  const copy =
    language === "vi"
      ? {
          eyebrow: "Xác nhận xóa",
          title: "Bạn có chắc muốn xóa?",
          warning: "Dữ liệu đã xóa sẽ không thể khôi phục.",
          cancel: "Giữ lại",
          confirm: "Xóa"
        }
      : {
          eyebrow: "Confirm deletion",
          title: "Are you sure you want to delete this?",
          warning: "Deleted data cannot be recovered.",
          cancel: "Keep it",
          confirm: "Delete"
        };

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}
      <dialog
        ref={dialogRef}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="fixed inset-0 m-auto w-[calc(100vw_-_2rem)] max-w-md overflow-visible bg-transparent p-0 text-ink backdrop:bg-brand-navy/35 backdrop:backdrop-blur-sm"
        onCancel={(event) => {
          event.preventDefault();
          close(false);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close(false);
        }}
      >
        {pending ? (
          <div className="relative overflow-hidden rounded-[2rem] border border-brand-coral/30 bg-surface-panel p-6 shadow-[0_32px_100px_rgba(15,23,42,0.24)] sm:p-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-brand-coral-soft/60 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -left-20 h-52 w-52 rounded-full bg-brand-cyan/10 blur-3xl"
            />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-coral-soft/65 text-signal-red ring-1 ring-brand-coral/25">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                </div>
                <button
                  type="button"
                  onClick={() => close(false)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors duration-200 hover:bg-brand-coral-soft/45 hover:text-signal-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                  aria-label={language === "vi" ? "Đóng" : "Close"}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-signal-red">
                {copy.eyebrow}
              </p>
              <h2
                id="confirm-dialog-title"
                className="mt-2 font-display text-2xl font-semibold leading-tight text-ink"
              >
                {copy.title}
              </h2>
              <p
                id="confirm-dialog-description"
                className="mt-3 text-base leading-7 text-ink-muted"
              >
                {pending.description}
              </p>
              <p className="mt-3 text-sm font-medium text-signal-red">
                {copy.warning}
              </p>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  ref={cancelButtonRef}
                  type="button"
                  variant="secondary"
                  onClick={() => close(false)}
                  className="sm:min-w-28"
                >
                  {copy.cancel}
                </Button>
                <button
                  type="button"
                  onClick={() => close(true)}
                  className="inline-flex h-11 min-w-28 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-deep-red px-6 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(153,27,27,0.2)] transition-colors duration-200 hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-coral focus-visible:ring-offset-2 focus-visible:ring-offset-white active:bg-red-900"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  {copy.confirm}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const confirm = useContext(ConfirmDialogContext);

  if (!confirm) {
    throw new Error("useConfirmDialog must be used within ConfirmDialogProvider");
  }

  return confirm;
}
