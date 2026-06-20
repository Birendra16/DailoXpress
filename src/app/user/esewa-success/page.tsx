import { Suspense } from "react";
import EsewaSuccessContent from "./EsewaSuccessContent";


export default function EsewaSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EsewaSuccessContent/>
        </Suspense>
    )
}
