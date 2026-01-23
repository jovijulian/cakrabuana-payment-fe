import type { Metadata } from "next";
import React from "react";
import Key from "./key";

export const metadata: Metadata = {
    title:
        "Payment Portal | Cakra Buana",
};

export default function KeyPage() {
    return (
        <>
            <Key />
        </>
    );
}
