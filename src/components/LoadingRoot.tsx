import React from "react";
import LoadingOverlay from "./LoadingOverlay";
import { useLoading } from "../store/useLoading";

export default function LoadingRoot() {
  const { visible } = useLoading();
  return <LoadingOverlay visible={visible} />;
}
