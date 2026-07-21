"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type DialogContextValue = {
  dialogRef: React.MutableRefObject<HTMLDialogElement | null>;
  descriptionId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext(component: string) {
  const context = React.useContext(DialogContext);

  if (!context) {
    throw new Error(`${component} must be used within Dialog`);
  }

  return context;
}

export interface DialogProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

function Dialog({
  children,
  defaultOpen = false,
  onOpenChange,
  open: controlledOpen
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const reactId = React.useId();
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) setUncontrolledOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  const value = React.useMemo<DialogContextValue>(
    () => ({
      dialogRef,
      descriptionId: `${reactId}-description`,
      open,
      setOpen,
      titleId: `${reactId}-title`
    }),
    [open, reactId, setOpen]
  );

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

export interface DialogTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ asChild = false, onClick, ...props }, ref) => {
    const { setOpen } = useDialogContext("DialogTrigger");
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : "button"}
        data-slot="dialog-trigger"
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) setOpen(true);
        }}
        {...props}
      />
    );
  }
);
DialogTrigger.displayName = "DialogTrigger";

export interface DialogContentProps
  extends React.DialogHTMLAttributes<HTMLDialogElement> {
  closeLabel?: string;
  hideCloseButton?: boolean;
}

const DialogContent = React.forwardRef<HTMLDialogElement, DialogContentProps>(
  (
    {
      children,
      className,
      closeLabel = "Close dialog",
      hideCloseButton = false,
      onCancel,
      onClick,
      onClose,
      ...props
    },
    forwardedRef
  ) => {
    const { dialogRef, descriptionId, open, setOpen, titleId } =
      useDialogContext("DialogContent");

    const setRefs = React.useCallback(
      (node: HTMLDialogElement | null) => {
        dialogRef.current = node;

        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [dialogRef, forwardedRef]
    );

    React.useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      if (open && !dialog.open) dialog.showModal();
      if (!open && dialog.open) dialog.close();
    }, [dialogRef, open]);

    return (
      <dialog
        ref={setRefs}
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        data-slot="dialog-content"
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto bg-transparent p-0 text-neo-ink backdrop:bg-black/55"
        onCancel={(event) => {
          onCancel?.(event);
          if (event.defaultPrevented) return;
          event.preventDefault();
          setOpen(false);
        }}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && event.target === event.currentTarget) {
            setOpen(false);
          }
        }}
        onClose={(event) => {
          onClose?.(event);
          if (!event.defaultPrevented && open) setOpen(false);
        }}
        {...props}
      >
        <div
          className={cn(
            "relative rounded-neo-lg border-neo-strong border-neo-ink bg-neo-paper p-5 shadow-neo-xl sm:p-6",
            className
          )}
        >
          {!hideCloseButton ? (
            <button
              type="button"
              data-slot="dialog-close"
              aria-label={closeLabel}
              className="absolute right-4 top-4 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-neo-sm border-2 border-neo-ink bg-neo-white text-neo-ink shadow-neo-xs transition-[background-color,box-shadow,transform] duration-neo-fast ease-neo-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-neo-yellow hover:shadow-neo-sm focus-visible:outline-none focus-visible:shadow-neo-focus active:translate-x-0.5 active:translate-y-0.5 active:shadow-neo-pressed"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
          {children}
        </div>
      </dialog>
    );
  }
);
DialogContent.displayName = "DialogContent";

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="dialog-header"
    className={cn("space-y-2 pr-10 text-left", className)}
    {...props}
  />
));
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const { titleId } = useDialogContext("DialogTitle");

  return (
    <h2
      ref={ref}
      id={titleId}
      data-slot="dialog-title"
      className={cn(
        "font-neo-display text-2xl font-neo-heavy leading-tight tracking-neo",
        className
      )}
      {...props}
    />
  );
});
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { descriptionId } = useDialogContext("DialogDescription");

  return (
    <p
      ref={ref}
      id={descriptionId}
      data-slot="dialog-description"
      className={cn("text-sm font-medium leading-6 text-neo-ink-muted", className)}
      {...props}
    />
  );
});
DialogDescription.displayName = "DialogDescription";

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="dialog-footer"
    className={cn(
      "mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
));
DialogFooter.displayName = "DialogFooter";

export interface DialogCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ asChild = false, onClick, ...props }, ref) => {
    const { setOpen } = useDialogContext("DialogClose");
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : "button"}
        data-slot="dialog-close"
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) setOpen(false);
        }}
        {...props}
      />
    );
  }
);
DialogClose.displayName = "DialogClose";

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
};
