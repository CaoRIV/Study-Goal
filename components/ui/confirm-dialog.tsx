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
        className="fixed inset-0 m-auto w-[calc(100vw_-_2rem)] max-w-md overflow-visible bg-transparent p-0 text-neo-ink backdrop:bg-black/55"
        onCancel={(event) => {
          event.preventDefault();
          close(false);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close(false);
        }}
      >
        {pending ? (
          <div className="relative rounded-neo-lg border-neo-strong border-neo-ink bg-neo-paper p-6 shadow-neo-xl sm:p-7">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-neo border-neo-strong border-neo-ink bg-neo-coral text-neo-ink shadow-neo-sm">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => close(false)}
                  aria-label={language === "vi" ? "Đóng" : "Close"}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>

              <p className="mt-6 text-xs font-extrabold uppercase tracking-neo-wide text-neo-danger">
                {copy.eyebrow}
              </p>
              <h2
                id="confirm-dialog-title"
                className="mt-2 font-neo-display text-2xl font-neo-heavy leading-tight tracking-neo text-neo-ink"
              >
                {copy.title}
              </h2>
              <p
                id="confirm-dialog-description"
                className="mt-3 text-base font-medium leading-7 text-neo-ink-muted"
              >
                {pending.description}
              </p>
              <p className="mt-3 text-sm font-bold text-neo-danger">
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
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => close(true)}
                  className="min-w-28"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  {copy.confirm}
                </Button>
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
