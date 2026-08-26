"use client";

import { useDispatch, useSelector } from "react-redux";
import type { ApplicationDispatch, ApplicationRootState } from "./application-redux-store";

export const useApplicationDispatch = useDispatch.withTypes<ApplicationDispatch>();
export const useApplicationSelector = useSelector.withTypes<ApplicationRootState>();
