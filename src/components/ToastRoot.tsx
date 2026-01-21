import React from "react";
import ToastMessage from "./ToastMessage";
import { useToast } from "../store/useToast";

export default function ToastRoot() {
  const { toast, hide } = useToast();

  return (
    <ToastMessage
      visible={!!toast}
      type={toast?.type}
      message={toast?.message ?? ""}
      onHide={hide}
    />
  );
}
